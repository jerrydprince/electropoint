<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Role;
use Illuminate\Support\Str;
use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;

class RoleController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Role::class);
        $roles = Role::withCount('users')->get();
        return $this->success($roles, 'Roles retrieved successfully.');
    }

    public function store(StoreRoleRequest $request)
    {
        $this->authorize('create', Role::class);
        $role = Role::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
        ]);
        if ($request->has('permissions')) {
            $role->permissions()->sync($request->permissions);
        }
        return $this->success($role->load('permissions'), 'Role created successfully.', 201);
    }

    public function show(Role $role)
    {
        $this->authorize('view', $role);
        return $this->success($role->load('permissions'), 'Role retrieved successfully.');
    }

    public function update(UpdateRoleRequest $request, Role $role)
    {
        $this->authorize('update', $role);
        $role->update([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
        ]);
        if ($request->has('permissions')) {
            $role->permissions()->sync($request->permissions);
        }
        return $this->success($role->load('permissions'), 'Role updated successfully.');
    }

    public function destroy(Role $role)
    {
        $this->authorize('delete', $role);
        if ($role->users()->count() > 0) {
            return $this->error('Cannot delete role that is assigned to users.', null, 400);
        }
        $role->delete();
        return $this->success(null, 'Role deleted successfully.');
    }
}
