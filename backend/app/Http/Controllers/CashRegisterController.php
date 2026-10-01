<?php

namespace App\Http\Controllers;

use App\Models\CashRegister;
use App\Models\CashRegisterMovement;
use Illuminate\Http\Request;

class CashRegisterController extends Controller
{
    public function current(Request $request)
    {
        $register = CashRegister::with(['movements'])
            ->where('user_id', $request->user()->id)
            ->where('status', 'open')
            ->first();

        return $this->success($register);
    }

    public function open(Request $request)
    {
        $request->validate([
            'opening_amount' => 'required|numeric|min:0',
        ]);

        // Check if already open
        $existing = CashRegister::where('user_id', $request->user()->id)
            ->where('status', 'open')
            ->first();

        if ($existing) {
            return $this->error("You already have an open register.", 400);
        }

        $register = CashRegister::create([
            'branch_id' => $request->user()->branch_id ?? 1,
            'user_id' => $request->user()->id,
            'opened_at' => now(),
            'opening_amount' => $request->opening_amount,
            'status' => 'open'
        ]);

        return $this->success($register, "Register opened successfully", 201);
    }

    public function logMovement(Request $request)
    {
        $request->validate([
            'type' => 'required|in:cash_in,cash_out',
            'amount' => 'required|numeric|min:0.01',
        ]);

        $register = CashRegister::where('user_id', $request->user()->id)
            ->where('status', 'open')
            ->first();

        if (!$register) {
            return $this->error("No open register found.", 400);
        }

        $amount = $request->type === 'cash_in' ? $request->amount : -$request->amount;

        $movement = CashRegisterMovement::create([
            'cash_register_id' => $register->id,
            'type' => $request->type,
            'amount' => $amount,
            'reference' => $request->reference,
            'notes' => $request->notes,
        ]);

        return $this->success($movement, "Movement logged");
    }

    public function close(Request $request, \App\Services\AccountingService $accountingService)
    {
        $request->validate([
            'actual_amount' => 'required|numeric|min:0',
        ]);

        $register = CashRegister::where('user_id', $request->user()->id)
            ->where('status', 'open')
            ->first();

        if (!$register) {
            return $this->error("No open register found.", 400);
        }

        // Calculate expected
        $movementsTotal = CashRegisterMovement::where('cash_register_id', $register->id)->sum('amount');
        $expected = $register->opening_amount + $movementsTotal;
        $variance = $request->actual_amount - $expected;

        $register->update([
            'closed_at' => now(),
            'expected_amount' => $expected,
            'actual_amount' => $request->actual_amount,
            'variance' => $variance,
            'closing_notes' => $request->closing_notes,
            'status' => 'closed'
        ]);

        // Phase 10: Record Cash Variance
        $accountingService->postCashVariance($register);

        return $this->success($register, "Register closed successfully");
    }
}
