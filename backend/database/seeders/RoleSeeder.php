<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Support\Str;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            'Super Administrator' => 'Full access to all system features.',
            'Administrator' => 'Administrative access, restricted from some super-admin settings.',
            'Head Office Manager' => 'Can view and manage operations across all branches.',
            'Branch Manager' => 'Can manage a specific branch operations.',
            'Sales Manager' => 'Oversees sales team and approves sales exceptions.',
            'Cashier' => 'Basic POS access. Cannot adjust stock or change prices.',
            'Inventory Officer' => 'Manages stock, transfers, and warehouse operations.',
            'Procurement Officer' => 'Handles purchase orders and supplier relations.',
            'Accountant' => 'Manages day-to-day financial entries.',
            'Auditor' => 'Read-only access to all financial and operational logs.',
            'Customer Service Officer' => 'Handles customer records and support queries.',
        ];

        foreach ($roles as $name => $description) {
            $role = Role::firstOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name, 'description' => $description]
            );

            // Assign permissions based on role
            $permissions = [];

            if ($name === 'Super Administrator') {
                // Super Admin gets everything
                $permissions = Permission::pluck('id')->toArray();
            } elseif ($name === 'Cashier') {
                // Cashier is very restricted
                $permissions = Permission::whereIn('slug', [
                    'sales.create',
                    'sales.view',
                    'customers.view',
                    'customers.create',
                    'products.view',
                    'inventory.view',
                ])->pluck('id')->toArray();
            } elseif ($name === 'Auditor') {
                // Auditor is read-only
                $permissions = Permission::where('slug', 'like', '%.view')->pluck('id')->toArray();
            } elseif ($name === 'Branch Manager') {
                $permissions = Permission::whereNotIn('group', ['roles', 'settings'])
                    ->whereNotIn('slug', ['sales.delete', 'finance.view_profit'])
                    ->pluck('id')->toArray();
            } else {
                // Default fallback for others for now (will be refined via UI)
                $permissions = Permission::where('slug', 'like', '%.view')->pluck('id')->toArray();
            }

            // Sync permissions
            $role->permissions()->sync($permissions);
        }
    }
}
