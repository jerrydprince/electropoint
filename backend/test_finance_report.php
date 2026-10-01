<?php

$request = \Illuminate\Http\Request::create('/api/v1/reports/finance', 'GET');
$controller = new \App\Http\Controllers\ReportController();
$response = $controller->getFinanceReport($request);

echo json_encode($response->getData(), JSON_PRETTY_PRINT);
