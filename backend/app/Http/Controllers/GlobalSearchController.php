<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\ProductSerial;
// Future imports for SalesInvoice when ready
use Illuminate\Http\Request;

class GlobalSearchController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->input('q');

        if (!$query) {
            return $this->success([]);
        }

        $results = [];

        // 1. Search Customers
        $customers = Customer::where('company_id', 1)
            ->where(function ($q) use ($query) {
                $q->where('first_name', 'like', "%{$query}%")
                  ->orWhere('last_name', 'like', "%{$query}%")
                  ->orWhere('company_name', 'like', "%{$query}%")
                  ->orWhere('phone', 'like', "%{$query}%")
                  ->orWhere('email', 'like', "%{$query}%")
                  ->orWhere('customer_code', 'like', "%{$query}%");
            })
            ->limit(5)
            ->get()
            ->map(function ($c) {
                return [
                    'type' => 'Customer',
                    'id' => $c->id,
                    'title' => $c->full_name . ($c->company_name ? " ({$c->company_name})" : ''),
                    'subtitle' => $c->phone . ' | ' . $c->customer_code,
                    'link' => "/customers/{$c->id}"
                ];
            });
            
        $results = array_merge($results, $customers->toArray());

        // 2. Search Inventory Serial Numbers
        $serials = ProductSerial::with('product')
            ->where('serial_number', 'like', "%{$query}%")
            ->limit(5)
            ->get()
            ->map(function ($s) {
                return [
                    'type' => 'Serial Number',
                    'id' => $s->id,
                    'title' => $s->serial_number . ' - ' . ($s->product ? $s->product->name : 'Unknown Product'),
                    'subtitle' => 'Status: ' . ucfirst($s->status),
                    'link' => "/inventory/stock?search={$s->serial_number}"
                ];
            });

        $results = array_merge($results, $serials->toArray());

        // 3. (Future) Search Invoices
        // We will add Sales Invoices here when Session 12 is implemented.
        // e.g., Invoice::where('invoice_number', 'like', "%{$query}%")

        return $this->success($results);
    }
}
