<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            PermissionSeeder::class,
            RoleSeeder::class,
        ]);

        $superAdminRole = Role::where('slug', 'super-administrator')->first();

        $user = User::firstOrCreate([
            'email' => 'admin@electropoint.com'
        ], [
            'name' => 'Super Admin',
            'password' => Hash::make('password'),
            'status' => 'active'
        ]);

        if ($superAdminRole && !$user->roles()->where('role_id', $superAdminRole->id)->exists()) {
            $user->roles()->attach($superAdminRole->id);
        }
    }
}
