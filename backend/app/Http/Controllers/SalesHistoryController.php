<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use Illuminate\Http\Request;

class SalesHistoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Sale::with(['customer', 'user', 'items.product', 'payments'])
            ->where('company_id', 1)
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->search) {
            $query->where('invoice_number', 'like', "%{$request->search}%")
                  ->orWhereHas('customer', function($q) use ($request) {
                      $q->where('first_name', 'like', "%{$request->search}%")
                        ->orWhere('last_name', 'like', "%{$request->search}%");
                  });
        }

        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->product_id) {
            $query->whereHas('items', function($q) use ($request) {
                $q->where('product_id', $request->product_id);
            });
        }

        return $this->success($query->paginate(20));
    }

    public function show($id)
    {
        $sale = Sale::with(['customer', 'user', 'items.product', 'payments'])->findOrFail($id);
        return $this->success($sale);
    }
}
