<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // 1. Account Types
        Schema::create('account_types', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // Assets, Liabilities, Equity, Revenue, COGS, Expenses
            $table->string('description')->nullable();
            $table->string('normal_balance'); // debit or credit
            $table->timestamps();
        });

        // 2. Account Groups
        Schema::create('account_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_type_id')->constrained('account_types');
            $table->string('name');
            $table->string('description')->nullable();
            $table->timestamps();
        });

        // 3. Chart of Accounts
        Schema::create('chart_of_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->foreignId('account_type_id')->constrained('account_types');
            $table->foreignId('account_group_id')->nullable()->constrained('account_groups');
            $table->foreignId('parent_id')->nullable()->constrained('chart_of_accounts');
            $table->string('description')->nullable();
            $table->string('normal_balance'); // debit or credit
            $table->boolean('is_system_account')->default(false);
            $table->boolean('status')->default(true);
            $table->foreignId('branch_id')->nullable()->constrained('branches'); // if applicable to specific branch
            $table->timestamps();
        });

        // 4. Fiscal Periods
        Schema::create('fiscal_periods', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->date('start_date');
            $table->date('end_date');
            $table->string('status')->default('open'); // open, closed, locked
            $table->foreignId('closed_by')->nullable()->constrained('users');
            $table->dateTime('closed_at')->nullable();
            $table->timestamps();
        });

        // 5. Journal Entries
        Schema::create('journal_entries', function (Blueprint $table) {
            $table->id();
            $table->string('journal_number')->unique();
            $table->date('journal_date');
            $table->string('description');
            $table->string('reference_type')->nullable(); // Sale, PurchaseOrder, Expense
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->foreignId('branch_id')->nullable()->constrained('branches');
            $table->string('currency')->default('NGN');
            $table->string('status')->default('draft'); // draft, posted, reversed, void
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('posted_by')->nullable()->constrained('users');
            $table->dateTime('posted_at')->nullable();
            $table->foreignId('reversal_of_id')->nullable()->constrained('journal_entries');
            $table->timestamps();
            
            $table->index(['reference_type', 'reference_id']);
        });

        // 6. Journal Entry Lines
        Schema::create('journal_entry_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('journal_entry_id')->constrained('journal_entries')->onDelete('cascade');
            $table->foreignId('account_id')->constrained('chart_of_accounts');
            $table->decimal('debit', 15, 2)->default(0);
            $table->decimal('credit', 15, 2)->default(0);
            $table->string('description')->nullable();
            $table->foreignId('customer_id')->nullable()->constrained('customers');
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers');
            $table->foreignId('branch_id')->nullable()->constrained('branches');
            $table->timestamps();
        });

        // 7. Bank Accounts
        Schema::create('bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('bank_name');
            $table->string('account_name');
            $table->string('account_number');
            $table->string('account_type'); // savings, current
            $table->decimal('opening_balance', 15, 2)->default(0);
            $table->string('currency')->default('NGN');
            $table->foreignId('branch_id')->nullable()->constrained('branches');
            $table->boolean('status')->default(true);
            $table->timestamps();
        });

        // 8. Bank Transactions
        Schema::create('bank_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bank_account_id')->constrained('bank_accounts');
            $table->string('type'); // deposit, withdrawal, transfer, charge, interest, settlement
            $table->decimal('amount', 15, 2);
            $table->string('reference')->nullable();
            $table->string('description');
            $table->foreignId('journal_entry_id')->nullable()->constrained('journal_entries');
            $table->string('status')->default('completed'); // completed, pending, reconciled
            $table->timestamps();
        });

        // 9. Bank Reconciliations
        Schema::create('bank_reconciliations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bank_account_id')->constrained('bank_accounts');
            $table->date('reconciliation_date');
            $table->decimal('system_balance', 15, 2);
            $table->decimal('bank_statement_balance', 15, 2);
            $table->decimal('difference', 15, 2);
            $table->string('status')->default('draft'); // draft, reconciled
            $table->foreignId('reconciled_by')->nullable()->constrained('users');
            $table->timestamps();
        });

        // 10. Tax Rates
        Schema::create('tax_rates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('rate', 5, 2);
            $table->foreignId('account_id')->constrained('chart_of_accounts');
            $table->string('type')->default('exclusive'); // inclusive, exclusive
            $table->boolean('status')->default(true);
            $table->timestamps();
        });

        // 11. Tax Transactions
        Schema::create('tax_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tax_rate_id')->constrained('tax_rates');
            $table->foreignId('journal_entry_id')->constrained('journal_entries');
            $table->decimal('amount', 15, 2);
            $table->string('reference_type')->nullable(); // Sale, PurchaseOrder
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->timestamps();
            
            $table->index(['reference_type', 'reference_id']);
        });

        // 12. Budgets
        Schema::create('budgets', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('fiscal_period_id')->constrained('fiscal_periods');
            $table->foreignId('branch_id')->nullable()->constrained('branches');
            $table->string('status')->default('active'); // active, inactive
            $table->timestamps();
        });

        // 13. Budget Lines
        Schema::create('budget_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('budget_id')->constrained('budgets')->onDelete('cascade');
            $table->foreignId('account_id')->constrained('chart_of_accounts');
            $table->decimal('amount', 15, 2);
            $table->timestamps();
        });

        // 14. Financial Adjustments
        Schema::create('financial_adjustments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained('chart_of_accounts');
            $table->string('reason'); // correction, accrual, write-off
            $table->decimal('amount', 15, 2); // Positive = Debit, Negative = Credit? Better to use debit/credit explicitly
            $table->decimal('debit', 15, 2)->default(0);
            $table->decimal('credit', 15, 2)->default(0);
            $table->foreignId('journal_entry_id')->nullable()->constrained('journal_entries');
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('financial_adjustments');
        Schema::dropIfExists('budget_lines');
        Schema::dropIfExists('budgets');
        Schema::dropIfExists('tax_transactions');
        Schema::dropIfExists('tax_rates');
        Schema::dropIfExists('bank_reconciliations');
        Schema::dropIfExists('bank_transactions');
        Schema::dropIfExists('bank_accounts');
        Schema::dropIfExists('journal_entry_lines');
        Schema::dropIfExists('journal_entries');
        Schema::dropIfExists('fiscal_periods');
        Schema::dropIfExists('chart_of_accounts');
        Schema::dropIfExists('account_groups');
        Schema::dropIfExists('account_types');
    }
};
