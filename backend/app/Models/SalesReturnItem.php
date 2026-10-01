<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalesReturnItem extends Model
{
    protected $fillable = [
        'sales_return_id', 'sale_item_id', 'product_id', 'quantity', 
        'serials', 'reason', 'condition', 'unit_price', 'total'
    ];

    protected $casts = [
        'serials' => 'array',
        'unit_price' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function salesReturn()
    {
        return $this->belongsTo(SalesReturn::class);
    }

    public function saleItem()
    {
        return $this->belongsTo(SaleItem::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
