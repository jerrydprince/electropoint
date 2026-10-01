<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use App\Models\SupplierInvoice;
use App\Models\SupplierPayment;
use App\Models\PurchaseOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SupplierFinanceController extends Controller
{
    public function invoices(Request $request)
    {
        $query = SupplierInvoice::with(['supplier', 'purchaseOrder.items.product', 'purchaseOrder.branch'])->latest();

        if ($request->supplier_id) {
            $query->where('supplier_id', $request->supplier_id);
        }

        return $this->success($query->paginate(20));
    }

    public function storeInvoice(Request $request)
    {
        $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'purchase_order_id' => 'required|exists:purchase_orders,id',
            'due_date' => 'nullable|date',
            'notes' => 'nullable|string'
        ]);

        $po = PurchaseOrder::findOrFail($request->purchase_order_id);
        
        if ($po->supplier_id != $request->supplier_id) {
            return $this->error('Purchase order does not belong to this supplier', 400);
        }

        // Check if invoice already exists for this PO
        if (SupplierInvoice::where('purchase_order_id', $po->id)->exists()) {
            return $this->error('An invoice already exists for this purchase order', 400);
        }

        $invoice = SupplierInvoice::create([
            'supplier_id' => $po->supplier_id,
            'purchase_order_id' => $po->id,
            'reference' => 'INV-' . strtoupper(Str::random(6)),
            'total_amount' => $po->total_amount,
            'paid_amount' => 0,
            'status' => 'unpaid',
            'due_date' => $request->due_date,
            'notes' => $request->notes
        ]);

        return $this->success($invoice, 'Invoice created successfully', 201);
    }

    public function payments(Request $request)
    {
        $query = SupplierPayment::with(['supplier', 'invoice', 'user'])->latest();

        if ($request->supplier_id) {
            $query->where('supplier_id', $request->supplier_id);
        }

        return $this->success($query->paginate(20));
    }

    public function storePayment(Request $request, \App\Services\AccountingService $accountingService)
    {
        $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'supplier_invoice_id' => 'nullable|exists:supplier_invoices,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string',
            'reference' => 'nullable|string',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string'
        ]);

        try {
            DB::beginTransaction();

            $payment = SupplierPayment::create([
                'supplier_id' => $request->supplier_id,
                'supplier_invoice_id' => $request->supplier_invoice_id,
                'user_id' => auth()->id() ?? 1,
                'amount' => $request->amount,
                'payment_method' => $request->payment_method,
                'reference' => $request->reference,
                'payment_date' => $request->payment_date,
                'notes' => $request->notes
            ]);

            if ($request->supplier_invoice_id) {
                $invoice = SupplierInvoice::findOrFail($request->supplier_invoice_id);
                $newPaidAmount = $invoice->paid_amount + $request->amount;
                
                $status = 'unpaid';
                if ($newPaidAmount >= $invoice->total_amount) {
                    $status = 'paid';
                } elseif ($newPaidAmount > 0) {
                    $status = 'partially_paid';
                }

                $invoice->update([
                    'paid_amount' => $newPaidAmount,
                    'status' => $status
                ]);
            }

            DB::commit();

            // Phase 8: Post to Accounting Engine
            $accountingService->postSupplierPayment($payment);

            return $this->success($payment, 'Payment recorded successfully', 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Failed to record payment', 500, ['error' => $e->getMessage()]);
        }
    }

    public function statement($supplier_id)
    {
        $supplier = Supplier::findOrFail($supplier_id);
        
        $totalInvoiced = SupplierInvoice::where('supplier_id', $supplier_id)->sum('total_amount');
        $totalPaidAllocated = SupplierInvoice::where('supplier_id', $supplier_id)->sum('paid_amount');
        
        // Unallocated payments (payments without an invoice_id)
        $totalUnallocated = SupplierPayment::where('supplier_id', $supplier_id)
                                           ->whereNull('supplier_invoice_id')
                                           ->sum('amount');
                                           
        $totalPaid = SupplierPayment::where('supplier_id', $supplier_id)->sum('amount');
        
        $outstandingBalance = $totalInvoiced - $totalPaid;

        return $this->success([
            'supplier_id' => $supplier->id,
            'supplier_name' => $supplier->name,
            'total_invoiced' => $totalInvoiced,
            'total_paid' => $totalPaid,
            'unallocated_payments' => $totalUnallocated,
            'outstanding_balance' => $outstandingBalance
        ]);
    }
}
