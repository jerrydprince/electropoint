<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // 1. Expense Categories
        Schema::create('expense_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('description')->nullable();
            $table->timestamps();
        });

        // Seed default categories
        $categories = [
            'Electricity', 'Diesel', 'Transport', 'Internet', 'Rent',
            'Marketing', 'Maintenance', 'Salaries', 'Logistics', 'Office'
        ];
        foreach ($categories as $cat) {
            DB::table('expense_categories')->insert([
                'name' => $cat,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        // 2. Expenses
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('expense_category_id')->constrained();
            $table->foreignId('user_id')->constrained('users');
            $table->decimal('amount', 15, 2);
            $table->string('reference')->nullable();
            $table->date('date');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 3. Cash Registers
        Schema::create('cash_registers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches');
            $table->foreignId('user_id')->constrained('users');
            $table->dateTime('opened_at');
            $table->dateTime('closed_at')->nullable();
            $table->decimal('opening_amount', 15, 2);
            $table->decimal('expected_amount', 15, 2)->nullable();
            $table->decimal('actual_amount', 15, 2)->nullable();
            $table->decimal('variance', 15, 2)->nullable();
            $table->text('closing_notes')->nullable();
            $table->string('status')->default('open'); // open, closed
            $table->timestamps();
        });

        // 4. Cash Register Movements
        Schema::create('cash_register_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cash_register_id')->constrained();
            $table->string('type'); // cash_in, cash_out, sale, expense
            $table->decimal('amount', 15, 2); // Positive or negative
            $table->string('reference')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('cash_register_movements');
        Schema::dropIfExists('cash_registers');
        Schema::dropIfExists('expenses');
        Schema::dropIfExists('expense_categories');
    }
};
