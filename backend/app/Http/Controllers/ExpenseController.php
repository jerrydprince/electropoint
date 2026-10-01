<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\ExpenseCategory;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function categories()
    {
        return $this->success(ExpenseCategory::all());
    }

    public function index(Request $request)
    {
        $query = Expense::with(['category', 'user'])->orderBy('date', 'desc');

        if ($request->category_id) {
            $query->where('expense_category_id', $request->category_id);
        }

        if ($request->date_from) {
            $query->whereDate('date', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('date', '<=', $request->date_to);
        }

        return $this->success($query->paginate(20));
    }

    public function store(Request $request, \App\Services\AccountingService $accountingService)
    {
        $request->validate([
            'expense_category_id' => 'required|exists:expense_categories,id',
            'amount' => 'required|numeric|min:0.01',
            'date' => 'required|date',
        ]);

        $expense = Expense::create([
            'expense_category_id' => $request->expense_category_id,
            'user_id' => $request->user()->id,
            'amount' => $request->amount,
            'reference' => $request->reference,
            'date' => $request->date,
            'notes' => $request->notes,
        ]);

        $expense->load('category');
        $accountingService->postExpense($expense);

        return $this->success($expense, 'Expense logged successfully', 201);
    }
}
