<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaystackTransaction extends Model
{
    protected $fillable = [
        'reference', 'amount', 'currency', 'email', 'status', 
        'gateway_response', 'sale_id', 'customer_id', 'paid_at'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'gateway_response' => 'array',
        'paid_at' => 'datetime'
    ];

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
