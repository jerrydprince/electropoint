<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockTransferRequest extends Model
{
    protected $fillable = [
        'product_id', 'from_warehouse_id', 'to_warehouse_id', 'quantity', 'serials',
        'status', 'requested_by', 'approved_by', 'reference', 'reason'
    ];

    protected $casts = [
        'serials' => 'array',
    ];

    public function product() { return $this->belongsTo(Product::class); }
    public function fromWarehouse() { return $this->belongsTo(Warehouse::class, 'from_warehouse_id'); }
    public function toWarehouse() { return $this->belongsTo(Warehouse::class, 'to_warehouse_id'); }
    public function requester() { return $this->belongsTo(User::class, 'requested_by'); }
    public function approver() { return $this->belongsTo(User::class, 'approved_by'); }
}
