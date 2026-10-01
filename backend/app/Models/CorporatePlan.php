<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CorporatePlan extends Model
{
    protected $fillable = [
        'company_id',
        'name',
        'discount_percentage',
        'description',
        'is_active',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function corporateAccounts()
    {
        return $this->hasMany(Customer::class, 'corporate_plan_id');
    }
}
