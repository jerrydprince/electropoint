<?php

$dir = __DIR__ . '/backend/database/migrations/';
$files = glob($dir . '*.php');

foreach ($files as $file) {
    $content = file_get_contents($file);
    // Fix double closures
    $content = preg_replace('/\}\);\s*\}\s*\}\);\s*\}/s', "});\n    }", $content);
    
    // Specifically for alter_users_table which might have double down methods
    if (str_contains($file, 'alter_users_table')) {
        $content = preg_replace('/public function down\(\): void\s*\{\s*Schema::table\(\'users\', function \(Blueprint \$table\) \{\s*\$table->dropForeign\(\[\'company_id\'\]\);\s*\$table->dropForeign\(\[\'branch_id\'\]\);\s*\$table->dropColumn\(\[\'company_id\', \'branch_id\', \'status\', \'last_login_at\', \'last_login_ip\', \'deleted_at\'\]\);\s*\}\);\s*\}\s*public function down\(\): void\s*\{\s*Schema::table\(\'users\', function \(Blueprint \$table\) \{\s*\}\);\s*\}/s', 
        "public function down(): void\n    {\n        Schema::table('users', function (Blueprint \$table) {\n            \$table->dropForeign(['company_id']);\n            \$table->dropForeign(['branch_id']);\n            \$table->dropColumn(['company_id', 'branch_id', 'status', 'last_login_at', 'last_login_ip', 'deleted_at']);\n        });\n    }", $content);
    }
    
    file_put_contents($file, $content);
}
echo "Fixed double closures.\n";
