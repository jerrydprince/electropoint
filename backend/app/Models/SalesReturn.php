<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalesReturn extends Model
{
    protected $fillable = [
        'sale_id', 'customer_id', 'branch_id', 'user_id', 'return_number', 
        'status', 'total_amount', 'notes'
    ];

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(SalesReturnItem::class);
    }

    public function refunds()
    {
        return $this->hasMany(Refund::class);
    }
}
