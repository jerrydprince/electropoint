<?php

namespace App\Services;

use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use Illuminate\Support\Facades\DB;
use Exception;

class AccountingService
{
    /**
     * Core method to post a double-entry journal.
     * Ensures Debit == Credit and Fiscal Period is open.
     */
    public function postJournal(array $journalData, array $lines)
    {
        // 1. Validate Double Entry
        $totalDebit = 0;
        $totalCredit = 0;

        foreach ($lines as $line) {
            if (isset($line['debit']) && $line['debit'] > 0 && isset($line['credit']) && $line['credit'] > 0) {
                throw new Exception("A single journal line cannot have both a debit and a credit.");
            }
            $totalDebit += (float) ($line['debit'] ?? 0);
            $totalCredit += (float) ($line['credit'] ?? 0);
        }

        // Use a small epsilon for float comparison just in case, but bcmath is better for exact currency.
        if (round($totalDebit, 2) !== round($totalCredit, 2)) {
            throw new Exception("Unbalanced Journal: Total Debits (" . $totalDebit . ") do not equal Total Credits (" . $totalCredit . ").");
        }
        
        if (count($lines) < 2) {
            throw new Exception("A journal must contain at least two lines.");
        }

        // 2. Validate Fiscal Period (Disabled until Phase 13)
        /*
        $journalDate = $journalData['journal_date'];
        $fiscalPeriod = FiscalPeriod::where('start_date', '<=', $journalDate)
            ->where('end_date', '>=', $journalDate)
            ->first();

        if ($fiscalPeriod && $fiscalPeriod->status === 'locked') {
            throw new Exception("Cannot post journal to a locked fiscal period.");
        }
        */

        // 3. Create Journal Atomically
        return DB::transaction(function () use ($journalData, $lines) {
            $journalData['journal_number'] = $this->generateJournalNumber();
            $journalData['status'] = 'posted';
            $journalData['posted_at'] = now();
            
            $journal = JournalEntry::create($journalData);

            foreach ($lines as $line) {
                $journal->lines()->create([
                    'account_id' => $line['account_id'],
                    'debit' => $line['debit'] ?? 0,
                    'credit' => $line['credit'] ?? 0,
                    'description' => $line['description'] ?? $journal->description,
                    'customer_id' => $line['customer_id'] ?? null,
                    'supplier_id' => $line['supplier_id'] ?? null,
                    'branch_id' => $line['branch_id'] ?? $journal->branch_id,
                ]);
            }

            return $journal;
        });
    }

    /**
     * Reverse a posted journal entry.
     */
    public function reverseJournal(JournalEntry $journal, $userId, $reason = "Reversal")
    {
        if ($journal->status !== 'posted') {
            throw new Exception("Only posted journals can be reversed.");
        }

        return DB::transaction(function () use ($journal, $userId, $reason) {
            $reversalData = [
                'journal_date' => now()->toDateString(),
                'description' => "Reversal of {$journal->journal_number}: {$reason}",
                'reference_type' => $journal->reference_type,
                'reference_id' => $journal->reference_id,
                'branch_id' => $journal->branch_id,
                'currency' => $journal->currency,
                'created_by' => $userId,
                'posted_by' => $userId,
                'reversal_of_id' => $journal->id,
            ];

            $lines = [];
            foreach ($journal->lines as $line) {
                // Swap debit and credit
                $lines[] = [
                    'account_id' => $line->account_id,
                    'debit' => $line->credit, // swapped
                    'credit' => $line->debit, // swapped
                    'description' => "Reversal: " . $line->description,
                    'customer_id' => $line->customer_id,
                    'supplier_id' => $line->supplier_id,
                    'branch_id' => $line->branch_id,
                ];
            }

            $reversalJournal = $this->postJournal($reversalData, $lines);

            $journal->status = 'reversed';
            $journal->save();

            return $reversalJournal;
        });
    }

