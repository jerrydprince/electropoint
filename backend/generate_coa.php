<?php

use Illuminate\Support\Facades\DB;

// Generate AccountType Model
$accountTypeModel = "<?php
namespace App\\Models;
use Illuminate\\Database\\Eloquent\\Model;

class AccountType extends Model
{
    protected \$fillable = ['name', 'description', 'normal_balance'];
    
    public function groups()
    {
        return \$this->hasMany(AccountGroup::class);
    }
}
";
file_put_contents(app_path('Models/AccountType.php'), $accountTypeModel);

// Generate AccountGroup Model
$accountGroupModel = "<?php
namespace App\\Models;
use Illuminate\\Database\\Eloquent\\Model;

class AccountGroup extends Model
{
    protected \$fillable = ['account_type_id', 'name', 'description'];
    
    public function type()
    {
        return \$this->belongsTo(AccountType::class, 'account_type_id');
    }
    
    public function accounts()
    {
        return \$this->hasMany(ChartOfAccount::class);
    }
}
";
file_put_contents(app_path('Models/AccountGroup.php'), $accountGroupModel);

// Generate ChartOfAccount Model
$coaModel = "<?php
namespace App\\Models;
use Illuminate\\Database\\Eloquent\\Model;

class ChartOfAccount extends Model
{
    protected \$fillable = [
        'code', 'name', 'account_type_id', 'account_group_id', 
        'parent_id', 'description', 'normal_balance', 'is_system_account', 
        'status', 'branch_id'
    ];
    
    public function type()
    {
        return \$this->belongsTo(AccountType::class, 'account_type_id');
    }
    
    public function group()
    {
        return \$this->belongsTo(AccountGroup::class, 'account_group_id');
    }
    
    public function parent()
    {
        return \$this->belongsTo(ChartOfAccount::class, 'parent_id');
    }
    
    public function children()
    {
        return \$this->hasMany(ChartOfAccount::class, 'parent_id');
    }
}
";
file_put_contents(app_path('Models/ChartOfAccount.php'), $coaModel);

echo "Models generated.\n";

// Seed Database
DB::statement('SET FOREIGN_KEY_CHECKS=0;');
DB::table('chart_of_accounts')->truncate();
DB::table('account_groups')->truncate();
DB::table('account_types')->truncate();
DB::statement('SET FOREIGN_KEY_CHECKS=1;');

$types = [
    ['name' => 'Assets', 'normal_balance' => 'debit'],
    ['name' => 'Liabilities', 'normal_balance' => 'credit'],
    ['name' => 'Equity', 'normal_balance' => 'credit'],
    ['name' => 'Revenue', 'normal_balance' => 'credit'],
    ['name' => 'COGS', 'normal_balance' => 'debit'],
    ['name' => 'Expenses', 'normal_balance' => 'debit']
];

foreach ($types as $type) {
    DB::table('account_types')->insert(array_merge($type, ['created_at' => now(), 'updated_at' => now()]));
}

$typeMap = DB::table('account_types')->pluck('id', 'name')->toArray();

$groups = [
    ['name' => 'Current Assets', 'account_type_id' => $typeMap['Assets']],
    ['name' => 'Fixed Assets', 'account_type_id' => $typeMap['Assets']],
    ['name' => 'Current Liabilities', 'account_type_id' => $typeMap['Liabilities']],
    ['name' => 'Long Term Liabilities', 'account_type_id' => $typeMap['Liabilities']],
    ['name' => 'Capital', 'account_type_id' => $typeMap['Equity']],
    ['name' => 'Sales Revenue', 'account_type_id' => $typeMap['Revenue']],
    ['name' => 'Cost of Goods Sold', 'account_type_id' => $typeMap['COGS']],
    ['name' => 'Operating Expenses', 'account_type_id' => $typeMap['Expenses']]
];

foreach ($groups as $group) {
    DB::table('account_groups')->insert(array_merge($group, ['created_at' => now(), 'updated_at' => now()]));
}

$groupMap = DB::table('account_groups')->pluck('id', 'name')->toArray();

$accounts = [
    // Current Assets
    ['code' => '1100', 'name' => 'Cash', 'type' => 'Assets', 'group' => 'Current Assets'],
    ['code' => '1200', 'name' => 'Bank', 'type' => 'Assets', 'group' => 'Current Assets'],
    ['code' => '1300', 'name' => 'Accounts Receivable', 'type' => 'Assets', 'group' => 'Current Assets'],
    ['code' => '1400', 'name' => 'Inventory', 'type' => 'Assets', 'group' => 'Current Assets'],
    ['code' => '1500', 'name' => 'Prepayments', 'type' => 'Assets', 'group' => 'Current Assets'],
    
    // Liabilities
    ['code' => '2100', 'name' => 'Accounts Payable', 'type' => 'Liabilities', 'group' => 'Current Liabilities'],
    ['code' => '2200', 'name' => 'Tax Payable', 'type' => 'Liabilities', 'group' => 'Current Liabilities'],
    ['code' => '2300', 'name' => 'Customer Deposits', 'type' => 'Liabilities', 'group' => 'Current Liabilities'],
    
    // Equity
    ['code' => '3100', 'name' => 'Capital', 'type' => 'Equity', 'group' => 'Capital'],
    ['code' => '3200', 'name' => 'Retained Earnings', 'type' => 'Equity', 'group' => 'Capital'],
    
    // Revenue
    ['code' => '4100', 'name' => 'Electronics Sales', 'type' => 'Revenue', 'group' => 'Sales Revenue'],
    ['code' => '4200', 'name' => 'Other Sales', 'type' => 'Revenue', 'group' => 'Sales Revenue'],
    
    // COGS
    ['code' => '5000', 'name' => 'COGS', 'type' => 'COGS', 'group' => 'Cost of Goods Sold'],
    
    // Expenses
    ['code' => '6100', 'name' => 'Electricity', 'type' => 'Expenses', 'group' => 'Operating Expenses'],
    ['code' => '6200', 'name' => 'Diesel', 'type' => 'Expenses', 'group' => 'Operating Expenses'],
    ['code' => '6300', 'name' => 'Transport', 'type' => 'Expenses', 'group' => 'Operating Expenses'],
    ['code' => '6400', 'name' => 'Internet', 'type' => 'Expenses', 'group' => 'Operating Expenses'],
    ['code' => '6500', 'name' => 'Rent', 'type' => 'Expenses', 'group' => 'Operating Expenses'],
    ['code' => '6600', 'name' => 'Marketing', 'type' => 'Expenses', 'group' => 'Operating Expenses'],
    ['code' => '6700', 'name' => 'Maintenance', 'type' => 'Expenses', 'group' => 'Operating Expenses'],
    ['code' => '6800', 'name' => 'Salaries', 'type' => 'Expenses', 'group' => 'Operating Expenses'],
    ['code' => '6900', 'name' => 'Bank Charges', 'type' => 'Expenses', 'group' => 'Operating Expenses']
];

foreach ($accounts as $acc) {
    \$t_id = \$typeMap[\$acc['type']];
    \$g_id = \$groupMap[\$acc['group']];
    \$normal_balance = \$types[array_search(\$acc['type'], array_column(\$types, 'name'))]['normal_balance'];
    
    DB::table('chart_of_accounts')->insert([
        'code' => \$acc['code'],
        'name' => \$acc['name'],
        'account_type_id' => \$t_id,
        'account_group_id' => \$g_id,
        'normal_balance' => \$normal_balance,
        'is_system_account' => true,
        'created_at' => now(),
        'updated_at' => now()
    ]);
}

echo "Database seeded successfully.\n";
