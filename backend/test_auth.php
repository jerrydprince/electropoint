<?php
$credentials = ['email' => 'admin@electropoint.com', 'password' => 'password'];
if (Auth::attempt($credentials)) {
    echo "Auth successful!\n";
} else {
    echo "Auth failed.\n";
    $user = App\Models\User::where('email', 'admin@electropoint.com')->first();
    if ($user) {
        echo "User found. Hash matches? " . (Hash::check('password', $user->password) ? 'YES' : 'NO') . "\n";
    } else {
        echo "User not found.\n";
    }
}
