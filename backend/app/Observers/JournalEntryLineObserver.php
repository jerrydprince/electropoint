<?php

namespace App\Observers;

use App\Models\JournalEntryLine;
use App\Models\JournalEntry;
use Exception;

class JournalEntryLineObserver
{
    /**
     * Prevent updating lines of posted journals.
     */
    public function updating(JournalEntryLine $line)
    {
        $journal = JournalEntry::find($line->journal_entry_id);
        if ($journal && $journal->status === 'posted') {
            throw new Exception("Security Violation: Cannot modify lines of a posted journal entry.");
        }
    }

    /**
     * Prevent deleting lines of posted journals.
     */
    public function deleting(JournalEntryLine $line)
    {
        $journal = JournalEntry::find($line->journal_entry_id);
        if ($journal && $journal->status === 'posted') {
            throw new Exception("Security Violation: Cannot delete lines of a posted journal entry.");
        }
    }
}
