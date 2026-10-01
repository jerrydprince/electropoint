<?php

namespace App\Http\Controllers;

use App\Models\CorporatePlan;
use Illuminate\Http\Request;

class CorporatePlanController extends Controller
{
    public function index(Request $request)
    {
        $query = CorporatePlan::query();
        if ($request->company_id) {
            $query->where('company_id', $request->company_id);
        }
        return response()->json(['data' => $query->get()]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'name' => 'required|string|max:255',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'fixed_discount' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        $plan = CorporatePlan::create($validated);
        return response()->json(['message' => 'Corporate plan created successfully', 'data' => $plan]);
    }

    public function update(Request $request, CorporatePlan $corporatePlan)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'discount_type' => 'sometimes|in:percentage,fixed',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'fixed_discount' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        $corporatePlan->update($validated);
        return response()->json(['message' => 'Corporate plan updated successfully', 'data' => $corporatePlan]);
    }

    public function destroy(CorporatePlan $corporatePlan)
    {
        $corporatePlan->delete();
        return response()->json(['message' => 'Corporate plan deleted successfully']);
    }
}
