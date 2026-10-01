<?php

namespace App\Http\Controllers;

use App\Models\GoodsReceipt;
use App\Models\PurchaseOrder;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class GoodsReceiptController extends Controller
{
    public function index(Request $request)
    {
        $query = GoodsReceipt::with(['purchaseOrder', 'branch', 'warehouse', 'user', 'items.product'])->latest();

        if ($request->purchase_order_id) {
            $query->where('purchase_order_id', $request->purchase_order_id);
        }

        return $this->success($query->paginate(20));
    }

    public function store(Request $request, InventoryService $inventoryService, \App\Services\AccountingService $accountingService)
    {
        $request->validate([
            'purchase_order_id' => 'required|exists:purchase_orders,id',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.purchase_order_item_id' => 'required|exists:purchase_order_items,id',
            'items.*.quantity_received' => 'required|integer|min:0',
            'items.*.quantity_rejected' => 'required|integer|min:0',
            'items.*.rejection_reason' => 'nullable|string',
            'items.*.serials' => 'nullable|array', // Optional for non-serial tracked
        ]);

        $po = PurchaseOrder::with(['items.product', 'warehouse'])->findOrFail($request->purchase_order_id);

        if (!in_array($po->status, ['sent', 'partially received', 'approved'])) {
            return $this->error('PO must be approved or sent to receive goods', 400);
        }

        try {
            DB::beginTransaction();

            $grn = GoodsReceipt::create([
                'purchase_order_id' => $po->id,
                'branch_id' => $po->branch_id,
                'warehouse_id' => $po->warehouse_id,
                'user_id' => auth()->id() ?? 1,
                'reference' => 'GRN-' . strtoupper(Str::random(8)),
                'notes' => $request->notes,
            ]);

            $allFullyReceived = true;
            $hasAnyReceipt = false;

            foreach ($request->items as $receivedData) {
                $item = $po->items->firstWhere('id', $receivedData['purchase_order_item_id']);
                if (!$item) continue;

                $remaining = $item->quantity - $item->received_quantity;
                $totalProcessing = $receivedData['quantity_received'] + $receivedData['quantity_rejected'];
                
                if ($totalProcessing > $remaining) {
                    throw new \Exception("Cannot process more than remaining ordered quantity for item {$item->product->name}");
                }

                if ($totalProcessing > 0) {
                    $hasAnyReceipt = true;
                }

                // Create GRN Line
                $grn->items()->create([
                    'purchase_order_item_id' => $item->id,
                    'product_id' => $item->product_id,
                    'quantity_ordered' => $item->quantity,
                    'quantity_previously_received' => $item->received_quantity,
                    'quantity_received' => $receivedData['quantity_received'],
                    'quantity_rejected' => $receivedData['quantity_rejected'],
                    'rejection_reason' => $receivedData['rejection_reason'] ?? null,
                ]);

                // Call Inventory Engine ONLY for accepted items
                if ($receivedData['quantity_received'] > 0) {
                    $inventoryService->adjustStock(
                        $item->product,
                        $po->warehouse,
                        $receivedData['quantity_received'],
                        'purchase',
                        'GRN Receipt: ' . $grn->reference,
                        null,
                        $receivedData['serials'] ?? []
                    );
                }

                // Update PO Item (we consider rejected items as fulfilled for this PO workflow so they don't block closing, but typically you might reorder them. Here we will increment received_quantity by BOTH accepted and rejected so the PO line is closed, or just by accepted? Let's increment by total processed so it closes).
                // Actually, standard practice: received = accepted. Rejected means we didn't receive them in good order. But does it close the PO line? Yes, unless they send a replacement on the same PO. For simplicity, we'll increment received_quantity by the total processed (accepted + rejected).
                $item->increment('received_quantity', $totalProcessing);

                if ($item->received_quantity < $item->quantity) {
                    $allFullyReceived = false;
                }
            }

            if (!$hasAnyReceipt) {
                throw new \Exception("No quantities were entered to receive or reject.");
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

            // Phase 6: Post to Accounting Engine
            $accountingService->postPurchase($po, $grn);

            DB::commit();

            return $this->success($grn->load('items.product'), 'Goods received successfully', 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Failed to receive goods', 500, ['error' => $e->getMessage()]);
        }
    }

    public function show($id)
    {
        return $this->success(GoodsReceipt::with(['purchaseOrder', 'branch', 'warehouse', 'user', 'items.product'])->findOrFail($id));
    }
}
