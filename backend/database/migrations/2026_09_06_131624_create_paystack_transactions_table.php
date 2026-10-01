<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('paystack_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->decimal('amount', 15, 2);
            $table->string('currency')->default('NGN');
            $table->string('email')->nullable();
            $table->string('status')->default('pending'); // pending, success, failed
            $table->json('gateway_response')->nullable();
            $table->foreignId('sale_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('customer_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paystack_transactions');
    }
};
