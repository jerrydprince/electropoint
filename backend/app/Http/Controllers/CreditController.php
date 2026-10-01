<?php

namespace App\Http\Controllers;

use App\Models\CustomerCredit;
use App\Services\CreditService;
use Illuminate\Http\Request;

class CreditController extends Controller
{
    protected $creditService;

    public function __construct(CreditService $creditService)
    {
        $this->creditService = $creditService;
    }

    public function index(Request $request)
    {
        $query = CustomerCredit::with(['customer', 'sale']);
        
        if ($request->customer_id) {
            $query->where('customer_id', $request->customer_id);
        }
        if ($request->status) {
            $query->where('status', $request->status);
        }

        return $this->success($query->latest('due_date')->paginate(15));
    }

    public function show(CustomerCredit $credit)
    {
        return $this->success($credit->load(['customer', 'sale', 'payments.user']));
    }

    public function pay(Request $request, CustomerCredit $credit)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string'
        ]);

        try {
            $payment = $this->creditService->recordPayment(
                $credit,
                $request->amount,
                $request->payment_method,
                $request->reference,
                $request->user()->id ?? 1
            );
            return $this->success($payment, 'Payment recorded successfully.', 201);
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }
}
