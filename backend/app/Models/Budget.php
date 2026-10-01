<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Budget extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'fiscal_period_id',
        'branch_id',
        'status'
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function fiscalPeriod()
    {
        return $this->belongsTo(FiscalPeriod::class);
    }

    public function lines()
    {
        return $this->hasMany(BudgetLine::class);
    }
}
