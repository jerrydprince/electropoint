<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CashRegisterMovement extends Model
{
    use HasFactory;

    protected $fillable = [
        'cash_register_id',
        'type',
        'amount',
        'reference',
        'notes',
    ];

    public function register()
    {
        return $this->belongsTo(CashRegister::class, 'cash_register_id');
    }
}
