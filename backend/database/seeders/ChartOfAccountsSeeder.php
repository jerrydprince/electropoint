<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\AccountType;
use App\Models\AccountGroup;
use App\Models\ChartOfAccount;

class ChartOfAccountsSeeder extends Seeder
{
    public function run()
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        ChartOfAccount::truncate();
        AccountGroup::truncate();
        AccountType::truncate();
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
            AccountType::create($type);
        }

        $typeMap = AccountType::pluck('id', 'name')->toArray();

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
            AccountGroup::create($group);
        }

        $groupMap = AccountGroup::pluck('id', 'name')->toArray();

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
            $t_id = $typeMap[$acc['type']];
            $g_id = $groupMap[$acc['group']];
            
            $normal_balance = 'debit';
            foreach ($types as $type) {
                if ($type['name'] === $acc['type']) {
                    $normal_balance = $type['normal_balance'];
                    break;
                }
            }
            
            ChartOfAccount::create([
                'code' => $acc['code'],
                'name' => $acc['name'],
                'account_type_id' => $t_id,
                'account_group_id' => $g_id,
                'normal_balance' => $normal_balance,
                'is_system_account' => true,
            ]);
        }
    }
}
