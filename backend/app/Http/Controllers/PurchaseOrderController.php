<?php

namespace App\Http\Controllers;

use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PurchaseOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = PurchaseOrder::with(['supplier', 'branch', 'warehouse', 'user', 'items.product'])->latest();

        if ($request->status) {
            $query->where('status', $request->status);
        }
        if ($request->supplier_id) {
            $query->where('supplier_id', $request->supplier_id);
        }
        if ($request->product_id) {
            $query->whereHas('items', function($q) use ($request) {
                $q->where('product_id', $request->product_id);
            });
        }

        return $this->success($query->paginate(20));
    }

    public function store(Request $request)
    {
        $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'branch_id' => 'required|exists:branches,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'purchase_requisition_id' => 'nullable|exists:purchase_requisitions,id',
            'tax_amount' => 'nullable|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'expected_delivery' => 'nullable|date',
            'payment_terms' => 'nullable|string',
            'notes' => 'nullable|string',
            
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_cost' => 'required|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            $subtotal = 0;
            
            // Calculate subtotal from items first
            foreach ($request->items as $item) {
                $subtotal += ($item['quantity'] * $item['unit_cost']);
            }

            $tax = $request->tax_amount ?? 0;
            $discount = $request->discount_amount ?? 0;
            $total = $subtotal + $tax - $discount;

            $po = PurchaseOrder::create([
                'supplier_id' => $request->supplier_id,
                'branch_id' => $request->branch_id,
                'warehouse_id' => $request->warehouse_id,
                'user_id' => auth()->id() ?? 1,
                'purchase_requisition_id' => $request->purchase_requisition_id,
                'reference' => 'PO-' . strtoupper(Str::random(8)),
                'status' => 'draft',
                'tax_amount' => $tax,
                'discount_amount' => $discount,
                'total_amount' => $total,
                'expected_delivery' => $request->expected_delivery,
                'payment_terms' => $request->payment_terms,
                'notes' => $request->notes,
            ]);

            foreach ($request->items as $item) {
                $lineTotal = $item['quantity'] * $item['unit_cost'];
                $po->items()->create([
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_cost' => $item['unit_cost'],
                    'total' => $lineTotal,
                ]);
            }

            DB::commit();

            return $this->success($po->load('items.product'), 'Purchase Order created successfully', 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Failed to create Purchase Order', 500, ['error' => $e->getMessage()]);
        }
    }

    public function show($id)
    {
        $po = PurchaseOrder::with(['supplier', 'branch', 'warehouse', 'user', 'items.product', 'purchaseRequisition'])->findOrFail($id);
        return $this->success($po);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:draft,pending approval,approved,sent,cancelled,closed'
        ]);

        $po = PurchaseOrder::findOrFail($id);
        
        // Don't allow changing status of received POs easily via this endpoint
        if (in_array($po->status, ['partially received', 'fully received']) && !in_array($request->status, ['closed', 'cancelled'])) {
            return $this->error('Cannot change status of a received PO', 400);
        }

        $po->update(['status' => $request->status]);

        return $this->success($po, 'Status updated successfully');
    }

    public function receiveGoods(Request $request, $id, InventoryService $inventoryService)
    {
        $po = PurchaseOrder::with('items.product')->findOrFail($id);

        if (!in_array($po->status, ['sent', 'partially received', 'approved'])) {
            return $this->error('PO must be approved or sent to receive goods', 400);
        }

        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:purchase_order_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.serials' => 'nullable|array', // Required if product has serial_tracking
        ]);

        try {
            DB::beginTransaction();

            $allFullyReceived = true;

            foreach ($request->items as $receivedData) {
                $item = $po->items->firstWhere('id', $receivedData['id']);
                
                if (!$item) continue;

                $remaining = $item->quantity - $item->received_quantity;
                if ($receivedData['quantity'] > $remaining) {
                    throw new \Exception("Cannot receive more than ordered for item {$item->product->name}");
                }

                // Call Inventory Engine
                $inventoryService->adjustStock(
                    $item->product,
                    $po->warehouse,
                    $receivedData['quantity'],
                    'purchase',
                    'PO Receipt: ' . $po->reference,
                    null,
                    $receivedData['serials'] ?? []
                );

                // Update received qty on PO item
                $item->increment('received_quantity', $receivedData['quantity']);

                if ($item->received_quantity < $item->quantity) {
                    $allFullyReceived = false;
                }
            }

            // Check if ALL items in PO are fully received
            foreach ($po->items as $item) {
                if ($item->received_quantity < $item->quantity) {
                    $allFullyReceived = false;
                    break;
                }
            }

            $po->update([
                'status' => $allFullyReceived ? 'fully received' : 'partially received'
            ]);

            DB::commit();

            return $this->success($po->fresh(['items.product']), 'Goods received successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Failed to receive goods', 500, ['error' => $e->getMessage()]);
        }
    }
}
