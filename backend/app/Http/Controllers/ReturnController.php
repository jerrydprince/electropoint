<?php

namespace App\Http\Controllers;

use App\Models\SalesReturn;
use App\Models\Sale;
use App\Services\ReturnService;
use Illuminate\Http\Request;

class ReturnController extends Controller
{
    protected $returnService;

    public function __construct(ReturnService $returnService)
    {
        $this->returnService = $returnService;
    }

    public function index(Request $request)
    {
        $query = SalesReturn::with(['customer', 'sale', 'items.product', 'refunds']);
        
        if ($request->search) {
            $query->where('return_number', 'like', "%{$request->search}%")
                  ->orWhereHas('sale', function ($q) use ($request) {
                      $q->where('invoice_number', 'like', "%{$request->search}%");
                  });
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        return $this->success($query->latest()->paginate(15));
    }

    public function store(Request $request)
    {
        $request->validate([
            'sale_id' => 'required|exists:sales,id',
            'items' => 'required|array',
            'items.*.sale_item_id' => 'required|exists:sale_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.reason' => 'required|string',
            'items.*.condition' => 'required|in:good,damaged',
            'notes' => 'nullable|string'
        ]);

        $sale = Sale::findOrFail($request->sale_id);

        try {
            $return = $this->returnService->createReturn(
                $sale,
                $request->items,
                $request->notes,
                $request->user()->id ?? 1
            );
            return $this->success($return, 'Return initiated successfully.', 201);
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    public function show(SalesReturn $salesReturn)
    {
        return $this->success($salesReturn->load(['customer', 'sale', 'items.product', 'refunds']));
    }

    public function approve(Request $request, SalesReturn $salesReturn)
    {
        $request->validate([
            'warehouse_id' => 'required|exists:warehouses,id'
        ]);

        try {
            $return = $this->returnService->approveReturn(
                $salesReturn,
                $request->warehouse_id,
                $request->user()->id ?? 1
            );
            return $this->success($return, 'Return approved successfully.');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    public function refund(Request $request, SalesReturn $salesReturn)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string'
        ]);

        try {
            $return = $this->returnService->processRefund(
                $salesReturn,
                $request->amount,
                $request->payment_method,
                $request->reference,
                $request->user()->id ?? 1
            );
            return $this->success($return, 'Refund processed successfully.');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }
}
