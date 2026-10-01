<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Role;

class RolePolicy
{
    /**
     * Create a new policy instance.
     */
    public function __construct()
    {
        //
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('roles.view');
    }

    public function view(User $user, Role $role): bool
    {
        return $user->hasPermissionTo('roles.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('roles.create');
    }

    public function update(User $user, Role $role): bool
    {
        // Prevent editing super admin role
        if ($role->slug === 'super-administrator') {
            return false;
        }
        return $user->hasPermissionTo('roles.edit');
    }

    public function delete(User $user, Role $role): bool
    {
        // Prevent deleting super admin role
        if ($role->slug === 'super-administrator') {
            return false;
        }
        return $user->hasPermissionTo('roles.delete');
    }

    public function restore(User $user, Role $role): bool
    {
        return false;
    }

    public function forceDelete(User $user, Role $role): bool
    {
        return false;
    }
}
