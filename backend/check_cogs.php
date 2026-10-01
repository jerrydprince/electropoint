<?php
use App\Models\ChartOfAccount;

$cogs = ChartOfAccount::where('code', '5000')->first();
echo "COGS Account: " . ($cogs ? "{$cogs->id} - {$cogs->name}" : 'Not Found') . "\n";
