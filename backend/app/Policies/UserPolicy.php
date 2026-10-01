<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
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
        return $user->hasPermissionTo('users.view');
    }

    public function view(User $user, User $model): bool
    {
        return $user->hasPermissionTo('users.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('users.create');
    }

    public function update(User $user, User $model): bool
    {
        return $user->hasPermissionTo('users.edit');
    }

    public function delete(User $user, User $model): bool
    {
        // Prevent deleting oneself
        if ($user->id === $model->id) {
            return false;
        }
        return $user->hasPermissionTo('users.delete');
    }

    public function restore(User $user, User $model): bool
    {
        return $user->hasPermissionTo('users.delete'); // Or standard delete permission
    }

    public function forceDelete(User $user, User $model): bool
    {
        return false; // Prevent permanent deletion through API
    }
}
