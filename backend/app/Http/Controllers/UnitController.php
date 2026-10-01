<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use Illuminate\Http\Request;

class UnitController extends Controller
{
    public function index()
    {
        return $this->success(Unit::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'short_name' => 'required|string|max:50',
        ]);

        $unit = Unit::create($validated);
        return $this->success($unit, 'Unit created successfully.', 201);
    }

    public function show(Unit $unit)
    {
        return $this->success($unit);
    }

    public function update(Request $request, Unit $unit)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'short_name' => 'required|string|max:50',
        ]);

        $unit->update($validated);
        return $this->success($unit, 'Unit updated successfully.');
    }

    public function destroy(Unit $unit)
    {
        if ($unit->products()->exists()) {
            return response()->json(['message' => 'Cannot delete unit used by products.'], 422);
        }
        
        $unit->delete();
        return $this->success(null, 'Unit deleted successfully.');
    }
}
