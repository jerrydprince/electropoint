<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResourcePermission
{
    /**
     * Handle an incoming request for a resource controller.
     * Maps HTTP methods to view, create, edit, delete permissions.
     */
    public function handle(Request $request, Closure $next, string $module): Response
    {
        $method = $request->method();
        $action = 'view'; // default
        
        if ($method === 'POST') {
            $action = 'create';
        } elseif ($method === 'PUT' || $method === 'PATCH') {
            $action = 'edit';
        } elseif ($method === 'DELETE') {
            $action = 'delete';
        }

        $permission = $module . '.' . $action;

        if (!$request->user() || !$request->user()->hasPermissionTo($permission)) {
            return response()->json([
                'status' => 'error',
                'message' => 'You do not have permission to perform this action. Required permission: ' . $permission,
            ], 403);
        }

        return $next($request);
    }
}
