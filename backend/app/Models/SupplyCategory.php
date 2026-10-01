<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupplyCategory extends Model
{
    protected $fillable = ['company_id', 'name', 'description'];

    public function supplies()
    {
        return $this->hasMany(Supply::class);
    }
}
