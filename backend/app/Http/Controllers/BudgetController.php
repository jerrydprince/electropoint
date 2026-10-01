<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Budget;
use App\Models\BudgetLine;
use App\Models\FiscalPeriod;
use Illuminate\Support\Facades\DB;
use App\Traits\ApiResponse;

class BudgetController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $branchId = $request->query('branch_id');

        $query = Budget::with(['branch', 'fiscalPeriod', 'lines.account']);
        
        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        $budgets = $query->orderBy('created_at', 'desc')->get();

        // Calculate actual utilization for each budget line
        foreach ($budgets as $budget) {
            if (!$budget->fiscalPeriod) continue;
            
            $startDate = $budget->fiscalPeriod->start_date;
            $endDate = $budget->fiscalPeriod->end_date;

            foreach ($budget->lines as $line) {
                // Calculate actual from journal entries
                // Assuming normal expense accounts have debit balance. Actual expense = debit - credit
                $actual = DB::table('journal_entry_lines')
                    ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
                    ->where('journal_entry_lines.account_id', $line->account_id)
                    ->where('journal_entries.status', 'posted')
                    ->whereBetween('journal_entries.journal_date', [$startDate, $endDate]);

                if ($budget->branch_id) {
                    $actual->where('journal_entry_lines.branch_id', $budget->branch_id);
                }

                // Sum debit - credit (for expense accounts)
                $balance = $actual->sum(DB::raw('debit - credit'));
                $line->actual_amount = (float) $balance;
                
                // Calculate percentage
                $line->utilization_percentage = $line->amount > 0 ? min(100, round(($line->actual_amount / $line->amount) * 100, 2)) : 0;
            }
        }

        return $this->success($budgets);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'fiscal_period_id' => 'required|exists:fiscal_periods,id',
            'branch_id' => 'nullable|exists:branches,id',
            'lines' => 'required|array',
            'lines.*.account_id' => 'required|exists:chart_of_accounts,id',
            'lines.*.amount' => 'required|numeric|min:0'
        ]);

        DB::beginTransaction();
        try {
            $budget = Budget::create([
                'name' => $validated['name'],
                'fiscal_period_id' => $validated['fiscal_period_id'],
                'branch_id' => $validated['branch_id'],
                'status' => 'draft' // or active
            ]);

            foreach ($validated['lines'] as $line) {
                BudgetLine::create([
                    'budget_id' => $budget->id,
                    'account_id' => $line['account_id'],
                    'amount' => $line['amount']
                ]);
            }

            DB::commit();
            return $this->success($budget->load(['lines.account']), 'Budget created successfully', 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Failed to create budget: ' . $e->getMessage(), 500);
        }
    }

    public function show($id)
    {
        $budget = Budget::with(['branch', 'fiscalPeriod', 'lines.account'])->findOrFail($id);
        
        // Similar utilization logic as index...
        if ($budget->fiscalPeriod) {
            $startDate = $budget->fiscalPeriod->start_date;
            $endDate = $budget->fiscalPeriod->end_date;

            foreach ($budget->lines as $line) {
                $actual = DB::table('journal_entry_lines')
                    ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
                    ->where('journal_entry_lines.account_id', $line->account_id)
                    ->where('journal_entries.status', 'posted')
                    ->whereBetween('journal_entries.journal_date', [$startDate, $endDate]);

                if ($budget->branch_id) {
                    $actual->where('journal_entry_lines.branch_id', $budget->branch_id);
                }

                $balance = $actual->sum(DB::raw('debit - credit'));
                $line->actual_amount = (float) $balance;
                $line->utilization_percentage = $line->amount > 0 ? min(100, round(($line->actual_amount / $line->amount) * 100, 2)) : 0;
            }
        }

        return $this->success($budget);
    }

    public function update(Request $request, $id)
    {
        $budget = Budget::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'status' => 'sometimes|required|in:draft,active,closed',
            'lines' => 'sometimes|required|array',
            'lines.*.account_id' => 'required|exists:chart_of_accounts,id',
            'lines.*.amount' => 'required|numeric|min:0'
        ]);

        DB::beginTransaction();
        try {
            if (isset($validated['name'])) $budget->name = $validated['name'];
            if (isset($validated['status'])) $budget->status = $validated['status'];
            $budget->save();

            if (isset($validated['lines'])) {
                $budget->lines()->delete(); // recreate lines
                foreach ($validated['lines'] as $line) {
                    BudgetLine::create([
                        'budget_id' => $budget->id,
                        'account_id' => $line['account_id'],
                        'amount' => $line['amount']
                    ]);
                }
            }

            DB::commit();
            return $this->success($budget->load(['lines.account']), 'Budget updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Failed to update budget: ' . $e->getMessage(), 500);
        }
    }

    public function destroy($id)
    {
        $budget = Budget::findOrFail($id);
        $budget->delete();
        return $this->success(null, 'Budget deleted successfully');
    }
}
