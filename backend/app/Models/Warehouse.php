<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Warehouse extends Model
{
    protected $fillable = [
        'branch_id',
        'name',
        'code',
        'address',
        'status'
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'branch_manager', 'warehouse_id', 'user_id');
    }

    public function inventories()
    {
        return $this->hasMany(Inventory::class);
    }

    public function inventoryTransactions()
    {
        return $this->hasMany(InventoryTransaction::class);
    }
}
