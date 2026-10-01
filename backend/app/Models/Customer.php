<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'company_id',
        'customer_code',
        'title',
        'first_name',
        'last_name',
        'company_name',
        'phone',
        'email',
        'address',
        'customer_type',
        'credit_limit',
        'loyalty_points',
        'notes',
        'status'
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function getFullNameAttribute()
    {
        return trim("{$this->title} {$this->first_name} {$this->last_name}");
    }
    public function corporateAccount()
    {
        return $this->belongsTo(Customer::class, 'corporate_account_id');
    }

    public function staffMembers()
    {
        return $this->hasMany(Customer::class, 'corporate_account_id');
    }

    public function corporatePlan()
    {
        return $this->belongsTo(CorporatePlan::class, 'corporate_plan_id');
    }
}
