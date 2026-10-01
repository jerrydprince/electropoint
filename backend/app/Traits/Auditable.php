<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

trait Auditable
{
    public static function bootAuditable()
    {
        static::created(function ($model) {
            self::logAudit('created', $model);
        });

        static::updated(function ($model) {
            self::logAudit('updated', $model);
        });

        static::deleted(function ($model) {
            self::logAudit('deleted', $model);
        });
    }

    protected static function logAudit($action, $model)
    {
        if (app()->runningInConsole() && !app()->runningUnitTests()) {
            return; // Skip logging for console commands like seeders
        }

        $oldValues = $action === 'updated' ? $model->getOriginal() : null;
        $newValues = $action !== 'deleted' ? $model->getAttributes() : null;

        // Mask passwords or sensitive data if any
        if (isset($oldValues['password'])) unset($oldValues['password']);
        if (isset($newValues['password'])) unset($newValues['password']);

        AuditLog::create([
            'user_id' => Auth::id(), // Can be null for system actions
            'action' => $action,
            'module' => class_basename($model),
            'record_id' => $model->id,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()->ip()
        ]);
    }
}
