<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Product extends Model
{
    use Auditable;

    protected $fillable = [
        'name', 'sku', 'barcode', 'brand_id', 'category_id', 'unit_id', 
        'model', 'description', 'image', 'cost_price', 'selling_price', 
        'wholesale_price', 'tax_rate', 'min_stock', 'max_stock', 
        'reorder_level', 'warranty_period', 'warranty_type', 
        'serial_tracking', 'status'
    ];

    protected $casts = [
        'serial_tracking' => 'boolean',
        'cost_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'wholesale_price' => 'decimal:2',
    ];

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function priceHistories()
    {
        return $this->hasMany(PriceHistory::class)->latest();
    }

    public function inventories()
    {
        return $this->hasMany(Inventory::class);
    }

    public function inventoryTransactions()
    {
        return $this->hasMany(InventoryTransaction::class);
    }

    public function serials()
    {
        return $this->hasMany(ProductSerial::class);
    }
}
