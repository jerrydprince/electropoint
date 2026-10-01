<?php
App\Models\Role::where('slug', 'super-admin')->delete();
echo "Old role deleted.\n";
