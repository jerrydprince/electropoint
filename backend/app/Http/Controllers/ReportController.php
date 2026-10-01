<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Expense;
use App\Models\CashRegister;
use App\Models\Inventory;
use App\Models\CustomerCredit;
use App\Models\SupplierInvoice;
use App\Models\Branch;
use App\Models\Customer;
use App\Models\Supplier;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
{
    // ==========================================
    // DASHBOARDS
    // ==========================================

    public function getAdminDashboard()
    {
        $revenue = Sale::where('status', '!=', 'draft')->sum('grand_total');
        
        $cogs = DB::table('sale_items')
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->where('sales.status', '!=', 'draft')
            ->selectRaw('SUM(sale_items.quantity * products.cost_price) as total_cogs')
            ->value('total_cogs') ?? 0;

        $grossProfit = $revenue - $cogs;
        $expenses = Expense::sum('amount') ?? 0;
        $netProfit = $grossProfit - $expenses;

        $inventoryValue = DB::table('inventories')
            ->join('products', 'inventories.product_id', '=', 'products.id')
            ->selectRaw('SUM(inventories.quantity * products.cost_price) as total_val')
            ->value('total_val') ?? 0;

        $receivables = CustomerCredit::where('status', '!=', 'paid')->sum('balance');
        
        $payables = SupplierInvoice::where('status', '!=', 'paid')
            ->selectRaw('SUM(total_amount - paid_amount) as total_payables')
            ->value('total_payables') ?? 0;

        // Fetch Daily Trend (Last 14 days)
        $dailyTrend = Sale::where('status', '!=', 'draft')
            ->whereDate('created_at', '>=', Carbon::now()->subDays(14))
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(grand_total) as revenue'))
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        // Fetch Recent Sales
        $recentSales = Sale::with(['customer', 'branch'])
            ->where('status', '!=', 'draft')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        // Fetch Top Products
        $topProducts = DB::table('sale_items')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->where('sales.status', '!=', 'draft')
            ->select('products.name', 'products.sku', DB::raw('SUM(sale_items.quantity) as total_sold'), DB::raw('SUM(sale_items.total) as total_revenue'))
            ->groupBy('products.id', 'products.name', 'products.sku')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();

        return $this->success([
            'metrics' => [
                'revenue' => (float)$revenue,
                'gross_profit' => (float)$grossProfit,
                'net_profit' => (float)$netProfit,
                'inventory_value' => (float)$inventoryValue,
                'receivables' => (float)$receivables,
                'payables' => (float)$payables,
                'branches' => Branch::count(),
                'customers' => Customer::count(),
                'suppliers' => Supplier::count(),
            ],
            'daily_trend' => $dailyTrend,
            'recent_sales' => $recentSales,
            'top_products' => $topProducts
        ]);
    }

    public function getBranchDashboard(Request $request)
    {
        $branchId = $request->user()->branch_id;
        
        $revenue = Sale::where('branch_id', $branchId)->where('status', '!=', 'draft')->sum('grand_total');
        
        $inventoryValue = DB::table('inventories')
            ->join('warehouses', 'inventories.warehouse_id', '=', 'warehouses.id')
            ->join('products', 'inventories.product_id', '=', 'products.id')
            ->where('warehouses.branch_id', $branchId)
            ->selectRaw('SUM(inventories.quantity * products.cost_price) as total_val')
            ->value('total_val') ?? 0;

        return $this->success([
            'metrics' => [
                'revenue' => (float)$revenue,
                'inventory_value' => (float)$inventoryValue,
                'sales_today' => Sale::where('branch_id', $branchId)->whereDate('created_at', Carbon::today())->count(),
            ]
        ]);
    }

    public function getCashierDashboard(Request $request)
    {
        $userId = $request->user()->id;
        
        $salesToday = Sale::where('user_id', $userId)
            ->whereDate('created_at', Carbon::today())
            ->where('status', '!=', 'draft')
            ->sum('grand_total');
            
        $transactionsToday = Sale::where('user_id', $userId)
            ->whereDate('created_at', Carbon::today())
            ->count();
            
        $activeRegister = CashRegister::where('user_id', $userId)->where('status', 'open')->first();

        // Payment Summary Today
        $payments = DB::table('payments')
            ->join('sales', 'payments.sale_id', '=', 'sales.id')
            ->where('sales.user_id', $userId)
            ->whereDate('payments.created_at', Carbon::today())
            ->select('payments.payment_method', DB::raw('SUM(payments.amount) as total'))
            ->groupBy('payments.payment_method')
            ->get();

        return $this->success([
            'sales_today' => (float)$salesToday,
            'transactions' => $transactionsToday,
            'register_status' => $activeRegister ? 'open' : 'closed',
            'register_expected' => $activeRegister ? (float)$activeRegister->opening_amount + DB::table('cash_register_movements')->where('cash_register_id', $activeRegister->id)->sum('amount') : 0,
            'payment_summary' => $payments
        ]);
    }

    // ==========================================
    // REPORTS
    // ==========================================

    public function getSalesReport(Request $request)
    {
        $startDate = $request->query('start_date') ? Carbon::parse($request->query('start_date'))->startOfDay() : Carbon::now()->subDays(30)->startOfDay();
        $endDate = $request->query('end_date') ? Carbon::parse($request->query('end_date'))->endOfDay() : Carbon::now()->endOfDay();
        $branchId = $request->query('branch_id');

        $query = Sale::where('status', '!=', 'draft')
                     ->whereBetween('created_at', [$startDate, $endDate]);

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        $totalRevenue = (clone $query)->sum('grand_total');
        $totalOrders = (clone $query)->count();
        $aov = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

        // Daily Sales Trend
        $dailyTrend = (clone $query)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(grand_total) as revenue'))
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        // Top Products
        $topProductsQuery = DB::table('sale_items')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->where('sales.status', '!=', 'draft')
            ->whereBetween('sales.created_at', [$startDate, $endDate]);

        if ($branchId) {
            $topProductsQuery->where('sales.branch_id', $branchId);
        }

        $totalUnitsSold = (clone $topProductsQuery)->sum('sale_items.quantity') ?? 0;

        $topProducts = $topProductsQuery
            ->select('products.name', DB::raw('SUM(sale_items.quantity) as total_sold'), DB::raw('SUM(sale_items.total) as total_revenue'))
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_sold')
            ->limit(10)
            ->get();

        return $this->success([
            'kpis' => [
                'total_revenue' => (float)$totalRevenue,
                'total_units_sold' => (int)$totalUnitsSold,
                'average_order_value' => (float)$aov,
                'total_orders' => (int)$totalOrders
            ],
            'daily_trend' => $dailyTrend,
            'top_products' => $topProducts
        ]);
    }

    public function getInventoryReport(Request $request)
    {
        $branchId = $request->query('branch_id');

        $query = DB::table('inventories')
            ->join('products', 'inventories.product_id', '=', 'products.id');

        if ($branchId) {
            $query->join('warehouses', 'inventories.warehouse_id', '=', 'warehouses.id')
                  ->where('warehouses.branch_id', $branchId);
        }

        // KPIs
        $totalInventoryValue = (clone $query)
            ->selectRaw('SUM(inventories.quantity * products.cost_price) as total_val')
            ->value('total_val') ?? 0;
            
        $totalItemsInStock = (clone $query)->sum('inventories.quantity') ?? 0;

        // Low Stock
        $lowStock = (clone $query)
            ->whereColumn('inventories.quantity', '<=', 'products.min_stock')
            ->where('inventories.quantity', '>', 0)
            ->select('products.name', 'products.sku', 'inventories.quantity', 'products.min_stock')
            ->get();

        // Out of stock
        $outOfStock = (clone $query)
            ->where('inventories.quantity', '<=', 0)
            ->select('products.name', 'products.sku', 'inventories.quantity')
            ->get();

        return $this->success([
            'kpis' => [
                'total_inventory_value' => (float)$totalInventoryValue,
                'total_items_in_stock' => (int)$totalItemsInStock
            ],
            'low_stock' => $lowStock,
            'out_of_stock' => $outOfStock
        ]);
    }

    public function getFinanceReport(Request $request)
    {
        // Expenses by Category (Legacy)
        $expensesByCategory = DB::table('expenses')
            ->join('expense_categories', 'expenses.expense_category_id', '=', 'expense_categories.id')
            ->select('expense_categories.name', DB::raw('SUM(expenses.amount) as total'))
            ->groupBy('expense_categories.id', 'expense_categories.name')
            ->get();

        // Profit and Loss Statement (From Ledger)
        $revenue = DB::table('journal_entry_lines')
            ->join('chart_of_accounts', 'journal_entry_lines.account_id', '=', 'chart_of_accounts.id')
            ->join('account_types', 'chart_of_accounts.account_type_id', '=', 'account_types.id')
            ->where('account_types.name', 'Revenue')
            ->sum(DB::raw('credit - debit'));

        $cogs = DB::table('journal_entry_lines')
            ->join('chart_of_accounts', 'journal_entry_lines.account_id', '=', 'chart_of_accounts.id')
            ->where('chart_of_accounts.code', '5000') // Use code instead of name
            ->sum(DB::raw('debit - credit'));

        $expenses = DB::table('journal_entry_lines')
            ->join('chart_of_accounts', 'journal_entry_lines.account_id', '=', 'chart_of_accounts.id')
            ->join('account_types', 'chart_of_accounts.account_type_id', '=', 'account_types.id')
            ->where('account_types.name', 'Expenses')
            ->where('chart_of_accounts.code', '!=', '5000') // Exclude COGS
            ->sum(DB::raw('debit - credit'));

        $grossProfit = $revenue - $cogs;
        $netProfit = $grossProfit - $expenses;

        // Balance Sheet (From Ledger)
        $assets = DB::table('journal_entry_lines')
            ->join('chart_of_accounts', 'journal_entry_lines.account_id', '=', 'chart_of_accounts.id')
            ->join('account_types', 'chart_of_accounts.account_type_id', '=', 'account_types.id')
            ->where('account_types.name', 'Assets')
            ->sum(DB::raw('debit - credit'));

        $liabilities = DB::table('journal_entry_lines')
            ->join('chart_of_accounts', 'journal_entry_lines.account_id', '=', 'chart_of_accounts.id')
            ->join('account_types', 'chart_of_accounts.account_type_id', '=', 'account_types.id')
            ->where('account_types.name', 'Liabilities')
            ->sum(DB::raw('credit - debit'));

        $equity = DB::table('journal_entry_lines')
            ->join('chart_of_accounts', 'journal_entry_lines.account_id', '=', 'chart_of_accounts.id')
            ->join('account_types', 'chart_of_accounts.account_type_id', '=', 'account_types.id')
            ->where('account_types.name', 'Equity')
            ->sum(DB::raw('credit - debit'));

        // Current Year Earnings roll into Equity
        $totalEquityAndLiabilities = $liabilities + $equity + $netProfit;

        return $this->success([
            'profit_and_loss' => [
                'revenue' => (float)$revenue,
                'cogs' => (float)$cogs,
                'gross_profit' => (float)$grossProfit,
                'operating_expenses' => (float)$expenses,
                'net_profit' => (float)$netProfit
            ],
            'balance_sheet' => [
                'assets' => (float)$assets,
                'liabilities' => (float)$liabilities,
                'equity' => (float)$equity,
                'retained_earnings' => (float)$netProfit,
                'total_liabilities_and_equity' => (float)$totalEquityAndLiabilities,
                'is_balanced' => round((float)$assets, 2) === round((float)$totalEquityAndLiabilities, 2)
            ],
            'expenses_by_category' => $expensesByCategory
        ]);
    }
}
