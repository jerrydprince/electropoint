<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JournalEntryLine extends Model
{
    protected $fillable = [
        'journal_entry_id', 'account_id', 'debit', 'credit', 
        'description', 'customer_id', 'supplier_id', 'branch_id'
    ];
    
    public function journalEntry()
    {
        return $this->belongsTo(JournalEntry::class);
    }
    
    public function account()
    {
        return $this->belongsTo(ChartOfAccount::class, 'account_id');
    }
    
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
    
    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }
    
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
