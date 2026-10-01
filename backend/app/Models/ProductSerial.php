<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductSerial extends Model
{
    protected $fillable = ['product_id', 'serial_number', 'warehouse_id', 'status', 'transaction_id'];

    public function product() { return $this->belongsTo(Product::class); }
    public function warehouse() { return $this->belongsTo(Warehouse::class); }
    public function transaction() { return $this->belongsTo(InventoryTransaction::class, 'transaction_id'); }
    public function warranty() { return $this->hasOne(Warranty::class); }
}
