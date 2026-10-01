<?php

use App\Models\Product;
use App\Models\Warehouse;
use App\Services\InventoryService;
use App\Models\Inventory;
use App\Models\InventoryTransaction;

// Login first user for auth()->id()
auth()->login(\App\Models\User::first());

$service = app(InventoryService::class);

$product = Product::first();
$warehouse = Warehouse::first();

if (!$product || !$warehouse) {
    echo "Need a product and a warehouse to test.\n";
    exit;
}

// Clear existing inventory for clean test
Inventory::where('product_id', $product->id)->delete();
InventoryTransaction::where('product_id', $product->id)->delete();
\App\Models\ProductSerial::where('product_id', $product->id)->delete();

echo "Initial Setup complete.\n";

try {
    $serials50 = array_map(fn($i) => 'SNOP-'.$i, range(1, 50));
    $serials20 = array_map(fn($i) => 'SNPO-'.$i, range(1, 20));
    $serialsSale = array_map(fn($i) => 'SNOP-'.$i, range(1, 5));
    $serialsReturn = ['SNOP-1'];

    // 1. 50 opening
    $service->adjustStock($product, $warehouse, 50, 'opening_stock', 'OP-001', 'Initial stock', $serials50);
    echo "After Opening: " . Inventory::where('product_id', $product->id)->first()->quantity . "\n";

    // 2. +20 purchase
    $service->adjustStock($product, $warehouse, 20, 'purchase', 'PO-001', 'Supplier X', $serials20);
    echo "After Purchase: " . Inventory::where('product_id', $product->id)->first()->quantity . "\n";

    // 3. -5 sale
    $service->adjustStock($product, $warehouse, -5, 'sale', 'INV-001', 'Customer Y', $serialsSale);
    echo "After Sale: " . Inventory::where('product_id', $product->id)->first()->quantity . "\n";

    // 4. +1 return
    $service->adjustStock($product, $warehouse, 1, 'return', 'RET-001', 'Customer Y returned 1', $serialsReturn);
    echo "After Return: " . Inventory::where('product_id', $product->id)->first()->quantity . "\n";

    $totalTransactions = InventoryTransaction::where('product_id', $product->id)->sum('quantity');
    echo "Sum of Transactions: " . $totalTransactions . "\n";
    
    if ($totalTransactions === 66 && Inventory::where('product_id', $product->id)->first()->quantity === 66) {
        echo "RECONCILIATION PASSED!\n";
    } else {
        echo "RECONCILIATION FAILED!\n";
    }

} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
