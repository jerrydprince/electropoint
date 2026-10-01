<?php

namespace App\Http\Controllers;

use App\Models\ProductSerial;
use Illuminate\Http\Request;

class ProductSerialController extends Controller
{
    public function index(Request $request)
    {
        $query = ProductSerial::with(['product', 'warehouse', 'transaction'])->latest();

        if ($request->warehouse_id) {
            $query->where('warehouse_id', $request->warehouse_id);
        }
        if ($request->product_id) {
            $query->where('product_id', $request->product_id);
        }
        if ($request->status) {
            $query->where('status', $request->status);
        }
        if ($request->search) {
            $query->where('serial_number', 'like', "%{$request->search}%");
        }

        return $this->success($query->paginate(20));
    }
}
