<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccountType extends Model
{
    protected $fillable = ['name', 'description', 'normal_balance'];
    
    public function groups()
    {
        return $this->hasMany(AccountGroup::class);
    }
}
