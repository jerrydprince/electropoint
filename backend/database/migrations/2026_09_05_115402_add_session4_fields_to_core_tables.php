<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->string('logo')->nullable()->after('name');
            $table->string('tax_number')->nullable()->after('address');
            $table->string('currency')->default('USD')->after('tax_number');
            $table->json('receipt_configuration')->nullable()->after('currency');
        });

        Schema::table('branches', function (Blueprint $table) {
            $table->foreignId('manager_id')->nullable()->after('company_id')->constrained('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('branches', function (Blueprint $table) {
            $table->dropForeign(['manager_id']);
            $table->dropColumn('manager_id');
        });

        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn(['logo', 'tax_number', 'currency', 'receipt_configuration']);
        });
    }
};
