<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // 1. Add warranty_months to products
        Schema::table('products', function (Blueprint $table) {
            $table->integer('warranty_months')->nullable()->after('serial_tracking');
        });

        // 2. Create warranties table
        Schema::create('warranties', function (Blueprint $table) {
            $table->id();
            $table->string('warranty_number')->unique();
            $table->foreignId('product_id')->constrained('products');
            $table->foreignId('sale_id')->constrained('sales');
            $table->foreignId('customer_id')->nullable()->constrained('customers');
            $table->string('serial_number');
            $table->date('purchase_date');
            $table->date('start_date');
            $table->date('expiry_date');
            $table->string('status')->default('active'); // active, expired, voided
            $table->text('terms')->nullable();
            $table->timestamps();
        });

        // 3. Create warranty_claims table
        Schema::create('warranty_claims', function (Blueprint $table) {
            $table->id();
            $table->string('claim_number')->unique();
            $table->foreignId('warranty_id')->constrained('warranties');
            $table->text('complaint');
            $table->string('technician_name')->nullable();
            $table->text('diagnosis')->nullable();
            $table->string('action_taken')->nullable(); // repair, replacement, refund
            $table->text('parts_used')->nullable();
            $table->string('status')->default('received'); // received, inspection, diagnosis, repair, awaiting_parts, replacement_approved, completed
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('warranty_claims');
        Schema::dropIfExists('warranties');
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('warranty_months');
        });
    }
};
