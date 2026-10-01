<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Supply extends Model
{
    protected $fillable = ['supply_category_id', 'name', 'sku', 'unit', 'reorder_level', 'description'];

    public function category()
    {
        return $this->belongsTo(SupplyCategory::class, 'supply_category_id');
    }

    public function stocks()
    {
        return $this->hasMany(SupplyStock::class);
    }
}
