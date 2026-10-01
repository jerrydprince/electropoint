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
        Schema::table('corporate_plans', function (Blueprint $table) {
            $table->string('discount_type')->default('percentage')->after('name'); // 'percentage' or 'fixed'
            $table->decimal('fixed_discount', 12, 2)->default(0)->after('discount_percentage');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('corporate_plans', function (Blueprint $table) {
            $table->dropColumn(['discount_type', 'fixed_discount']);
        });
    }
};
