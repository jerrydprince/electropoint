<?php
$product = App\Models\Product::find(1);
$serial = App\Models\ProductSerial::where('product_id', 1)->where('status', 'available')->first();

if (!$serial) {
    echo "No serials available for product 1\n";
    exit;
}

$payload = [
    'customer_id' => null,
    'status' => 'completed',
    'payments' => [['method' => 'cash', 'amount' => 50000, 'reference' => '']],
    'notes' => '',
    'items' => [['product_id' => 1, 'quantity' => 1, 'discount_amount' => 0, 'serials' => [$serial->serial_number]]]
];
$warehouse = App\Models\Warehouse::find(1);
$service = app(App\Services\SaleService::class);
try {
    $sale = $service->processSale($payload, 1, 1, 1, $warehouse);
    echo "SUCCESS:\n";
    echo json_encode($sale);
} catch (\Exception $e) {
    echo "ERROR:\n";
    echo $e->getMessage();
}
