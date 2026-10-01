<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
    public function up(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('expense_category_id');
        });

        Schema::table('customer_credits', function (Blueprint $table) {
            $table->index('status');
        });

        Schema::table('supplier_invoices', function (Blueprint $table) {
            $table->index('status');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['company_id']);
        });

        Schema::table('sale_items', function (Blueprint $table) {
            $table->dropIndex(['sale_id']);
            $table->dropIndex(['product_id']);
        });

        Schema::table('expenses', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['expense_category_id']);
        });

        Schema::table('customer_credits', function (Blueprint $table) {
            $table->dropIndex(['status']);
        });

        Schema::table('supplier_invoices', function (Blueprint $table) {
            $table->dropIndex(['status']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['status']);
        });
    }
};
