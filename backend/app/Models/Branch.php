<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    protected $fillable = [
        'company_id',
        'manager_id',
        'name',
        'code',
        'email',
        'phone',
        'address',
        'status'
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function warehouses()
    {
        return $this->hasMany(Warehouse::class);
    }
}
