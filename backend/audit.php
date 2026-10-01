<?php

use App\Models\JournalEntry;
use App\Models\Sale;
use App\Models\Expense;
use Illuminate\Support\Facades\DB;

$report = [
    'status' => 'PENDING',
    'unbalanced_journals' => [],
    'sales_missing_journals' => [],
    'expenses_missing_journals' => [],
];

// Check Unbalanced Journals
$unbalanced = JournalEntry::with('lines')->get()->filter(function ($journal) {
    $debits = $journal->lines->sum('debit');
    $credits = $journal->lines->sum('credit');
    return round($debits, 2) !== round($credits, 2);
});
$report['unbalanced_journals'] = $unbalanced->pluck('id')->toArray();

// Check Sales missing journals
$salesIds = Sale::where('status', '!=', 'draft')->pluck('id')->toArray();
$journalSalesIds = JournalEntry::where('reference_type', 'Sale')->pluck('reference_id')->toArray();
$report['sales_missing_journals'] = array_diff($salesIds, $journalSalesIds);

$expenseIds = Expense::pluck('id')->toArray();
$journalExpenseIds = JournalEntry::where('reference_type', 'Expense')->pluck('reference_id')->toArray();
$report['expenses_missing_journals'] = array_diff($expenseIds, $journalExpenseIds);

echo json_encode($report, JSON_PRETTY_PRINT);
