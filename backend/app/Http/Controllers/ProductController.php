<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'brand', 'unit'])->withSum('inventories', 'quantity');

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('sku', 'like', "%{$request->search}%")
                  ->orWhere('barcode', 'like', "%{$request->search}%");
            });
        }

        if ($request->barcode) {
            $query->where('barcode', $request->barcode);
        }

        if ($request->sku) {
            $query->where('sku', $request->sku);
        }

        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->brand_id) {
            $query->where('brand_id', $request->brand_id);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        return $this->success($query->paginate(15));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|unique:products,sku',
            'barcode' => 'nullable|string|unique:products,barcode',
            'brand_id' => 'nullable|exists:brands,id',
            'category_id' => 'nullable|exists:categories,id',
            'unit_id' => 'nullable|exists:units,id',
            'model' => 'nullable|string',
            'description' => 'nullable|string',
            'cost_price' => 'numeric|min:0',
            'selling_price' => 'numeric|min:0',
            'wholesale_price' => 'numeric|min:0',
            'tax_rate' => 'numeric|min:0',
            'min_stock' => 'integer|min:0',
            'max_stock' => 'nullable|integer|min:0',
            'reorder_level' => 'integer|min:0',
            'warranty_period' => 'nullable|integer',
            'warranty_type' => 'nullable|string',
            'serial_tracking' => 'boolean',
            'status' => 'required|in:active,inactive',
            'image' => 'nullable|mimes:jpeg,png,jpg,gif,svg,webp|max:2048'
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $validated['image'] = $path;
        }

        $product = Product::create($validated);
        return $this->success($product, 'Product created successfully.', 201);
    }

    public function show(Product $product)
    {
        return $this->success($product->load(['category', 'brand', 'unit', 'priceHistories.user']));
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|unique:products,sku,'.$product->id,
            'barcode' => 'nullable|string|unique:products,barcode,'.$product->id,
            'brand_id' => 'nullable|exists:brands,id',
            'category_id' => 'nullable|exists:categories,id',
            'unit_id' => 'nullable|exists:units,id',
            'model' => 'nullable|string',
            'description' => 'nullable|string',
            'cost_price' => 'numeric|min:0',
            'selling_price' => 'numeric|min:0',
            'wholesale_price' => 'numeric|min:0',
            'tax_rate' => 'numeric|min:0',
            'min_stock' => 'integer|min:0',
            'max_stock' => 'nullable|integer|min:0',
            'reorder_level' => 'integer|min:0',
            'warranty_period' => 'nullable|integer',
            'warranty_type' => 'nullable|string',
            'serial_tracking' => 'boolean',
            'status' => 'required|in:active,inactive',
            'image' => 'nullable|mimes:jpeg,png,jpg,gif,svg,webp|max:2048'
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $validated['image'] = $path;
        }

        $product->update($validated);
        return $this->success($product, 'Product updated successfully.');
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return $this->success(null, 'Product deleted successfully.');
    }
}
