<?php

use App\Models\Sale;

$sale = Sale::with('items.product', 'payments')->find(1);
echo json_encode($sale->toArray(), JSON_PRETTY_PRINT);
