<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('supply_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('supplies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supply_category_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('sku')->unique()->nullable();
            $table->string('unit')->default('pcs'); // e.g. roll, pack, piece, box
            $table->integer('reorder_level')->default(0);
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('supply_stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supply_id')->constrained()->onDelete('cascade');
            $table->foreignId('branch_id')->constrained()->onDelete('cascade');
            $table->integer('quantity')->default(0);
            $table->timestamps();
            
            $table->unique(['supply_id', 'branch_id']);
        });

        Schema::create('supply_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supply_id')->constrained()->onDelete('cascade');
            $table->foreignId('branch_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Who recorded it
            $table->enum('type', ['receipt', 'issue', 'adjustment']);
            $table->integer('quantity'); // Positive for receipt, Negative for issue
            $table->string('reference')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('supply_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Requester
            $table->enum('status', ['pending', 'approved', 'partially_issued', 'fully_issued', 'rejected'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('supply_request_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supply_request_id')->constrained()->onDelete('cascade');
            $table->foreignId('supply_id')->constrained()->onDelete('cascade');
            $table->integer('quantity_requested');
            $table->integer('quantity_issued')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('supply_request_items');
        Schema::dropIfExists('supply_requests');
        Schema::dropIfExists('supply_transactions');
        Schema::dropIfExists('supply_stocks');
        Schema::dropIfExists('supplies');
        Schema::dropIfExists('supply_categories');
    }
};