    private function generateJournalNumber()
    {
        $prefix = 'JE-' . date('Ym');
        $last = JournalEntry::where('journal_number', 'like', "{$prefix}%")
            ->orderBy('id', 'desc')
            ->first();

        if (!$last) {
            return $prefix . '-0001';
        }

        $lastSeq = (int) substr($last->journal_number, -4);
        return $prefix . '-' . str_pad($lastSeq + 1, 4, '0', STR_PAD_LEFT);
    }

    // ========================================================================
    // BUSINESS DOMAIN ACCOUNTING METHODS (To be implemented in Phases 5-10)
    // ========================================================================

    public function postSale($sale)
    {
        if ($sale->status === 'draft') return null;

        // Fetch Accounts
        $revenueAcc = \App\Models\ChartOfAccount::where('code', '4100')->first();
        $taxAcc = \App\Models\ChartOfAccount::where('code', '2200')->first();
        $cogsAcc = \App\Models\ChartOfAccount::where('code', '5000')->first();
        $inventoryAcc = \App\Models\ChartOfAccount::where('code', '1400')->first();
        $cashAcc = \App\Models\ChartOfAccount::where('code', '1100')->first();
        $arAcc = \App\Models\ChartOfAccount::where('code', '1300')->first();

        // 1. Revenue & Payment Entries
        $lines = [];
        
        // Revenue (Credit)
        $lines[] = [
            'account_id' => $revenueAcc->id,
            'debit' => 0,
            'credit' => $sale->subtotal - $sale->discount_amount,
            'description' => "Sales Revenue: {$sale->invoice_number}",
            'customer_id' => $sale->customer_id,
            'branch_id' => $sale->branch_id,
        ];

        // Tax (Credit)
        if ($sale->tax_amount > 0) {
            $lines[] = [
                'account_id' => $taxAcc->id,
                'debit' => 0,
                'credit' => $sale->tax_amount,
                'description' => "Sales Tax: {$sale->invoice_number}",
                'branch_id' => $sale->branch_id,
            ];
        }

        // Payments (Debit Cash/Bank)
        $totalPaid = 0;
        foreach ($sale->payments as $payment) {
            $lines[] = [
                'account_id' => $cashAcc->id,
                'debit' => $payment->amount,
                'credit' => 0,
                'description' => "Payment for {$sale->invoice_number}",
                'customer_id' => $sale->customer_id,
                'branch_id' => $sale->branch_id,
            ];
            $totalPaid += $payment->amount;
        }

        // Credit Amount (Debit AR)
        $creditAmount = $sale->grand_total - $totalPaid;
        if ($creditAmount > 0) {
            $lines[] = [
                'account_id' => $arAcc->id,
                'debit' => $creditAmount,
                'credit' => 0,
                'description' => "Credit Sale: {$sale->invoice_number}",
                'customer_id' => $sale->customer_id,
                'branch_id' => $sale->branch_id,
            ];
        }

        // 2. COGS & Inventory Entries
        // Calculate total cost from items (Assuming items have product cost, using product's cost_price)
        $totalCost = 0;
        foreach ($sale->items as $item) {
            $cost = $item->product->cost_price ?? 0;
            $totalCost += ($cost * $item->quantity);
        }

        if ($totalCost > 0) {
            // Debit COGS
            $lines[] = [
                'account_id' => $cogsAcc->id,
                'debit' => $totalCost,
                'credit' => 0,
                'description' => "COGS for {$sale->invoice_number}",
                'branch_id' => $sale->branch_id,
            ];
            // Credit Inventory
            $lines[] = [
                'account_id' => $inventoryAcc->id,
                'debit' => 0,
                'credit' => $totalCost,
                'description' => "Inventory usage for {$sale->invoice_number}",
                'branch_id' => $sale->branch_id,
            ];
        }

        $journalData = [
            'journal_date' => $sale->created_at ? $sale->created_at->toDateString() : now()->toDateString(),
            'description' => "Sale {$sale->invoice_number}",
            'reference_type' => 'Sale',
            'reference_id' => $sale->id,
            'branch_id' => $sale->branch_id,
            'created_by' => $sale->user_id,
        ];

        return $this->postJournal($journalData, $lines);
    }

