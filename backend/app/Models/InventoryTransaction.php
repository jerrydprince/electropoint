<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryTransaction extends Model
{
    protected $fillable = ['product_id', 'warehouse_id', 'type', 'quantity', 'reference', 'reason', 'user_id'];

    public function product() { return $this->belongsTo(Product::class); }
    public function warehouse() { return $this->belongsTo(Warehouse::class); }
    public function user() { return $this->belongsTo(User::class); }
    public function serials() { return $this->hasMany(ProductSerial::class, 'transaction_id'); }
}
