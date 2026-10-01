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
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->renameColumn('event', 'action');
            $table->renameColumn('auditable_type', 'module');
            $table->renameColumn('auditable_id', 'record_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->renameColumn('action', 'event');
            $table->renameColumn('module', 'auditable_type');
            $table->renameColumn('record_id', 'auditable_id');
        });
    }
};
