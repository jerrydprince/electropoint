<?php

namespace App\Http\Controllers;

use App\Models\SupplyRequest;
use App\Models\SupplyStock;
use App\Models\SupplyTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SupplyRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = SupplyRequest::with(['branch', 'user', 'items.supply'])->latest();

        if ($request->branch_id) {
            $query->where('branch_id', $request->branch_id);
        }

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
            'items.*.supply_id' => 'required|exists:supplies,id',
            'items.*.quantity_requested' => 'required|integer|min:1',
        ]);

        try {
            DB::beginTransaction();

            $supplyReq = SupplyRequest::create([
                'branch_id' => $request->branch_id,
                'user_id' => auth()->id() ?? 1,
                'status' => 'pending',
                'notes' => $request->notes,
            ]);

            foreach ($request->items as $item) {
                $supplyReq->items()->create([
                    'supply_id' => $item['supply_id'],
                    'quantity_requested' => $item['quantity_requested'],
                    'quantity_issued' => 0
                ]);
            }

            DB::commit();
            return $this->success($supplyReq->load('items.supply'), 'Supply request submitted successfully', 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Failed to submit supply request', 500, ['error' => $e->getMessage()]);
        }
    }

    public function process(Request $request, $id)
    {
        $supplyReq = SupplyRequest::with('items.supply')->findOrFail($id);

        if (in_array($supplyReq->status, ['fully_issued', 'rejected'])) {
            return $this->error('This request has already been finalized', 400);
        }

        $request->validate([
            'status' => 'required|in:approved,rejected', // Manager approves or rejects the whole request
            'items' => 'required_if:status,approved|array',
            'items.*.id' => 'required_if:status,approved|exists:supply_request_items,id',
            'items.*.quantity_to_issue' => 'required_if:status,approved|integer|min:0',
        ]);

        try {
            DB::beginTransaction();

            if ($request->status === 'rejected') {
                $supplyReq->update(['status' => 'rejected']);
                DB::commit();
                return $this->success($supplyReq, 'Request rejected');
            }

            $allFullyIssued = true;
            $hasAnyIssue = false;
            $reference = 'ISSUE-' . strtoupper(Str::random(6));

            foreach ($request->items as $issueData) {
                $item = $supplyReq->items->firstWhere('id', $issueData['id']);
                if (!$item) continue;

                $quantityToIssue = $issueData['quantity_to_issue'];
                
                if ($quantityToIssue > 0) {
                    $hasAnyIssue = true;
                    
                    // Check stock
                    $stock = SupplyStock::where('supply_id', $item->supply_id)
                                        ->where('branch_id', $supplyReq->branch_id)
                                        ->first();
                                        
                    if (!$stock || $stock->quantity < $quantityToIssue) {
                        throw new \Exception("Insufficient stock for {$item->supply->name} in this branch");
                    }

                    // Deduct stock
                    $stock->decrement('quantity', $quantityToIssue);

                    // Record transaction
                    SupplyTransaction::create([
                        'supply_id' => $item->supply_id,
                        'branch_id' => $supplyReq->branch_id,
                        'user_id' => auth()->id() ?? 1,
                        'type' => 'issue',
                        'quantity' => -$quantityToIssue, // negative for issue
                        'reference' => $reference,
                        'notes' => 'Issued for Request #' . $supplyReq->id,
                    ]);

                    // Update item
                    $item->increment('quantity_issued', $quantityToIssue);
                }

                if ($item->quantity_issued < $item->quantity_requested) {
                    $allFullyIssued = false;
                }
            }

            $newStatus = $allFullyIssued ? 'fully_issued' : 'partially_issued';
            $supplyReq->update(['status' => $newStatus]);

            DB::commit();
            return $this->success($supplyReq->fresh('items.supply'), 'Supplies issued successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Failed to process request', 500, ['error' => $e->getMessage()]);
        }
    }
}
