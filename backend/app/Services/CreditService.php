<?php

namespace App\Services;

use App\Models\CustomerCredit;
use App\Models\CreditPayment;
use Illuminate\Support\Facades\DB;
use Exception;

class CreditService
{
    protected $accountingService;

    public function __construct(AccountingService $accountingService)
    {
        $this->accountingService = $accountingService;
    }

    public function recordPayment(CustomerCredit $credit, $amount, $paymentMethod, $reference, $userId)
    {
        return DB::transaction(function () use ($credit, $amount, $paymentMethod, $reference, $userId) {
            if ($amount <= 0) {
                throw new Exception("Payment amount must be greater than zero.");
            }
            if ($amount > $credit->balance) {
                throw new Exception("Payment amount cannot exceed outstanding balance.");
            }

            $payment = CreditPayment::create([
                'customer_credit_id' => $credit->id,
                'amount' => $amount,
                'payment_method' => $paymentMethod,
                'reference' => $reference,
                'user_id' => $userId
            ]);

            $credit->balance -= $amount;
            
            if ($credit->balance <= 0) {
                $credit->status = 'paid';
            }

            $credit->save();

            // Phase 7: Post to Accounting Engine
            $this->accountingService->postCustomerPayment($payment, $credit);

            return $payment;
        });
    }
}
