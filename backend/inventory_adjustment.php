<?php

use App\Models\ChartOfAccount;
use App\Services\AccountingService;
use Illuminate\Support\Facades\DB;

$accountingService = app(AccountingService::class);

$calculatedValuation = DB::table('inventories')
    ->join('products', 'inventories.product_id', '=', 'products.id')
    ->sum(DB::raw('inventories.quantity * products.cost_price'));
    
$inventoryAccount = ChartOfAccount::where('name', 'Inventory')->first();
$equityAccount = ChartOfAccount::where('name', 'Owner\'s Equity')->first() ?? ChartOfAccount::where('name', 'Retained Earnings')->first();

if (!$equityAccount) {
    echo "Could not find Equity account for opening balance adjustment.\n";
    exit;
}

$ledgerValuation = DB::table('journal_entry_lines')
    ->where('account_id', $inventoryAccount->id)
    ->sum(DB::raw('debit - credit'));
    
$variance = $calculatedValuation - $ledgerValuation;

if (round($variance, 2) !== 0.00) {
    echo "Variance is {$variance}. Creating Opening Balance Adjustment Journal...\n";
    
    $lines = [];
    if ($variance > 0) {
        $lines[] = [
            'account_id' => $inventoryAccount->id,
            'debit' => $variance,
            'credit' => 0,
            'description' => 'Inventory Opening Balance Adjustment',
            'branch_id' => 1
        ];
        $lines[] = [
            'account_id' => $equityAccount->id,
            'debit' => 0,
            'credit' => $variance,
            'description' => 'Inventory Opening Balance Adjustment',
            'branch_id' => 1
        ];
    } else {
        $variance = abs($variance);
        $lines[] = [
            'account_id' => $equityAccount->id,
            'debit' => $variance,
            'credit' => 0,
            'description' => 'Inventory Opening Balance Adjustment',
            'branch_id' => 1
        ];
        $lines[] = [
            'account_id' => $inventoryAccount->id,
            'debit' => 0,
            'credit' => $variance,
            'description' => 'Inventory Opening Balance Adjustment',
            'branch_id' => 1
        ];
    }
    
    $journalData = [
        'journal_date' => now()->toDateString(),
        'description' => 'Automated Inventory Reconciliation Adjustment',
        'reference_type' => 'Adjustment',
        'reference_id' => 1,
        'branch_id' => 1,
        'currency' => 'NGN',
        'created_by' => 1,
        'posted_by' => 1,
    ];
    
    $accountingService->postJournal($journalData, $lines);
    echo "Adjustment Journal Posted Successfully.\n";
} else {
    echo "No variance. Inventory is perfectly reconciled.\n";
}
