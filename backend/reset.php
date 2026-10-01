<?php
$u = App\Models\User::where('email', 'admin@electropoint.com')->first();
if ($u) {
    $u->password = bcrypt('password');
    $u->save();
    echo "Password reset successful.\n";
} else {
    echo "User not found.\n";
}
