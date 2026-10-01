<?php

namespace App\Http\Controllers;

use App\Models\ChartOfAccount;
use App\Models\JournalEntry;
use Illuminate\Http\Request;

class AccountingController extends Controller
{
    public function chartOfAccounts(Request $request)
    {
        $query = ChartOfAccount::with(['group.type'])->orderBy('code');
        return $this->success($query->get());
    }

    public function accountGroups()
    {
        return $this->success(\App\Models\AccountGroup::with('type')->get());
    }

    public function storeChartOfAccount(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:chart_of_accounts,code',
            'name' => 'required|string',
            'account_group_id' => 'required|exists:account_groups,id',
            'description' => 'nullable|string',
        ]);

        $group = \App\Models\AccountGroup::with('type')->findOrFail($validated['account_group_id']);

        $account = ChartOfAccount::create([
            'code' => $validated['code'],
            'name' => $validated['name'],
            'account_group_id' => $group->id,
            'account_type_id' => $group->account_type_id,
            'description' => $validated['description'] ?? null,
            'normal_balance' => $group->type->normal_balance,
            'is_system_account' => false,
            'status' => true,
        ]);

        return $this->success($account, 'Account created successfully.');
    }

    public function toggleChartOfAccountStatus($id)
    {
        $account = ChartOfAccount::findOrFail($id);
        if ($account->is_system_account) {
            return $this->error('System accounts cannot be disabled.', 403);
        }
        $account->status = !$account->status;
        $account->save();
        return $this->success($account, 'Account status updated.');
    }

    public function journals(Request $request)
    {
        $query = JournalEntry::with(['lines.account', 'createdBy', 'branch'])->orderBy('journal_date', 'desc')->orderBy('id', 'desc');
        return $this->success($query->paginate(20));
    }

    public function journalDetails($id)
    {
        $journal = JournalEntry::with(['lines.account', 'createdBy', 'branch'])->findOrFail($id);
        return $this->success($journal);
    }

    public function ledger(Request $request)
    {
        $accountId = $request->query('account_id');
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $query = \App\Models\JournalEntryLine::with(['journalEntry', 'account'])
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->where('journal_entries.status', 'posted')
            ->select('journal_entry_lines.*', 'journal_entries.journal_date', 'journal_entries.journal_number', 'journal_entries.description')
            ->orderBy('journal_entries.journal_date', 'asc')
            ->orderBy('journal_entries.id', 'asc');

        if ($accountId) {
            $query->where('journal_entry_lines.account_id', $accountId);
        }
        if ($startDate) {
            $query->where('journal_entries.journal_date', '>=', $startDate);
        }
        if ($endDate) {
            $query->where('journal_entries.journal_date', '<=', $endDate);
        }

        $lines = $query->get();

        // Calculate running balance per account
        $balances = [];
        foreach ($lines as $line) {
            $accId = $line->account_id;
            if (!isset($balances[$accId])) $balances[$accId] = 0;
            
            // Assume normal debit accounts: Assets, Expenses. Normal credit: Liabilities, Equity, Revenue.
            // Simplified: we'll just track raw debit - credit and let the frontend format it
            $balances[$accId] += ($line->debit - $line->credit);
            $line->running_balance = $balances[$accId];
        }

        return $this->success($lines);
    }

    public function taxesSummary(Request $request)
    {
        // 2200 is typically Sales Tax Payable. We might also have an Input VAT account if configured.
        $taxAccount = ChartOfAccount::where('code', '2200')->first();
        if (!$taxAccount) {
            return $this->error('Tax account (2200) not found in Chart of Accounts', 404);
        }

        $startDate = $request->query('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->query('end_date', now()->endOfMonth()->toDateString());

        $lines = \App\Models\JournalEntryLine::with(['journalEntry'])
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->where('journal_entry_lines.account_id', $taxAccount->id)
            ->where('journal_entries.status', 'posted')
            ->whereBetween('journal_entries.journal_date', [$startDate, $endDate])
            ->select('journal_entry_lines.*', 'journal_entries.journal_date', 'journal_entries.journal_number', 'journal_entries.description')
            ->orderBy('journal_entries.journal_date', 'desc')
            ->get();

        $totalCollected = $lines->sum('credit'); // Output tax
        $totalPaid = $lines->sum('debit'); // Input tax (if any refunds or input VAT posted here)
        $netLiability = $totalCollected - $totalPaid;

        return $this->success([
            'total_collected' => $totalCollected,
            'total_paid' => $totalPaid,
            'net_liability' => $netLiability,
            'transactions' => $lines
        ]);
    }
}
