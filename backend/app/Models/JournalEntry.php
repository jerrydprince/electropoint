<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JournalEntry extends Model
{
    protected $fillable = [
        'journal_number', 'journal_date', 'description', 'reference_type', 
        'reference_id', 'branch_id', 'currency', 'status', 'created_by', 
        'posted_by', 'posted_at', 'reversal_of_id'
    ];
    
    protected $casts = [
        'journal_date' => 'date',
        'posted_at' => 'datetime',
    ];
    
    public function lines()
    {
        return $this->hasMany(JournalEntryLine::class);
    }
    
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
    
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    
    public function postedBy()
    {
        return $this->belongsTo(User::class, 'posted_by');
    }
    
    public function reversalOf()
    {
        return $this->belongsTo(JournalEntry::class, 'reversal_of_id');
    }
}
