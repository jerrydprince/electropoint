<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $categories = Category::with('parent')->get();
        return $this->success($categories);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);

        $category = Category::create($validated);
        return $this->success($category, 'Category created successfully.', 201);
    }

    public function show(Category $category)
    {
        return $this->success($category->load('parent'));
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);

        if ($validated['parent_id'] == $category->id) {
            return response()->json(['message' => 'Cannot set self as parent.'], 422);
        }

        $category->update($validated);
        return $this->success($category, 'Category updated successfully.');
    }

    public function destroy(Category $category)
    {
        if ($category->children()->exists() || $category->products()->exists()) {
            return response()->json(['message' => 'Cannot delete category with children or products.'], 422);
        }
        
        $category->delete();
        return $this->success(null, 'Category deleted successfully.');
    }
}
