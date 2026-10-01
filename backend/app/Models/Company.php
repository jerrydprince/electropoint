<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    protected $fillable = [
        'name',
        'logo',
        'email',
        'phone',
        'address',
        'tax_number',
        'currency',
        'receipt_configuration',
        'status'
    ];

    protected $casts = [
        'receipt_configuration' => 'array',
    ];

    public function branches()
    {
        return $this->hasMany(Branch::class);
    }
}
