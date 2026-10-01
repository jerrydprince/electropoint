<?php

$dir = __DIR__ . '/backend/database/migrations/';
$files = glob($dir . '*.php');

$templates = [
    'create_companies_table' => <<<PHP
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('companies', function (Blueprint \$table) {
            \$table->id();
            \$table->string('name');
            \$table->string('email')->nullable();
            \$table->string('phone')->nullable();
            \$table->text('address')->nullable();
            \$table->enum('status', ['active', 'inactive'])->default('active');
            \$table->timestamps();
            \$table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
PHP,
    'create_branches_table' => <<<PHP
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('branches', function (Blueprint \$table) {
            \$table->id();
            \$table->foreignId('company_id')->constrained()->cascadeOnDelete();
            \$table->string('name');
            \$table->string('code')->unique();
            \$table->string('email')->nullable();
            \$table->string('phone')->nullable();
            \$table->text('address')->nullable();
            \$table->enum('status', ['active', 'inactive'])->default('active');
            \$table->timestamps();
            \$table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('branches');
    }
};
PHP,
    'create_warehouses_table' => <<<PHP
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('warehouses', function (Blueprint \$table) {
            \$table->id();
            \$table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            \$table->string('name');
            \$table->string('code')->unique();
            \$table->text('address')->nullable();
            \$table->enum('status', ['active', 'inactive'])->default('active');
            \$table->timestamps();
            \$table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('warehouses');
    }
};
PHP,
    'create_roles_table' => <<<PHP
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint \$table) {
            \$table->id();
            \$table->string('name');
            \$table->string('slug')->unique();
            \$table->text('description')->nullable();
            \$table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
PHP,
    'create_permissions_table' => <<<PHP
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('permissions', function (Blueprint \$table) {
            \$table->id();
            \$table->string('name');
            \$table->string('slug')->unique();
            \$table->string('group')->nullable();
            \$table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('permissions');
    }
};
PHP,
    'create_settings_table' => <<<PHP
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint \$table) {
            \$table->id();
            \$table->string('key')->unique();
            \$table->text('value')->nullable();
            \$table->string('type')->default('string');
            \$table->string('group')->default('general');
            \$table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
PHP,
    'create_audit_logs_table' => <<<PHP
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint \$table) {
            \$table->id();
            \$table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            \$table->string('event');
            \$table->string('auditable_type')->nullable();
            \$table->unsignedBigInteger('auditable_id')->nullable();
            \$table->json('old_values')->nullable();
            \$table->json('new_values')->nullable();
            \$table->string('url')->nullable();
            \$table->string('ip_address')->nullable();
            \$table->string('user_agent')->nullable();
            \$table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
PHP,
    'alter_users_table' => <<<PHP
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint \$table) {
            \$table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
            \$table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            \$table->enum('status', ['active', 'inactive'])->default('active')->after('password');
            \$table->timestamp('last_login_at')->nullable();
            \$table->string('last_login_ip')->nullable();
            \$table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint \$table) {
            \$table->dropForeign(['company_id']);
            \$table->dropForeign(['branch_id']);
            \$table->dropColumn(['company_id', 'branch_id', 'status', 'last_login_at', 'last_login_ip', 'deleted_at']);
        });
    }
};
PHP,
    'create_role_user_table' => <<<PHP
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('role_user', function (Blueprint \$table) {
            \$table->foreignId('user_id')->constrained()->cascadeOnDelete();
            \$table->foreignId('role_id')->constrained()->cascadeOnDelete();
            \$table->primary(['user_id', 'role_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('role_user');
    }
};
PHP,
    'create_permission_role_table' => <<<PHP
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('permission_role', function (Blueprint \$table) {
            \$table->foreignId('permission_id')->constrained()->cascadeOnDelete();
            \$table->foreignId('role_id')->constrained()->cascadeOnDelete();
            \$table->primary(['permission_id', 'role_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('permission_role');
    }
};
PHP
];

foreach ($files as $file) {
    foreach ($templates as $key => $template) {
        if (str_contains($file, $key)) {
            file_put_contents($file, $template);
            echo "Recreated \$key\n";
        }
    }
}
echo "Done replacing.";
