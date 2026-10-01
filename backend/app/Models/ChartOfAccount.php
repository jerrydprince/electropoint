<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChartOfAccount extends Model
{
    protected $fillable = [
        'code', 'name', 'account_type_id', 'account_group_id', 
        'parent_id', 'description', 'normal_balance', 'is_system_account', 
        'status', 'branch_id'
    ];
    
    public function type()
    {
        return $this->belongsTo(AccountType::class, 'account_type_id');
    }
    
    public function group()
    {
        return $this->belongsTo(AccountGroup::class, 'account_group_id');
    }
    
    public function parent()
    {
        return $this->belongsTo(ChartOfAccount::class, 'parent_id');
    }
    
    public function children()
    {
        return $this->hasMany(ChartOfAccount::class, 'parent_id');
    }
}
