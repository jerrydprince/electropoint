<?php
try {
    $request = \Illuminate\Http\Request::create('/dashboard/admin', 'GET');
    $controller = new \App\Http\Controllers\ReportController();
    $response = $controller->getAdminDashboard();
    echo "SUCCESS\n";
    print_r($response->getData(true));
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
