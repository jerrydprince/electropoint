<?php

namespace App\Http\Controllers;

use App\Models\SupplyCategory;
use Illuminate\Http\Request;

class SupplyCategoryController extends Controller
{
    public function index()
    {
        // Assuming company_id is 1 for now
        $categories = SupplyCategory::where('company_id', 1)->withCount('supplies')->get();
        return $this->success($categories);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string'
        ]);

        $category = SupplyCategory::create([
            'company_id' => 1,
            'name' => $request->name,
            'description' => $request->description
        ]);

        return $this->success($category, 'Supply category created successfully', 201);
    }

    public function update(Request $request, $id)
    {
        $category = SupplyCategory::where('company_id', 1)->findOrFail($id);
        
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string'
        ]);

        $category->update($request->only(['name', 'description']));

        return $this->success($category, 'Supply category updated successfully');
    }

    public function destroy($id)
    {
        $category = SupplyCategory::where('company_id', 1)->findOrFail($id);
        
        if ($category->supplies()->count() > 0) {
            return $this->error('Cannot delete category with associated supplies', 400);
        }

        $category->delete();
        return $this->success(null, 'Supply category deleted successfully');
    }
}
