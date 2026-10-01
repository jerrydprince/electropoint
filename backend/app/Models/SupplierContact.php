<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupplierContact extends Model
{
    protected $fillable = [
        'supplier_id', 'name', 'email', 'phone', 'position', 'is_primary'
    ];

    protected $casts = [
        'is_primary' => 'boolean',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }
}
