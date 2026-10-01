<?php

namespace App\Http\Controllers;

use App\Models\PurchaseRequisition;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PurchaseRequisitionController extends Controller
{
    public function index(Request $request)
    {
        $query = PurchaseRequisition::with(['user', 'branch', 'items.product'])->latest();

        if ($request->status) {
            $query->where('status', $request->status);
        }

        return $this->success($query->paginate(20));
    }

    public function store(Request $request)
    {
        $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.expected_date' => 'nullable|date',
        ]);

        try {
            DB::beginTransaction();

            $pr = PurchaseRequisition::create([
                'branch_id' => $request->branch_id,
                'user_id' => auth()->id() ?? 1, // fallback to 1 if auth fails in testing
                'reference' => 'PR-' . strtoupper(Str::random(8)),
                'status' => 'pending',
                'notes' => $request->notes,
            ]);

            foreach ($request->items as $item) {
                $pr->items()->create([
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'expected_date' => $item['expected_date'] ?? null,
                ]);
            }

            DB::commit();

            return $this->success($pr->load('items.product'), 'Purchase Requisition created successfully', 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Failed to create Purchase Requisition', 500, ['error' => $e->getMessage()]);
        }
    }

    public function show($id)
    {
        $pr = PurchaseRequisition::with(['user', 'branch', 'items.product', 'purchaseOrders'])->findOrFail($id);
        return $this->success($pr);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected,closed'
        ]);

        $pr = PurchaseRequisition::findOrFail($id);

        if ($pr->status !== 'pending' && in_array($request->status, ['approved', 'rejected'])) {
            return $this->error('Only pending requisitions can be approved or rejected', 400);
        }

        $pr->update([
            'status' => $request->status
        ]);

        return $this->success($pr, 'Status updated successfully');
    }
}
