<?php
$data = json_decode(file_get_contents('phpstan-report.json'), true);
$missingRelations = [];
foreach ($data['files'] as $file => $fileData) {
    foreach ($fileData['messages'] as $message) {
        if ($message['identifier'] === 'larastan.relationExistence') {
            $missingRelations[] = basename($file) . " (line {$message['line']}): {$message['message']}";
        }
    }
}
$missingRelations = array_unique($missingRelations);
echo "Missing Relations Found:\n" . implode("\n", $missingRelations) . "\n";
