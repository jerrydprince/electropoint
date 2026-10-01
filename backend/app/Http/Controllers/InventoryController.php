<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\Product;
use App\Models\Warehouse;
use App\Services\InventoryService;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    protected $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    public function dashboard(Request $request)
    {
        $warehouseId = $request->warehouse_id;

        $query = Inventory::with('product');
        if ($warehouseId) {
            $query->where('warehouse_id', $warehouseId);
        }

        $inventories = $query->get();

        $totalStock = $inventories->sum('quantity');
        $inventoryValue = $inventories->sum(function($inv) {
            return $inv->quantity * $inv->product->cost_price;
        });

        $lowStock = 0;
        $outOfStock = 0;

        foreach ($inventories as $inv) {
            if ($inv->quantity <= 0) {
                $outOfStock++;
            } elseif ($inv->quantity <= $inv->product->reorder_level) {
                $lowStock++;
            }
        }

        $damagedStock = $inventories->sum('damaged_quantity');

        return $this->success([
            'total_stock' => $totalStock,
            'inventory_value' => $inventoryValue,
            'low_stock' => $lowStock,
            'out_of_stock' => $outOfStock,
            'damaged_stock' => $damagedStock
        ]);
    }

    public function index(Request $request)
    {
        $query = Inventory::with(['product.category', 'product.brand', 'warehouse']);

        if ($request->warehouse_id) {
            $query->where('warehouse_id', $request->warehouse_id);
        }
        if ($request->product_id) {
            $query->where('product_id', $request->product_id);
        }

        return $this->success($query->paginate(15));
    }

    public function adjust(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'quantity' => 'required|integer|not_in:0',
            'type' => 'required|in:opening_stock,purchase,sale,return,damage,adjustment',
            'reference' => 'nullable|string',
            'reason' => 'nullable|string',
            'serials' => 'nullable|array'
        ]);

        $product = Product::findOrFail($validated['product_id']);
        $warehouse = Warehouse::findOrFail($validated['warehouse_id']);
        $serials = $validated['serials'] ?? [];

        try {
            $transaction = $this->inventoryService->adjustStock(
                $product,
                $warehouse,
                $validated['quantity'],
                $validated['type'],
                $validated['reference'] ?? null,
                $validated['reason'] ?? null,
                $serials
            );
            return $this->success($transaction, 'Stock adjusted successfully.');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    public function transfer(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'from_warehouse_id' => 'required|exists:warehouses,id',
            'to_warehouse_id' => 'required|exists:warehouses,id|different:from_warehouse_id',
            'quantity' => 'required|integer|min:1',
            'reference' => 'nullable|string',
            'serials' => 'nullable|array'
        ]);

        $product = Product::findOrFail($validated['product_id']);
        $from = Warehouse::findOrFail($validated['from_warehouse_id']);
        $to = Warehouse::findOrFail($validated['to_warehouse_id']);
        $serials = $validated['serials'] ?? [];

        try {
            $this->inventoryService->transferStock(
                $product,
                $from,
                $to,
                $validated['quantity'],
                $validated['reference'] ?? null,
                $serials
            );
            return $this->success(null, 'Stock transferred successfully.');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }
}
