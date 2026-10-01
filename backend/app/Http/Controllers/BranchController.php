<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Branch::with('manager');
        
        if (!$user->hasRole('Super Administrator') && $user->hasRole('Branch Manager')) {
            $query->where('manager_id', $user->id);
        }

        return $this->success($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:branches,code',
            'manager_id' => 'nullable|exists:users,id',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'status' => 'required|in:active,inactive'
        ]);
        
        $company = \App\Models\Company::first();
        if (!$company) {
            $company = \App\Models\Company::create(['name' => 'Electropoint']);
        }
        
        $validated['company_id'] = $company->id;

        $branch = Branch::create($validated);
        return $this->success($branch, 'Branch created successfully', 201);
    }

    public function show($id)
    {
        return $this->success(Branch::with('manager', 'warehouses')->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $branch = Branch::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:branches,code,'.$id,
            'manager_id' => 'nullable|exists:users,id',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'status' => 'required|in:active,inactive'
        ]);

        $branch->update($validated);
        return $this->success($branch, 'Branch updated successfully');
    }

    public function destroy($id)
    {
        Branch::findOrFail($id)->delete();
        return $this->success(null, 'Branch deleted');
    }
}
