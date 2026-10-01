<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Inventory extends Model
{
    use Auditable;

    protected $fillable = ['product_id', 'warehouse_id', 'quantity', 'reserved_quantity', 'damaged_quantity'];

    public function product() { return $this->belongsTo(Product::class); }
    public function warehouse() { return $this->belongsTo(Warehouse::class); }
}
