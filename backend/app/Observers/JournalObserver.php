<?php

namespace App\Observers;

use App\Models\JournalEntry;
use App\Models\JournalLine;
use Exception;

class JournalObserver
{
    /**
     * Prevent updating posted journals.
     */
    public function updating(JournalEntry $journalEntry)
    {
        if ($journalEntry->getOriginal('status') === 'posted') {
            throw new Exception("Security Violation: Cannot modify a posted journal entry. Please reverse it or create an adjusting journal.");
        }
    }

    /**
     * Prevent deleting posted journals.
     */
    public function deleting(JournalEntry $journalEntry)
    {
        if ($journalEntry->status === 'posted') {
            throw new Exception("Security Violation: Cannot delete a posted journal entry.");
        }
    }
}
