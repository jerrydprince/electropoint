<?php

namespace App\Http\Controllers;

use App\Models\Supply;
use App\Models\SupplyStock;
use App\Models\SupplyTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SupplyStockController extends Controller
{
    public function dashboard(Request $request)
    {
        $query = SupplyStock::with(['supply.category', 'branch']);

        if ($request->branch_id) {
            $query->where('branch_id', $request->branch_id);
        }

        $stocks = $query->get();
        return $this->success($stocks);
    }

    public function receive(Request $request)
    {
        $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'items' => 'required|array|min:1',
            'items.*.supply_id' => 'required|exists:supplies,id',
            'items.*.quantity' => 'required|integer|min:1',
            'reference' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $reference = $request->reference ?? 'SR-' . strtoupper(Str::random(6));

            foreach ($request->items as $item) {
                $stock = SupplyStock::firstOrCreate(
                    ['supply_id' => $item['supply_id'], 'branch_id' => $request->branch_id],
                    ['quantity' => 0]
                );

                $stock->increment('quantity', $item['quantity']);

                SupplyTransaction::create([
                    'supply_id' => $item['supply_id'],
                    'branch_id' => $request->branch_id,
                    'user_id' => auth()->id() ?? 1,
                    'type' => 'receipt',
                    'quantity' => $item['quantity'],
                    'reference' => $reference,
                    'notes' => $request->notes,
                ]);
            }

            DB::commit();
            return $this->success(null, 'Supplies received successfully', 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Failed to receive supplies', 500, ['error' => $e->getMessage()]);
        }
    }

    public function transactions(Request $request)
    {
        $query = SupplyTransaction::with(['supply', 'branch', 'user'])->latest();

        if ($request->branch_id) {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->type) {
            $query->where('type', $request->type);
        }

        return $this->success($query->paginate(20));
    }
}
