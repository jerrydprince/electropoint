<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BrandController extends Controller
{
    public function index()
    {
        return $this->success(Brand::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
            'logo' => 'nullable|image|max:2048'
        ]);

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('brands', 'public');
            $validated['logo'] = '/storage/' . $path;
        }

        $brand = Brand::create($validated);
        return $this->success($brand, 'Brand created successfully.', 201);
    }

    public function show(Brand $brand)
    {
        return $this->success($brand);
    }

    public function update(Request $request, Brand $brand)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
            'logo' => 'nullable|image|max:2048'
        ]);

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('brands', 'public');
            $validated['logo'] = '/storage/' . $path;
        }

        $brand->update($validated);
        return $this->success($brand, 'Brand updated successfully.');
    }

    public function destroy(Brand $brand)
    {
        if ($brand->products()->exists()) {
            return response()->json(['message' => 'Cannot delete brand used by products.'], 422);
        }
        
        $brand->delete();
        return $this->success(null, 'Brand deleted successfully.');
    }
}
