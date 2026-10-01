<?php
$role = App\Models\Role::where('slug', 'cashier')->first();
$user = App\Models\User::firstOrCreate(
    ['email' => 'cashier@electropoint.com'],
    ['name' => 'John Cashier', 'password' => bcrypt('password')]
);
if(!$user->roles()->where('role_id', $role->id)->exists()) {
    $user->roles()->attach($role->id);
}
$token = $user->createToken('test')->plainTextToken;
echo "TOKEN=" . $token . "\n";
