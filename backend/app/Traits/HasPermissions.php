<?php

namespace App\Traits;

use App\Models\Permission;
use App\Models\Role;

trait HasPermissions
{
    /**
     * Determine if the user has a specific permission.
     */
    public function hasPermissionTo($permission)
    {
        // First check if the user is a super-administrator
        if ($this->hasRole('Super Administrator')) {
            return true;
        }

        // Get all permissions assigned to the user through their roles
        $userPermissions = $this->roles()->with('permissions')->get()->pluck('permissions')->flatten()->pluck('slug')->toArray();

        return in_array($permission, $userPermissions);
    }

    /**
     * Determine if the user has a specific role.
     */
    public function hasRole($role)
    {
        return $this->roles()->where('name', $role)->orWhere('slug', $role)->exists();
    }

    /**
     * Assign a role to the user.
     */
    public function assignRole($role)
    {
        $roleModel = Role::where('name', $role)->orWhere('slug', $role)->firstOrFail();
        $this->roles()->syncWithoutDetaching([$roleModel->id]);
        return $this;
    }
}
