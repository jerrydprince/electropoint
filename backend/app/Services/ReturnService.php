<?php

namespace App\Services;

use App\Models\SalesReturn;
use App\Models\SalesReturnItem;
use App\Models\Sale;
use App\Models\Warehouse;
use App\Models\ProductSerial;
use App\Models\Refund;
use Illuminate\Support\Facades\DB;
use Exception;
use Illuminate\Support\Str;

class ReturnService
{
    protected $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    public function createReturn(Sale $sale, array $itemsData, $notes, $userId)
    {
        return DB::transaction(function () use ($sale, $itemsData, $notes, $userId) {
            $totalAmount = 0;
            
            $return = SalesReturn::create([
                'sale_id' => $sale->id,
                'customer_id' => $sale->customer_id,
                'branch_id' => $sale->branch_id,
                'user_id' => $userId,
                'return_number' => 'RET-' . strtoupper(Str::random(8)),
                'status' => 'pending',
                'notes' => $notes,
            ]);

            foreach ($itemsData as $item) {
                $saleItem = $sale->items()->find($item['sale_item_id']);
                if (!$saleItem) throw new Exception("Sale item not found.");
                if ($item['quantity'] > $saleItem->quantity) {
                    throw new Exception("Cannot return more than purchased.");
                }

                $total = $item['quantity'] * $saleItem->unit_price; // Ignore tax/discount for simplicity, or we calculate properly.
                $totalAmount += $total;

                SalesReturnItem::create([
                    'sales_return_id' => $return->id,
                    'sale_item_id' => $saleItem->id,
                    'product_id' => $saleItem->product_id,
                    'quantity' => $item['quantity'],
                    'serials' => $item['serials'] ?? [],
                    'reason' => $item['reason'],
                    'condition' => $item['condition'],
                    'unit_price' => $saleItem->unit_price,
                    'total' => $total,
                ]);
            }

            $return->update(['total_amount' => $totalAmount]);
            return $return->load('items.product');
        });
    }

    public function approveReturn(SalesReturn $return, $warehouseId, $userId)
    {
        return DB::transaction(function () use ($return, $warehouseId, $userId) {
            if ($return->status !== 'pending' && $return->status !== 'inspected') {
                throw new Exception("Return is not in a valid state to be approved.");
            }

            $warehouse = Warehouse::find($warehouseId);
            if (!$warehouse) throw new Exception("Restock warehouse not found.");

            foreach ($return->items as $item) {
                // If it's serial tracked, update serials
                if (!empty($item->serials)) {
                    foreach ($item->serials as $sn) {
                        $serial = ProductSerial::where('product_id', $item->product_id)
                            ->where('serial_number', $sn)
                            ->first();
                        
                        if ($serial) {
                            $serial->update([
                                'status' => $item->condition === 'good' ? 'available' : 'damaged',
                                'warehouse_id' => $warehouse->id
                            ]);
                        }
                    }
                }

                // If good condition, restock inventory
                if ($item->condition === 'good') {
                    $this->inventoryService->adjustStock(
                        $item->product,
                        $warehouse,
                        $item->quantity, // Positive for restock
                        'return',
                        $return->return_number,
                        'Customer Return',
                        $item->serials ?? []
                    );
                }
            }

            $return->update(['status' => 'approved']);
            return $return;
        });
    }

    public function processRefund(SalesReturn $return, $amount, $paymentMethod, $reference, $userId)
    {
        return DB::transaction(function () use ($return, $amount, $paymentMethod, $reference, $userId) {
            if ($return->status !== 'approved') {
                throw new Exception("Return must be approved before issuing a refund.");
            }

            Refund::create([
                'sales_return_id' => $return->id,
                'amount' => $amount,
                'payment_method' => $paymentMethod,
                'reference' => $reference,
                'processed_by' => $userId
            ]);

            $return->update(['status' => 'completed']);
            return $return;
        });
    }
}
