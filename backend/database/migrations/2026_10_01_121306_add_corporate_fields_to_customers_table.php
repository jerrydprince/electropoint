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
        Schema::table('customers', function (Blueprint $table) {
            // Links a staff member to their parent corporate account
            $table->foreignId('corporate_account_id')->nullable()->constrained('customers')->nullOnDelete();
            // Links a corporate account to a specific plan
            $table->foreignId('corporate_plan_id')->nullable()->constrained('corporate_plans')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropForeign(['corporate_account_id']);
            $table->dropForeign(['corporate_plan_id']);
            $table->dropColumn(['corporate_account_id', 'corporate_plan_id']);
        });
    }
};
