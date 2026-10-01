<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            // User Management
            'users' => [
                'users.view' => 'View Users',
                'users.create' => 'Create Users',
                'users.edit' => 'Edit Users',
                'users.delete' => 'Delete Users',
            ],
            // Role Management
            'roles' => [
                'roles.view' => 'View Roles',
                'roles.create' => 'Create Roles',
                'roles.edit' => 'Edit Roles',
                'roles.delete' => 'Delete Roles',
            ],
            // Product Catalog
            'products' => [
                'products.view' => 'View Products',
                'products.create' => 'Create Products',
                'products.edit' => 'Edit Products',
                'products.delete' => 'Delete Products',
            ],
            // Inventory Management
            'inventory' => [
                'inventory.view' => 'View Inventory',
                'inventory.adjust_stock' => 'Adjust Stock Levels',
                'inventory.view_cost' => 'View Cost Prices',
                'inventory.transfer' => 'Transfer Stock',
            ],
            // Sales & POS
            'sales' => [
                'sales.view' => 'View Sales',
                'sales.create' => 'Create Sales (POS)',
                'sales.refund' => 'Process Refunds',
                'sales.change_price' => 'Change Selling Price at POS',
                'sales.delete' => 'Delete Invoices',
                'sales.approve' => 'Approve Sales Exceptions',
            ],
            // CRM
            'customers' => [
                'customers.view' => 'View Customers',
                'customers.create' => 'Create Customers',
                'customers.edit' => 'Edit Customers',
                'customers.delete' => 'Delete Customers',
            ],
            // Procurement
            'procurement' => [
                'procurement.view' => 'View Purchase Orders',
                'procurement.create' => 'Create Purchase Orders',
                'procurement.approve' => 'Approve Purchase Orders',
            ],
            // Finance & Reports
            'finance' => [
                'finance.view' => 'View Financial Data',
                'finance.view_profit' => 'View Profit Margins',
                'finance.export' => 'Export Financial Reports',
                'finance.print' => 'Print Reports',
            ],
            // System Settings
            'settings' => [
                'settings.view' => 'View Settings',
                'settings.edit' => 'Edit Settings',
            ]
        ];

        foreach ($permissions as $group => $perms) {
            foreach ($perms as $slug => $name) {
                DB::table('permissions')->updateOrInsert(
                    ['slug' => $slug],
                    [
                        'name' => $name,
                        'group' => $group,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
        }
    }
}
