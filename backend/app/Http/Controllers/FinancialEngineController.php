<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\Expense;
use App\Models\CustomerCredit;
use App\Models\SupplierInvoice;
use Illuminate\Http\Request;

class FinancialEngineController extends Controller
{
    public function dashboard(Request $request)
    {
        $cacheKey = 'financial_dashboard_metrics_company_1';
        $ttl = 60 * 15; // 15 minutes

        $metrics = \Illuminate\Support\Facades\Cache::remember($cacheKey, $ttl, function () {
            // 1. Revenue
            $revenue = Sale::where('company_id', 1)
                ->where('status', '!=', 'draft')
                ->sum('grand_total');

            // 2. COGS
            $cogs = \DB::table('sale_items')
                ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
                ->join('products', 'sale_items.product_id', '=', 'products.id')
                ->where('sales.company_id', 1)
                ->where('sales.status', '!=', 'draft')
                ->selectRaw('SUM(sale_items.quantity * products.cost_price) as total_cogs')
                ->value('total_cogs') ?? 0;

            $grossProfit = $revenue - $cogs;

            // 3. Expenses
            $expenses = Expense::join('users', 'expenses.user_id', '=', 'users.id')
                ->sum('amount') ?? 0;

            $netProfit = $grossProfit - $expenses;

            // 4. Receivables (Unpaid Customer Credits)
            $receivables = CustomerCredit::where('status', '!=', 'paid')->sum('balance');

            // 5. Payables (Unpaid Supplier Invoices)
            $payables = SupplierInvoice::where('status', '!=', 'paid')
                ->selectRaw('SUM(total_amount - paid_amount) as total_payables')
                ->value('total_payables') ?? 0;

            // 6. VAT Collected
            $vat = Sale::where('company_id', 1)->where('status', '!=', 'draft')->sum('tax_amount');

            return [
                'revenue' => (float)$revenue,
                'cogs' => (float)$cogs,
                'gross_profit' => (float)$grossProfit,
                'expenses' => (float)$expenses,
                'net_profit' => (float)$netProfit,
                'receivables' => (float)$receivables,
                'payables' => (float)$payables,
                'vat' => (float)$vat,
            ];
        });

        return $this->success($metrics);
    }
}
