<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Company;
use App\Models\Customer;
use App\Models\CorporatePlan;
use App\Services\SaleService;
use App\Models\User;
use App\Models\Product;
use App\Models\Warehouse;

// Create dummy company if not exists
$company = Company::firstOrCreate(['name' => 'Test Company']);

// Create plan
$plan = CorporatePlan::firstOrCreate([
    'company_id' => $company->id,
    'name' => '10% Corporate Plan',
    'discount_percentage' => 10,
]);

// Create corporate account
$corporateAccount = Customer::firstOrCreate(
    ['email' => 'corp@example.com'],
    [
        'company_id' => $company->id,
        'customer_code' => 'CORP-001',
        'first_name' => 'Corporate',
        'customer_type' => 'corporate',
        'credit_limit' => 50000000,
        'corporate_plan_id' => $plan->id
    ]
);
$corporateAccount->credit_limit = 50000000;
$corporateAccount->save();

// Create retail customer linked to corporate
$staff = Customer::firstOrCreate(
    ['email' => 'staff@example.com'],
    [
        'company_id' => $company->id,
        'customer_code' => 'STF-001',
        'first_name' => 'Staff',
        'customer_type' => 'retail',
    ]
);
$staff->corporate_account_id = $corporateAccount->id;
$staff->save();

// Setup dummy product
$product = Product::where('serial_tracking', false)->first();
if (!$product) {
    $product = Product::first();
    $product->serial_tracking = false;
    $product->save();
}
$warehouse = Warehouse::first();
$user = User::first();

// Process sale
$saleService = app(SaleService::class);

$saleData = [
    'customer_id' => $staff->id,
    'items' => [
        [
            'product_id' => $product->id,
            'quantity' => 1,
            'discount_amount' => ($product->selling_price * ($plan->discount_percentage / 100)),
        ]
    ],
    'payments' => [
        [
            'amount' => $product->selling_price * (1 - ($plan->discount_percentage / 100)),
            'method' => 'corporate_credit'
        ]
    ]
];

try {
    $sale = $saleService->processSale($saleData, $user->id, $company->id, 1, $warehouse);
    echo "Sale created successfully. ID: " . $sale->id . "\n";
    $credit = \App\Models\CustomerCredit::where('sale_id', $sale->id)->first();
    echo "Credit created for customer ID: " . $credit->customer_id . "\n";
    echo "Expected Corporate ID: " . $corporateAccount->id . "\n";
    if ($credit->customer_id == $corporateAccount->id) {
        echo "SUCCESS: Credit billed to corporate account.\n";
    } else {
        echo "FAILED: Credit billed to wrong account.\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
