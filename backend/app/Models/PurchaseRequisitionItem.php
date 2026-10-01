<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseRequisitionItem extends Model
{
    protected $fillable = [
        'purchase_requisition_id', 'product_id', 'quantity', 'expected_date'
    ];

    public function purchaseRequisition()
    {
        return $this->belongsTo(PurchaseRequisition::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
