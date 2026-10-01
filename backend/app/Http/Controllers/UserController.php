<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', User::class);
        
        $query = User::with(['roles']);

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhere('phone', 'like', "%{$request->search}%");
            });
        }

        if ($request->role_id) {
            $query->whereHas('roles', function($q) use ($request) {
                $q->where('roles.id', $request->role_id);
            });
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        return $this->success($query->paginate(15), 'Users retrieved successfully.');
    }

    public function store(StoreUserRequest $request)
    {
        $this->authorize('create', User::class);

        $password = $request->password ?: Str::random(10);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($password),
            'status' => $request->status ?? 'active',
            'company_id' => $request->company_id,
            'branch_id' => $request->branch_id,
        ]);

        if ($request->has('role_ids')) {
            $user->roles()->sync($request->role_ids);
        }

        return $this->success($user->load('roles'), 'User created successfully.', 201);
    }

    public function show(User $user)
    {
        $this->authorize('view', $user);
        return $this->success($user->load('roles'), 'User retrieved successfully.');
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $this->authorize('update', $user);

        $data = $request->only(['name', 'email', 'phone', 'status', 'company_id', 'branch_id']);
        
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        if ($request->has('role_ids')) {
            $user->roles()->sync($request->role_ids);
        }

        return $this->success($user->load('roles'), 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        $this->authorize('delete', $user);
        $user->delete();
        return $this->success(null, 'User deleted successfully.');
    }
}
