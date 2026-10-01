<?php

namespace App\Http\Controllers;

use App\Models\FiscalPeriod;
use Illuminate\Http\Request;

class FiscalPeriodController extends Controller
{
    public function index()
    {
        $periods = FiscalPeriod::orderBy('start_date', 'desc')->get();
        return $this->success($periods);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $period = FiscalPeriod::create([
            'name' => $validated['name'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'status' => 'open'
        ]);

        return $this->success($period, 'Fiscal period created successfully.');
    }

    public function close($id, Request $request)
    {
        $period = FiscalPeriod::findOrFail($id);
        
        if ($period->status === 'closed') {
            return $this->error('Fiscal period is already closed.', 400);
        }

        $period->status = 'closed';
        $period->closed_by = $request->user()->id;
        $period->closed_at = now();
        $period->save();

        return $this->success($period, 'Fiscal period closed successfully.');
    }
}