    public function postPurchase($purchaseOrder, $goodsReceipt)
    {
        // Fetch Accounts
        $inventoryAcc = \App\Models\ChartOfAccount::where('code', '1400')->first();
        $apAcc = \App\Models\ChartOfAccount::where('code', '2100')->first();

        $lines = [];
        $totalCost = 0;

        foreach ($goodsReceipt->items as $grnItem) {
            // Find corresponding PO item to get unit cost
            $poItem = $purchaseOrder->items->firstWhere('id', $grnItem->purchase_order_item_id);
            if ($poItem && $grnItem->quantity_received > 0) {
                $cost = $poItem->unit_price * $grnItem->quantity_received;
                $totalCost += $cost;
            }
        }

        if ($totalCost > 0) {
            // Debit Inventory
            $lines[] = [
                'account_id' => $inventoryAcc->id,
                'debit' => $totalCost,
                'credit' => 0,
                'description' => "Inventory Receipt: {$goodsReceipt->reference}",
                'supplier_id' => $purchaseOrder->supplier_id,
                'branch_id' => $goodsReceipt->branch_id,
            ];

            // Credit Accounts Payable
            $lines[] = [
                'account_id' => $apAcc->id,
                'debit' => 0,
                'credit' => $totalCost,
                'description' => "Accounts Payable for {$goodsReceipt->reference}",
                'supplier_id' => $purchaseOrder->supplier_id,
                'branch_id' => $goodsReceipt->branch_id,
            ];

            $journalData = [
                'journal_date' => $goodsReceipt->created_at ? $goodsReceipt->created_at->toDateString() : now()->toDateString(),
                'description' => "Goods Receipt {$goodsReceipt->reference} for PO {$purchaseOrder->po_number}",
                'reference_type' => 'GoodsReceipt',
                'reference_id' => $goodsReceipt->id,
                'branch_id' => $goodsReceipt->branch_id,
                'created_by' => $goodsReceipt->user_id,
            ];

            return $this->postJournal($journalData, $lines);
        }

        return null;
    }

    public function postCustomerPayment($payment, $credit)
    {
        $cashAcc = \App\Models\ChartOfAccount::where('code', '1100')->first();
        $arAcc = \App\Models\ChartOfAccount::where('code', '1300')->first();

        $lines = [];
        
        // Debit Cash
        $lines[] = [
            'account_id' => $cashAcc->id,
            'debit' => $payment->amount,
            'credit' => 0,
            'description' => "Customer Payment Received: {$payment->reference}",
            'customer_id' => $credit->customer_id,
        ];

        // Credit AR
        $lines[] = [
            'account_id' => $arAcc->id,
            'debit' => 0,
            'credit' => $payment->amount,
            'description' => "AR Reduction for {$payment->reference}",
            'customer_id' => $credit->customer_id,
        ];

        $journalData = [
            'journal_date' => $payment->created_at ? $payment->created_at->toDateString() : now()->toDateString(),
            'description' => "Customer Payment for Credit #{$credit->id}",
            'reference_type' => 'CreditPayment',
            'reference_id' => $payment->id,
            'created_by' => $payment->user_id,
        ];

        return $this->postJournal($journalData, $lines);
    }

    public function postSupplierPayment($supplierPayment)
    {
        $cashAcc = \App\Models\ChartOfAccount::where('code', '1100')->first();
        $apAcc = \App\Models\ChartOfAccount::where('code', '2100')->first();

        $lines = [];
        
        // Debit AP
        $lines[] = [
            'account_id' => $apAcc->id,
            'debit' => $supplierPayment->amount,
            'credit' => 0,
            'description' => "Supplier Payment Made: {$supplierPayment->reference}",
            'supplier_id' => $supplierPayment->supplier_id,
        ];

        // Credit Cash
        $lines[] = [
            'account_id' => $cashAcc->id,
            'debit' => 0,
            'credit' => $supplierPayment->amount,
            'description' => "Cash reduction for supplier payment {$supplierPayment->reference}",
            'supplier_id' => $supplierPayment->supplier_id,
        ];

        $journalData = [
            'journal_date' => $supplierPayment->payment_date ?? now()->toDateString(),
            'description' => "Supplier Payment to Supplier #{$supplierPayment->supplier_id}",
            'reference_type' => 'SupplierPayment',
            'reference_id' => $supplierPayment->id,
            'created_by' => $supplierPayment->user_id ?? 1,
        ];

        return $this->postJournal($journalData, $lines);
    }

