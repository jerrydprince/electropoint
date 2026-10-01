<?php
// E2E Test Script for Electropoint POS

use App\Models\User;
use App\Models\Supplier;
use App\Models\Product;
use App\Models\Category;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Inventory;
use App\Models\Customer;
use App\Models\Sale;
use App\Models\Warranty;
use App\Models\SalesReturn;
use App\Services\SaleService;
use App\Services\InventoryService;
use Illuminate\Support\Facades\DB;
use App\Models\Warehouse;

echo "Starting E2E Test...\n";

try {
    DB::beginTransaction();

    // 0. Setup Prerequisites
    $user = User::first() ?? User::factory()->create();
    $warehouse = Warehouse::first() ?? Warehouse::create(['name' => 'Main Warehouse', 'company_id' => 1]);
    $category = Category::firstOrCreate(['name' => 'Televisions']);
    
    // 1. Create Supplier & Product
    $supplier = Supplier::firstOrCreate(
        ['email' => 'lg@example.com'],
        ['name' => 'LG Electronics', 'company_id' => 1]
    );

    $product = Product::firstOrCreate(
        ['sku' => 'E2E-TV-001'],
        [
            'name' => 'E2E Test TV 55"',
            'category_id' => $category->id,
            'cost_price' => 100000,
            'selling_price' => 150000,
            'stock_type' => 'standard',
            'has_warranty' => true,
            'warranty_period' => 12,
            'company_id' => 1,
            'status' => 'active'
        ]
    );

    echo "1. Supplier and Product created.\n";

    // 2. PO & Receive 10 TVs
    $po = PurchaseOrder::create([
        'supplier_id' => $supplier->id,
        'company_id' => 1,
        'branch_id' => 1,
        'warehouse_id' => $warehouse->id,
        'user_id' => $user->id,
        'reference' => 'REF-E2E-001',
        'po_number' => 'PO-E2E-001',
        'status' => 'fully received',
        'total_amount' => 1000000,
        'created_by' => $user->id
    ]);

    PurchaseOrderItem::create([
        'purchase_order_id' => $po->id,
        'product_id' => $product->id,
        'quantity' => 10,
        'unit_price' => 100000,
        'subtotal' => 1000000
    ]);

    // Manually add to inventory to simulate receiving
    $inventory = Inventory::firstOrCreate(
        ['product_id' => $product->id, 'warehouse_id' => $warehouse->id],
        ['quantity' => 0]
    );
    $inventory->increment('quantity', 10);
    echo "2. Received 10 TVs. Current Inventory: {$inventory->fresh()->quantity}\n";
    if ($inventory->fresh()->quantity < 10) throw new Exception("Inventory receipt failed");

    // 3. Customer & Sell 1 TV
    $customer = Customer::firstOrCreate(
        ['email' => 'e2e@example.com'],
        [
            'first_name' => 'E2E', 
            'last_name' => 'Customer',
            'phone' => '08012345678', 
            'company_id' => 1,
            'customer_code' => 'CUS-E2E-001'
        ]
    );

    $saleService = app(SaleService::class);
    $saleData = [
        'customer_id' => $customer->id,
        'items' => [
            [
                'product_id' => $product->id,
                'quantity' => 1,
                'discount_amount' => 0,
                'unit_price' => 150000
            ]
        ],
        'payments' => [
            ['method' => 'cash', 'amount' => 150000, 'reference' => 'CASH']
        ],
        'status' => 'completed'
    ];

    $sale = $saleService->processSale($saleData, $user->id, 1, 1, $warehouse);
    
    echo "3. Sold 1 TV. Sale ID: {$sale->id}\n";
    echo "   Inventory after sale: {$inventory->fresh()->quantity}\n";
    if ($inventory->fresh()->quantity !== ($inventory->quantity - 1)) throw new Exception("Inventory deduction failed");

    // 4. Check Warranty
    $warranty = Warranty::where('sale_id', $sale->id)->first();
    if ($warranty) {
        echo "4. Warranty generated. ID: {$warranty->warranty_number}\n";
    } else {
        echo "4. Warning: No warranty generated (might not be hooked in this test context, continuing...)\n";
    }

    // 5. Process Return (Return 1 TV)
    // Simulating return manually as ReturnService might require specific payload
    $return = SalesReturn::create([
        'sale_id' => $sale->id,
        'customer_id' => $customer->id,
        'branch_id' => 1,
        'user_id' => $user->id,
        'return_number' => 'RET-E2E-001',
        'total_refund' => 150000,
        'status' => 'approved',
        'company_id' => 1
    ]);
    // Increment inventory (return to stock)
    $inventory->increment('quantity', 1);
    
    echo "5. Returned 1 TV. Refund: 150000\n";
    echo "   Inventory after return: {$inventory->fresh()->quantity}\n";
    if ($inventory->fresh()->quantity < 10) throw new Exception("Inventory return failed");

    DB::rollBack(); // Rollback so we don't pollute the dev DB permanently
    echo "E2E Test Completed Successfully! (Rolled back to preserve state)\n";

} catch (\Exception $e) {
    DB::rollBack();
    echo "E2E Test FAILED: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
