<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WarrantyClaim extends Model
{
    use HasFactory;

    protected $fillable = [
        'claim_number',
        'warranty_id',
        'complaint',
        'technician_name',
        'diagnosis',
        'action_taken',
        'parts_used',
        'status',
        'notes',
    ];

    public function warranty()
    {
        return $this->belongsTo(Warranty::class);
    }
}
