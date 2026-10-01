<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Warranty extends Model
{
    use HasFactory;

    protected $fillable = [
        'warranty_number',
        'product_id',
        'sale_id',
        'customer_id',
        'product_serial_id',
        'serial_number',
        'purchase_date',
        'start_date',
        'expiry_date',
        'status',
        'terms',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function productSerial()
    {
        return $this->belongsTo(ProductSerial::class);
    }

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function claims()
    {
        return $this->hasMany(WarrantyClaim::class);
    }
}
