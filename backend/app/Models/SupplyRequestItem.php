<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupplyRequestItem extends Model
{
    protected $fillable = ['supply_request_id', 'supply_id', 'quantity_requested', 'quantity_issued'];

    public function request()
    {
        return $this->belongsTo(SupplyRequest::class, 'supply_request_id');
    }

    public function supply()
    {
        return $this->belongsTo(Supply::class);
    }
}
