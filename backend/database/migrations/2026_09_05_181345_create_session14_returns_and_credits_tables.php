<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // 1. Sales Returns Table
        Schema::create('sales_returns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); // Cashier who processed the return
            $table->string('return_number')->unique();
            $table->enum('status', ['pending', 'inspected', 'approved', 'rejected', 'completed'])->default('pending');
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 2. Sales Return Items Table
        Schema::create('sales_return_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sales_return_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sale_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->integer('quantity');
            $table->json('serials')->nullable(); // Track which specific serials were returned
            $table->string('reason');
            $table->enum('condition', ['good', 'damaged'])->default('good');
            $table->decimal('unit_price', 15, 2);
            $table->decimal('total', 15, 2);
            $table->timestamps();
        });

        // 3. Refunds Table
        Schema::create('refunds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sales_return_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 15, 2);
            $table->string('payment_method'); // cash, transfer, pos, etc.
            $table->string('reference')->nullable();
            $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // 4. Customer Credits Table
        Schema::create('customer_credits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sale_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 15, 2);
            $table->decimal('balance', 15, 2); // Outstanding amount
            $table->date('due_date');
            $table->enum('status', ['open', 'paid', 'overdue'])->default('open');
            $table->timestamps();
        });

        // 5. Credit Payments Table
        Schema::create('credit_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_credit_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 15, 2);
            $table->string('payment_method');
            $table->string('reference')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); // Cashier who received the payment
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('credit_payments');
        Schema::dropIfExists('customer_credits');
        Schema::dropIfExists('refunds');
        Schema::dropIfExists('sales_return_items');
        Schema::dropIfExists('sales_returns');
    }
};
