<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupplyRequest extends Model
{
    protected $fillable = ['branch_id', 'user_id', 'status', 'notes'];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class); // The requester
    }

    public function items()
    {
        return $this->hasMany(SupplyRequestItem::class);
    }
}
