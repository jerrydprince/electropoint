<?php

use Illuminate\Support\Facades\DB;
use App\Models\JournalEntry;
use App\Models\Sale;
use App\Models\ChartOfAccount;

echo "--- STARTING E2E FINANCE AUDIT ---\n";

try {
    echo "[Phase 1] DB Integrity:\n";
    $columns = DB::select("SHOW COLUMNS FROM journal_entry_lines WHERE Field IN ('debit', 'credit')");
    foreach($columns as $col) {
        if (!str_contains(strtolower($col->Type), 'decimal')) {
            echo "  ERROR: column '{$col->Field}' in journal_entry_lines is not a decimal type (is {$col->Type}).\n";
        } else {
            echo "  PASS: column '{$col->Field}' in journal_entry_lines is {$col->Type}.\n";
        }
    }

    echo "\n[Phase 2] Double Entry Integrity:\n";
    $journals = JournalEntry::with('lines')->get();
    echo "  Total Journals: " . $journals->count() . "\n";
    $unbalanced = 0;
    foreach ($journals as $j) {
        $debits = round($j->lines->sum('debit'), 2);
        $credits = round($j->lines->sum('credit'), 2);
        if ($debits !== $credits) {
            echo "  ERROR: Unbalanced Journal #{$j->id} (Ref: {$j->reference_type}-{$j->reference_id}): Debits {$debits} != Credits {$credits}\n";
            $unbalanced++;
        }
    }
    if ($unbalanced === 0) echo "  PASS: All journals balance perfectly.\n";

    $duplicates = DB::table('journal_entries')
        ->select('reference_type', 'reference_id')
        ->groupBy('reference_type', 'reference_id')
        ->havingRaw('COUNT(id) > 1')
        ->get();
    if ($duplicates->count() > 0) {
        echo "  ERROR: Duplicate Journal Postings found.\n";
    } else {
        echo "  PASS: No duplicate journal postings found.\n";
    }

    echo "\n[Phase 3] Transaction Reconciliation:\n";
    $salesIds = Sale::where('status', '!=', 'draft')->pluck('id')->toArray();
    $journalSalesIds = JournalEntry::where('reference_type', 'Sale')->pluck('reference_id')->toArray();
    $missingSales = array_diff($salesIds, $journalSalesIds);
    if (!empty($missingSales)) {
        echo "  ERROR: " . count($missingSales) . " sales are missing accounting journals.\n";
    } else {
        echo "  PASS: All non-draft sales have accounting journals.\n";
    }

    $calculatedValuation = DB::table('inventories')
        ->join('products', 'inventories.product_id', '=', 'products.id')
        ->sum(DB::raw('inventories.quantity * products.cost_price'));
        
    $inventoryAccount = ChartOfAccount::where('name', 'Inventory')->first();
    if ($inventoryAccount) {
        $ledgerValuation = DB::table('journal_entry_lines')
            ->where('account_id', $inventoryAccount->id)
            ->sum(DB::raw('debit - credit'));
        if (round($calculatedValuation, 2) !== round($ledgerValuation, 2)) {
            echo "  WARN: Inventory Reconciliation Mismatch: Physical Val=" . round($calculatedValuation, 2) . ", Ledger Val=" . round($ledgerValuation, 2) . "\n";
        } else {
            echo "  PASS: Inventory physical valuation matches Ledger.\n";
        }
    } else {
        echo "  WARN: 'Inventory' account not found.\n";
    }

} catch (\Exception $e) {
    echo "  FATAL ERROR: " . $e->getMessage() . "\n";
}

echo "--- AUDIT COMPLETE ---\n";
