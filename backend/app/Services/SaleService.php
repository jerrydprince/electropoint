<?php

namespace App\Services;

use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Warehouse;
use App\Models\Customer;
use App\Models\CustomerCredit;
use App\Models\Warranty;
use App\Models\CashRegister;
use App\Models\CashRegisterMovement;
use Illuminate\Support\Facades\DB;
use Exception;
use Illuminate\Support\Str;
use Carbon\Carbon;

class SaleService
{
    protected $inventoryService;
    protected $accountingService;

    public function __construct(InventoryService $inventoryService, AccountingService $accountingService)
    {
        $this->inventoryService = $inventoryService;
        $this->accountingService = $accountingService;
    }

    /**
     * Process a complete sale transaction atomically.
     */
    public function processSale(array $data, int $userId, int $companyId, int $branchId, $warehouse, string $uuid = null)
    {
        return DB::transaction(function () use ($data, $userId, $companyId, $branchId, $warehouse, $uuid) {
            $customer = null;
            if (!empty($data['customer_id'])) {
                $customer = Customer::find($data['customer_id']);
                if (!$customer) throw new Exception("Customer not found.");
            }

            $items = $data['items'] ?? [];
            if (empty($items)) {
                throw new Exception("Sale must contain at least one item.");
            }

            $subtotal = 0;
            $totalDiscount = 0;
            $taxRate = 0.075; // 7.5% Tax
            
            $validatedItems = [];

            // 1-7: Validations and Calculations
            foreach ($items as $item) {
                $product = Product::find($item['product_id']);
                if (!$product) throw new Exception("Product ID {$item['product_id']} not found.");
                
                $qty = (int)$item['quantity'];
                if ($qty <= 0) throw new Exception("Invalid quantity for product {$product->name}.");

                // Validate serial numbers if required
                $serials = $item['serials'] ?? [];
                if ($product->serial_tracking && count($serials) !== $qty) {
                    throw new Exception("Product '{$product->name}' requires exactly {$qty} serial numbers.");
                }

                // Price & Discount validation
                $price = (float)$product->selling_price;
                $discount = (float)($item['discount_amount'] ?? 0);
                
                if ($discount > ($price * $qty)) {
                    throw new Exception("Discount cannot exceed total price for {$product->name}.");
                }

                $itemSubtotal = ($price * $qty);
                $itemTotal = $itemSubtotal - $discount;
                $itemTax = $itemTotal * $taxRate; // Tax-exclusive calculation on discounted amount
                $itemTotalWithTax = $itemTotal + $itemTax;

                $subtotal += $itemSubtotal;
                $totalDiscount += $discount;

                $validatedItems[] = [
                    'product' => $product,
                    'quantity' => $qty,
                    'unit_price' => $price,
                    'subtotal' => $itemSubtotal,
                    'discount_amount' => $discount,
                    'tax_amount' => $itemTax,
                    'total' => $itemTotalWithTax,
                    'serials' => $serials
                ];
            }

            $totalTax = ($subtotal - $totalDiscount) * $taxRate;
            $grandTotal = $subtotal - $totalDiscount + $totalTax;

            $paymentsInput = $data['payments'] ?? [];
            // Fallback for older single-payment format
            if (empty($paymentsInput) && isset($data['payment_amount'])) {
                $paymentsInput = [[
                    'amount' => $data['payment_amount'],
                    'method' => $data['payment_method'] ?? 'cash',
                    'reference' => $data['payment_reference'] ?? null
                ]];
            }

            $totalTendered = 0;
            $creditAmount = 0;
            $corporateCreditAmount = 0;
            foreach ($paymentsInput as $p) {
                $amt = (float)($p['amount'] ?? 0);
                $totalTendered += $amt;
                if (($p['method'] ?? '') === 'credit') {
                    $creditAmount += $amt;
                }
                if (($p['method'] ?? '') === 'corporate_credit') {
                    $corporateCreditAmount += $amt;
                }
            }

            if ($creditAmount > 0 || $corporateCreditAmount > 0) {
                if (!$customer) {
                    throw new Exception("A customer must be selected to use Credit or Corporate Credit payment.");
                }

                if ($corporateCreditAmount > 0) {
                    $corporateCustomer = null;
                    if ($customer->customer_type === 'corporate') {
                        $corporateCustomer = $customer;
                    } else if ($customer->corporate_account_id) {
                        $corporateCustomer = Customer::find($customer->corporate_account_id);
                    }

                    if (!$corporateCustomer) {
                        throw new Exception("Customer is not linked to a corporate account.");
                    }
                    
                    $outstanding = CustomerCredit::where('customer_id', $corporateCustomer->id)
                        ->where('status', '!=', 'paid')
                        ->sum('balance');
                        
                    if ($corporateCustomer->credit_limit > 0 && ($outstanding + $corporateCreditAmount) > $corporateCustomer->credit_limit) {
                        throw new Exception("Corporate Credit limit exceeded. Corporate account has an outstanding balance of ₦".number_format($outstanding, 2));
                    }
                }

                if ($creditAmount > 0) {
                    $outstanding = CustomerCredit::where('customer_id', $customer->id)
                        ->where('status', '!=', 'paid')
                        ->sum('balance');
                        
                    if ($customer->credit_limit > 0 && ($outstanding + $creditAmount) > $customer->credit_limit) {
                        throw new Exception("Credit limit exceeded. Customer has an outstanding balance of ₦".number_format($outstanding, 2));
                    }
                }
            }

            $paymentStatus = 'unpaid';
            if ($totalTendered >= $grandTotal) $paymentStatus = 'paid';
            else if ($totalTendered > 0) $paymentStatus = 'partial';
            
            $saleStatus = $data['status'] ?? 'completed';
            $isDraft = $saleStatus === 'draft';

            // 8. Create Sale
            $sale = Sale::create([
                'uuid' => $uuid,
                'company_id' => $companyId,
                'branch_id' => $branchId,
                'user_id' => $userId,
                'customer_id' => $customer ? $customer->id : null,
                'invoice_number' => 'INV-' . strtoupper(Str::random(8)), // Unique invoice
                'subtotal' => $subtotal,
                'discount_amount' => $totalDiscount,
                'tax_amount' => $totalTax,
                'grand_total' => $grandTotal,
                'status' => $saleStatus,
                'payment_status' => $paymentStatus,
                'notes' => $data['notes'] ?? null,
            ]);

            // 9-11. Create Sale Items, Process Inventory, Process Serials
            foreach ($validatedItems as $vItem) {
                $product = $vItem['product'];
                
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $product->id,
                    'quantity' => $vItem['quantity'],
                    'unit_price' => $vItem['unit_price'],
                    'subtotal' => $vItem['subtotal'],
                    'discount_amount' => $vItem['discount_amount'],
                    'tax_amount' => $vItem['tax_amount'],
                    'total' => $vItem['total'],
                    'serials' => $vItem['serials']
                ]);

                // Deduct Inventory ONLY if it is not a draft (quotation)
                if (!$isDraft) {
                    $this->inventoryService->adjustStock(
                        $product,
                        $warehouse,
                        -$vItem['quantity'], // Negative for sale
                        'sale',
                        $sale->invoice_number,
                        'POS Sale',
                        $vItem['serials']
                    );

                    // Generate Warranties for Serialized Products
                    if ($product->warranty_months > 0 && !empty($vItem['serials'])) {
                        foreach ($vItem['serials'] as $serial) {
                            $productSerial = \App\Models\ProductSerial::where('product_id', $product->id)
                                ->where('serial_number', $serial)
                                ->first();

                            Warranty::create([
                                'warranty_number' => 'WAR-' . strtoupper(Str::random(8)),
                                'product_id' => $product->id,
                                'sale_id' => $sale->id,
                                'customer_id' => $customer ? $customer->id : null,
                                'product_serial_id' => $productSerial ? $productSerial->id : null,
                                'serial_number' => $serial,
                                'purchase_date' => Carbon::now(),
                                'start_date' => Carbon::now(),
                                'expiry_date' => Carbon::now()->addMonths($product->warranty_months),
                                'status' => 'active',
                                'terms' => "Standard {$product->warranty_months}-month warranty."
                            ]);
                        }
                    }
                }
            }

            // 12. Record Payments
            foreach ($paymentsInput as $p) {
                $amt = (float)($p['amount'] ?? 0);
                if ($amt > 0) {
                    Payment::create([
                        'company_id' => $companyId,
                        'sale_id' => $sale->id,
                        'customer_id' => $customer ? $customer->id : null,
                        'amount' => $amt,
                        'payment_method' => $p['method'] ?? 'cash',
                        'reference_number' => $p['reference'] ?? null,
                    ]);

                    // Automatically hook into Cash Register if method is cash
                    if (($p['method'] ?? 'cash') === 'cash' && !$isDraft) {
                        $activeRegister = CashRegister::where('user_id', $userId)->where('status', 'open')->first();
                        if ($activeRegister) {
                            CashRegisterMovement::create([
                                'cash_register_id' => $activeRegister->id,
                                'type' => 'sale',
                                'amount' => $amt,
                                'reference' => $sale->invoice_number,
                                'notes' => "POS Sale"
                            ]);
                        }
                    }
                }
            }

            // Record Customer Credit if applicable
            if ($creditAmount > 0 && $customer) {
                CustomerCredit::create([
                    'customer_id' => $customer->id,
                    'sale_id' => $sale->id,
                    'amount' => $creditAmount,
                    'balance' => $creditAmount,
                    'due_date' => Carbon::now()->addDays(30), // Default 30 days
                    'status' => 'open'
                ]);
            }

            // Record Corporate Credit if applicable
            if ($corporateCreditAmount > 0 && isset($corporateCustomer)) {
                CustomerCredit::create([
                    'customer_id' => $corporateCustomer->id,
                    'sale_id' => $sale->id,
                    'amount' => $corporateCreditAmount,
                    'balance' => $corporateCreditAmount,
                    'due_date' => Carbon::now()->addDays(30), // Default 30 days
                    'status' => 'open'
                ]);
            }

            // 13. Update Customer Loyalty (Audit Log / Meta)
            if ($customer && $paymentStatus === 'paid' && !$isDraft) {
                // 1 point per 1000 spent
                $points = floor($grandTotal / 1000);
                $customer->loyalty_points += $points;
                $customer->save();
            }

            // 13.5 Post to Accounting Engine
            $saleWithRelations = $sale->load(['items.product', 'payments', 'customer']);
            $this->accountingService->postSale($saleWithRelations);

            // 14. Commit transaction (handled implicitly by DB::transaction returning)
            return $saleWithRelations;
        });
    }
}
