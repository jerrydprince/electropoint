<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;
use Illuminate\Database\Eloquent\SoftDeletes;

class Sale extends Model
{
    use SoftDeletes, Auditable;

    protected $fillable = [
        'company_id',
        'branch_id',
        'user_id',
        'customer_id',
        'invoice_number',
        'subtotal',
        'discount_amount',
        'tax_amount',
        'grand_total',
        'status',
        'payment_status',
        'notes'
    ];

    public function items()
    {
        return $this->hasMany(SaleItem::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
