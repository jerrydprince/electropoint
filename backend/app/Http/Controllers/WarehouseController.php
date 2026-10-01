<?php

namespace App\Http\Controllers;

use App\Models\Warehouse;
use Illuminate\Http\Request;

class WarehouseController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Warehouse::with('branch');
        
        if (!$user->hasRole('Super Administrator') && $user->hasRole('Branch Manager')) {
            $query->whereHas('branch', function($q) use ($user) {
                $q->where('manager_id', $user->id);
            });
        }

        return $this->success($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:warehouses,code',
            'address' => 'nullable|string',
            'status' => 'required|in:active,inactive'
        ]);

        $warehouse = Warehouse::create($validated);
        return $this->success($warehouse, 'Warehouse created successfully', 201);
    }

    public function show($id)
    {
        return $this->success(Warehouse::with('branch')->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $warehouse = Warehouse::findOrFail($id);
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:warehouses,code,'.$id,
            'address' => 'nullable|string',
            'status' => 'required|in:active,inactive'
        ]);

        $warehouse->update($validated);
        return $this->success($warehouse, 'Warehouse updated successfully');
    }

    public function destroy($id)
    {
        Warehouse::findOrFail($id)->delete();
        return $this->success(null, 'Warehouse deleted');
    }
}
