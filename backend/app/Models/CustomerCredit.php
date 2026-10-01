<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerCredit extends Model
{
    protected $fillable = [
        'customer_id', 'sale_id', 'amount', 'balance', 'due_date', 'status'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'balance' => 'decimal:2',
        'due_date' => 'date',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    public function payments()
    {
        return $this->hasMany(CreditPayment::class);
    }
}
