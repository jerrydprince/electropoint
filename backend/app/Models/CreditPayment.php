<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CreditPayment extends Model
{
    protected $fillable = [
        'customer_credit_id', 'amount', 'payment_method', 'reference', 'user_id'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function customerCredit()
    {
        return $this->belongsTo(CustomerCredit::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
