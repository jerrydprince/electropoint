<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupplyStock extends Model
{
    protected $fillable = ['supply_id', 'branch_id', 'quantity'];

    public function supply()
    {
        return $this->belongsTo(Supply::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
