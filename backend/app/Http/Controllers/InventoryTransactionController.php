<?php

namespace App\Http\Controllers;

use App\Models\InventoryTransaction;
use Illuminate\Http\Request;

class InventoryTransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = InventoryTransaction::with(['product', 'warehouse', 'user', 'serials'])->latest();

        if ($request->warehouse_id) {
            $query->where('warehouse_id', $request->warehouse_id);
        }
        if ($request->product_id) {
            $query->where('product_id', $request->product_id);
        }
        if ($request->type) {
            $query->where('type', $request->type);
        }

        return $this->success($query->paginate(20));
    }
}
