<?php

namespace App\Http\Controllers;

use App\Models\StockTransferRequest;
use App\Models\Product;
use App\Models\Warehouse;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StockTransferRequestController extends Controller
{
    protected $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    public function index(Request $request)
    {
        $query = StockTransferRequest::with(['product', 'fromWarehouse', 'toWarehouse', 'requester', 'approver'])->latest();

        if ($request->status) {
            $query->where('status', $request->status);
        }

        return $this->success($query->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'from_warehouse_id' => 'required|exists:warehouses,id',
            'to_warehouse_id' => 'required|exists:warehouses,id|different:from_warehouse_id',
            'quantity' => 'required|integer|min:1',
            'serials' => 'nullable|array',
            'reference' => 'nullable|string',
            'reason' => 'nullable|string'
        ]);

        $validated['requested_by'] = Auth::id();
        $validated['status'] = 'pending';

        $transfer = StockTransferRequest::create($validated);

        return $this->success($transfer, 'Transfer request created successfully.', 201);
    }

    public function approve($id)
    {
        $transfer = StockTransferRequest::findOrFail($id);
        
        if ($transfer->status !== 'pending') {
            return $this->error("Only pending requests can be approved.");
        }

        $product = Product::findOrFail($transfer->product_id);
        $from = Warehouse::findOrFail($transfer->from_warehouse_id);
        $to = Warehouse::findOrFail($transfer->to_warehouse_id);

        try {
            // Perform the atomic transfer via the Inventory Service
            $this->inventoryService->transferStock(
                $product,
                $from,
                $to,
                $transfer->quantity,
                $transfer->reference,
                $transfer->serials ?? []
            );

            $transfer->update([
                'status' => 'approved',
                'approved_by' => Auth::id()
            ]);

            return $this->success($transfer, 'Transfer approved successfully.');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    public function reject($id)
    {
        $transfer = StockTransferRequest::findOrFail($id);

        if ($transfer->status !== 'pending') {
            return $this->error("Only pending requests can be rejected.");
        }

        $transfer->update([
            'status' => 'rejected',
            'approved_by' => Auth::id()
        ]);

        return $this->success($transfer, 'Transfer rejected successfully.');
    }
}
