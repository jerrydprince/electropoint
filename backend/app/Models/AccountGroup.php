<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccountGroup extends Model
{
    protected $fillable = ['account_type_id', 'name', 'description'];
    
    public function type()
    {
        return $this->belongsTo(AccountType::class, 'account_type_id');
    }
    
    public function accounts()
    {
        return $this->hasMany(ChartOfAccount::class);
    }
}
