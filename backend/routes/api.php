<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\WarehouseController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\InventoryTransactionController;
use App\Http\Controllers\StockTransferRequestController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\PurchaseRequisitionController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\GoodsReceiptController;
use App\Http\Controllers\SupplierFinanceController;
use App\Http\Controllers\SupplyCategoryController;
use App\Http\Controllers\SupplyController;
use App\Http\Controllers\SupplyStockController;
use App\Http\Controllers\SupplyRequestController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\CorporatePlanController;
use App\Http\Controllers\GlobalSearchController;
use App\Http\Controllers\PosController;
use App\Http\Controllers\SalesHistoryController;
use App\Http\Controllers\ReturnController;
use App\Http\Controllers\CreditController;
use App\Http\Controllers\WarrantyController;
use App\Http\Controllers\WarrantyClaimController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\CashRegisterController;
use App\Http\Controllers\FinancialEngineController;
use App\Http\Controllers\AccountingController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\PaystackController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\FiscalPeriodController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\ProductSerialController;

Route::prefix('v1')->group(function () {
    
    // Global Search
    Route::get('/search', [GlobalSearchController::class, 'search']);
    
    // Public routes
    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
    
    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/change-password', [AuthController::class, 'changePassword']);

        // Settings / Company Profile
        Route::middleware('resource_permission:settings')->group(function () {
            Route::get('/company', [CompanyController::class, 'show']);
            Route::post('/company', [CompanyController::class, 'update']);
            Route::apiResource('branches', BranchController::class);
            Route::apiResource('warehouses', WarehouseController::class);
            Route::get('/audit-logs', [AuditLogController::class, 'index']);
        });

        // Product Catalog
        Route::middleware('resource_permission:products')->group(function () {
            Route::apiResource('categories', CategoryController::class);
            Route::apiResource('brands', BrandController::class);
            Route::apiResource('units', UnitController::class);
            Route::apiResource('products', ProductController::class);
        });
        
        // Inventory Engine
        Route::middleware('permission:inventory.view')->group(function () {
            Route::get('inventory/dashboard', [InventoryController::class, 'dashboard']);
            Route::get('inventory', [InventoryController::class, 'index']);
            Route::get('inventory-transactions', [InventoryTransactionController::class, 'index']);
            Route::get('product-serials', [ProductSerialController::class, 'index']);
            Route::get('goods-receipts', [GoodsReceiptController::class, 'index']);
            Route::get('goods-receipts/{id}', [GoodsReceiptController::class, 'show']);
        });
        
        Route::middleware('permission:inventory.adjust_stock')->group(function () {
            Route::post('inventory/adjust', [InventoryController::class, 'adjust']);
            Route::post('goods-receipts', [GoodsReceiptController::class, 'store']);
        });
        
        Route::middleware('permission:inventory.transfer')->group(function () {
            Route::post('inventory/transfer', [InventoryController::class, 'transfer']);
            Route::get('stock-transfer-requests', [StockTransferRequestController::class, 'index']);
            Route::post('stock-transfer-requests', [StockTransferRequestController::class, 'store']);
            Route::post('/stock-transfer-requests/{id}/approve', [StockTransferRequestController::class, 'approve']);
            Route::post('/stock-transfer-requests/{id}/reject', [StockTransferRequestController::class, 'reject']);
            
            // Operational Supplies
            Route::apiResource('supply-categories', SupplyCategoryController::class);
            Route::apiResource('supplies', SupplyController::class);
            Route::get('/supply-stock', [SupplyStockController::class, 'dashboard']);
            Route::post('/supply-stock/receive', [SupplyStockController::class, 'receive']);
            Route::get('/supply-stock/transactions', [SupplyStockController::class, 'transactions']);
            Route::get('/supply-requests', [SupplyRequestController::class, 'index']);
            Route::post('/supply-requests', [SupplyRequestController::class, 'store']);
            Route::post('/supply-requests/{id}/process', [SupplyRequestController::class, 'process']);
        });

        // Procurement
        Route::middleware('resource_permission:procurement')->group(function () {
            Route::apiResource('suppliers', SupplierController::class);
            Route::apiResource('purchase-requisitions', PurchaseRequisitionController::class)->except(['update', 'destroy']);
            Route::apiResource('purchase-orders', PurchaseOrderController::class)->except(['update', 'destroy']);
        });
        
        Route::middleware('permission:procurement.approve')->group(function () {
            Route::post('/purchase-requisitions/{id}/status', [PurchaseRequisitionController::class, 'updateStatus']);
            Route::post('/purchase-orders/{id}/status', [PurchaseOrderController::class, 'updateStatus']);
            Route::post('/purchase-orders/{id}/receive', [PurchaseOrderController::class, 'receiveGoods']);
        });

        // Finance Engine
        Route::middleware('permission:finance.view')->group(function () {
            Route::get('/supplier-invoices', [SupplierFinanceController::class, 'invoices']);
            Route::post('/supplier-invoices', [SupplierFinanceController::class, 'storeInvoice']);
            Route::get('/supplier-payments', [SupplierFinanceController::class, 'payments']);
            Route::post('/supplier-payments', [SupplierFinanceController::class, 'storePayment']);
            Route::get('/suppliers/{supplier_id}/statement', [SupplierFinanceController::class, 'statement']);
            
            Route::get('/expense-categories', [ExpenseController::class, 'categories']);
            Route::get('/expenses', [ExpenseController::class, 'index']);
            Route::post('/expenses', [ExpenseController::class, 'store']);
            
            Route::get('/financial-dashboard', [FinancialEngineController::class, 'dashboard']);

            Route::get('/fiscal-periods', [FiscalPeriodController::class, 'index']);
            Route::post('/fiscal-periods', [FiscalPeriodController::class, 'store']);
            Route::post('/fiscal-periods/{id}/close', [FiscalPeriodController::class, 'close']);

            Route::get('/account-groups', [AccountingController::class, 'accountGroups']);
            Route::get('/chart-of-accounts', [AccountingController::class, 'chartOfAccounts']);
            Route::post('/chart-of-accounts', [AccountingController::class, 'storeChartOfAccount']);
            Route::put('/chart-of-accounts/{id}/toggle-status', [AccountingController::class, 'toggleChartOfAccountStatus']);
            Route::get('/journals', [AccountingController::class, 'journals']);
            Route::get('/journals/{id}', [AccountingController::class, 'journalDetails']);
            Route::get('/ledger', [AccountingController::class, 'ledger']);
            Route::get('/taxes/summary', [AccountingController::class, 'taxesSummary']);

            Route::apiResource('budgets', BudgetController::class);
            
            Route::get('/credits', [CreditController::class, 'index']);
            Route::get('/credits/{credit}', [CreditController::class, 'show']);
            Route::post('/credits/{credit}/pay', [CreditController::class, 'pay']);
        });

        // Reports
        Route::middleware('permission:finance.export')->group(function () {
            Route::get('/reports/sales', [ReportController::class, 'getSalesReport']);
            Route::get('/reports/inventory', [ReportController::class, 'getInventoryReport']);
            Route::get('/reports/finance', [ReportController::class, 'getFinanceReport']);
        });

        // CRM
        Route::middleware('resource_permission:customers')->group(function () {
            Route::apiResource('customers', CustomerController::class);
            Route::apiResource('corporate-plans', CorporatePlanController::class);
        });

        // POS & Sales Create
        Route::middleware('permission:sales.create')->group(function () {
            Route::get('/pos/products', [PosController::class, 'searchProducts']);
            Route::post('/pos/checkout', [PosController::class, 'checkout']);
            Route::post('/pos/sync', [PosController::class, 'syncOffline']);
            
            Route::get('/cash-register/current', [CashRegisterController::class, 'current']);
            Route::post('/cash-register/open', [CashRegisterController::class, 'open']);
            Route::post('/cash-register/movement', [CashRegisterController::class, 'logMovement']);
            Route::post('/cash-register/close', [CashRegisterController::class, 'close']);
        });

        // Sales View
        Route::middleware('permission:sales.view')->group(function () {
            Route::get('/sales-history', [SalesHistoryController::class, 'index']);
            Route::get('/sales-history/{sale}', [SalesHistoryController::class, 'show']);
            
            Route::get('/warranties', [WarrantyController::class, 'index']);
            Route::get('/warranties/{id}', [WarrantyController::class, 'show']);
            Route::get('/warranty-claims', [WarrantyClaimController::class, 'index']);
            Route::get('/warranty-claims/{id}', [WarrantyClaimController::class, 'show']);
            Route::post('/warranty-claims', [WarrantyClaimController::class, 'store']);
            Route::put('/warranty-claims/{id}', [WarrantyClaimController::class, 'update']);
        });

        // Returns
        Route::middleware('permission:sales.refund')->group(function () {
            Route::apiResource('returns', ReturnController::class);
            Route::post('/returns/{salesReturn}/approve', [ReturnController::class, 'approve']);
            Route::post('/returns/{salesReturn}/refund', [ReturnController::class, 'refund']);
        });

        // Dashboards
        Route::get('/dashboard/admin', [ReportController::class, 'getAdminDashboard']);
        Route::get('/dashboard/branch', [ReportController::class, 'getBranchDashboard']);
        Route::get('/dashboard/cashier', [ReportController::class, 'getCashierDashboard']);
        
        // Notifications
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
        Route::post('/notifications/{id}/mark-read', [NotificationController::class, 'markAsRead']);
        
        // Paystack
        Route::post('/paystack/initialize', [PaystackController::class, 'initialize']);
        Route::get('/paystack/verify/{reference}', [PaystackController::class, 'verify']);

        // Core Management
        Route::middleware('resource_permission:users')->group(function () {
            Route::apiResource('users', UserController::class);
        });
        
        Route::middleware('resource_permission:roles')->group(function () {
            Route::get('/permissions', [PermissionController::class, 'index']);
            Route::apiResource('roles', RoleController::class);
        });
    });

});

// Webhooks (No auth middleware)
Route::post('/webhooks/paystack', [PaystackController::class, 'webhook']);
