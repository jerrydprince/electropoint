<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$controllersDir = __DIR__.'/app/Http/Controllers';
$files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($controllersDir));
$phpFiles = new RegexIterator($files, '/\.php$/');

$errors = [];

foreach ($phpFiles as $file) {
    $content = file_get_contents($file->getRealPath());
    
    // Find Model::with(...) calls
    if (preg_match_all('/([A-Z][a-zA-Z0-9_]*)::with\(\[\s*(.*?)\s*\]\)/s', $content, $matches, PREG_SET_ORDER)) {
        foreach ($matches as $match) {
            $modelClass = "App\\Models\\" . $match[1];
            if (!class_exists($modelClass)) continue;

            $relationsString = $match[2];
            // Match 'relation' or "relation"
            if (preg_match_all('/[\'"]([a-zA-Z0-9_\.]+)[\'"]/', $relationsString, $relMatches)) {
                foreach ($relMatches[1] as $relation) {
                    $parts = explode('.', $relation);
                    $methodName = $parts[0];
                    
                    if (!method_exists($modelClass, $methodName)) {
                        $errors[] = "Crash Risk: Model {$modelClass} is missing relation '{$methodName}' (found in {$file->getFilename()})";
                    }
                }
            }
        }
    }
}

if (empty($errors)) {
    echo "No missing eager-loaded relations found!\n";
} else {
    echo implode("\n", array_unique($errors)) . "\n";
}
