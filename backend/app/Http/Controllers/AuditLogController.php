<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $logs = AuditLog::with('user')
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return $this->success($logs);
    }
}
