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
        Schema::create('inventories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('warehouse_id')->constrained()->cascadeOnDelete();
            $table->integer('quantity')->default(0);
            $table->integer('reserved_quantity')->default(0);
            $table->integer('damaged_quantity')->default(0);
            $table->timestamps();
            
            $table->unique(['product_id', 'warehouse_id']);
        });

        Schema::create('inventory_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('warehouse_id')->constrained()->cascadeOnDelete();
            $table->enum('type', [
                'opening_stock', 'purchase', 'sale', 'return', 'damage', 'adjustment', 'transfer_in', 'transfer_out', 'purchase_return'
            ]);
            $table->integer('quantity'); // Positive or negative delta
            $table->string('reference')->nullable();
            $table->string('reason')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('product_serials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('serial_number')->unique();
            $table->foreignId('warehouse_id')->nullable()->constrained()->nullOnDelete(); // Null if sold/transferred out
            $table->enum('status', [
                'available', 'reserved', 'sold', 'returned', 'damaged', 'under_repair', 'transferred'
            ])->default('available');
            $table->foreignId('transaction_id')->nullable()->constrained('inventory_transactions')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_serials');
        Schema::dropIfExists('inventory_transactions');
        Schema::dropIfExists('inventories');
    }
};
