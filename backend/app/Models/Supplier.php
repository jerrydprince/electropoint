<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    protected $fillable = [
        'company_id', 'name', 'email', 'phone', 'address', 
        'tax_number', 'credit_limit', 'bank_details', 'status'
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function contacts()
    {
        return $this->hasMany(SupplierContact::class);
    }

    public function purchaseOrders()
    {
        return $this->hasMany(PurchaseOrder::class);
    }
}
