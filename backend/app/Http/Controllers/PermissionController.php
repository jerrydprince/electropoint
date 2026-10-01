<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Permission;

class PermissionController extends Controller
{
    public function index()
    {
        $permissions = Permission::all()->groupBy('group');
        return $this->success($permissions, 'Permissions retrieved successfully.');
    }
}
