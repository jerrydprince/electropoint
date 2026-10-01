<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupplyTransaction extends Model
{
    protected $fillable = ['supply_id', 'branch_id', 'user_id', 'type', 'quantity', 'reference', 'notes'];

    public function supply()
    {
        return $this->belongsTo(Supply::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