    public function postExpense($expense)
    {
        $cashAcc = \App\Models\ChartOfAccount::where('code', '1100')->first();
        
        // Find matching expense account by name, fallback to a general one or the first expense account
        $expenseAcc = \App\Models\ChartOfAccount::where('name', $expense->category->name)
            ->whereHas('type', function ($q) {
                $q->where('name', 'Expenses');
            })->first();

        if (!$expenseAcc) {
            $expenseAcc = \App\Models\ChartOfAccount::where('name', 'Other Operating Expenses')->first()
                       ?? \App\Models\ChartOfAccount::whereHas('type', function ($q) { $q->where('name', 'Expenses'); })->first();
        }

        $lines = [];
        
        // Debit Expense
        $lines[] = [
            'account_id' => $expenseAcc->id,
            'debit' => $expense->amount,
            'credit' => 0,
            'description' => "Expense: {$expense->category->name} - {$expense->reference}",
        ];

        // Credit Cash
        $lines[] = [
            'account_id' => $cashAcc->id,
            'debit' => 0,
            'credit' => $expense->amount,
            'description' => "Cash payment for expense {$expense->reference}",
        ];

        $journalData = [
            'journal_date' => $expense->date ?? now()->toDateString(),
            'description' => "Operating Expense: {$expense->category->name}",
            'reference_type' => 'Expense',
            'reference_id' => $expense->id,
            'created_by' => $expense->user_id ?? 1,
        ];

        return $this->postJournal($journalData, $lines);
    }

    public function postRefund($refund)
    {
        // Phase 5 (Returns): Refund Accounting
        // Reverse Revenue, Tax, Cash, Inventory, COGS
    }

    public function postCashVariance($register)
    {
        if ($register->variance == 0) return null;

        $cashAcc = \App\Models\ChartOfAccount::where('code', '1100')->first();
        
        // Find Cash Short/Over account (usually an expense or other income)
        $varianceAcc = \App\Models\ChartOfAccount::where('name', 'Cash Short and Over')->first() 
            ?? \App\Models\ChartOfAccount::where('name', 'Other Operating Expenses')->first();

        $lines = [];
        $amount = abs($register->variance);

        if ($register->variance > 0) {
            // Cash Over: Debit Cash, Credit Variance (Income)
            $lines[] = [
                'account_id' => $cashAcc->id,
                'debit' => $amount,
                'credit' => 0,
                'description' => "Cash Overage for Register {$register->id}",
            ];
            $lines[] = [
                'account_id' => $varianceAcc->id,
                'debit' => 0,
                'credit' => $amount,
                'description' => "Cash Overage for Register {$register->id}",
            ];
        } else {
            // Cash Short: Debit Variance (Expense), Credit Cash
            $lines[] = [
                'account_id' => $varianceAcc->id,
                'debit' => $amount,
                'credit' => 0,
                'description' => "Cash Shortage for Register {$register->id}",
            ];
            $lines[] = [
                'account_id' => $cashAcc->id,
                'debit' => 0,
                'credit' => $amount,
                'description' => "Cash Shortage for Register {$register->id}",
            ];
        }

        $journalData = [
            'journal_date' => $register->closed_at ? $register->closed_at->toDateString() : now()->toDateString(),
            'description' => "Cash Register Variance: " . ($register->variance > 0 ? 'Overage' : 'Shortage'),
            'reference_type' => 'CashRegister',
            'reference_id' => $register->id,
            'branch_id' => $register->branch_id,
            'created_by' => $register->user_id ?? 1,
        ];

        return $this->postJournal($journalData, $lines);
    }
}

