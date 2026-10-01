<?php

namespace App\Http\Controllers;

use App\Models\Warranty;
use Illuminate\Http\Request;

class WarrantyController extends Controller
{
    public function index(Request $request)
    {
        $query = Warranty::with(['product', 'sale', 'customer', 'claims'])
            ->orderBy('created_at', 'desc');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('serial_number', 'like', "%{$request->search}%")
                  ->orWhere('warranty_number', 'like', "%{$request->search}%")
                  ->orWhereHas('sale', function ($sq) use ($request) {
                      $sq->where('invoice_number', 'like', "%{$request->search}%");
                  })
                  ->orWhereHas('customer', function ($cq) use ($request) {
                      $cq->where('phone', 'like', "%{$request->search}%")
                         ->orWhere('first_name', 'like', "%{$request->search}%")
                         ->orWhere('last_name', 'like', "%{$request->search}%");
                  });
            });
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        return $this->success($query->paginate(20));
    }

    public function show($id)
    {
        $warranty = Warranty::with(['product', 'sale', 'customer', 'claims'])->findOrFail($id);
        return $this->success($warranty);
    }
}
