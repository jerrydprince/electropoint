<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\ChangePasswordRequest;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    use ApiResponse;

    public function login(LoginRequest $request)
    {
        $credentials = $request->only('email', 'password');

        if (!Auth::attempt($credentials)) {
            return $this->error('Invalid login credentials.', null, 401);
        }

        $user = Auth::user();

        if ($user->status !== 'active') {
            Auth::logout();
            return $this->error('Your account is inactive.', null, 403);
        }

        // Update login activity
        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip()
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->success([
            'user' => $user->load('roles.permissions'),
            'token' => $token
        ], 'Logged in successfully');
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return $this->success(null, 'Logged out successfully');
    }

    public function me(Request $request)
    {
        return $this->success([
            'user' => $request->user()->load('roles.permissions', 'company', 'branch')
        ], 'User retrieved successfully');
    }

    public function changePassword(ChangePasswordRequest $request)
    {
        $user = $request->user();
        
        $user->update([
            'password' => Hash::make($request->new_password)
        ]);
        
        return $this->success(null, 'Password changed successfully');
    }
}
