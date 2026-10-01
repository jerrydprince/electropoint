<?php

namespace App\Http\Controllers;

use App\Models\Supply;
use Illuminate\Http\Request;

class SupplyController extends Controller
{
    public function index()
    {
        $supplies = Supply::with('category')
            ->whereHas('category', function($q) {
                $q->where('company_id', 1);
            })
            ->get();
            
        return $this->success($supplies);
    }

    public function store(Request $request)
    {
        $request->validate([
            'supply_category_id' => 'required|exists:supply_categories,id',
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|unique:supplies,sku',
            'unit' => 'required|string',
            'reorder_level' => 'required|integer|min:0',
            'description' => 'nullable|string'
        ]);

        $supply = Supply::create($request->all());

        return $this->success($supply->load('category'), 'Supply created successfully', 201);
    }

    public function update(Request $request, $id)
    {
        $supply = Supply::findOrFail($id);
        
        $request->validate([
            'supply_category_id' => 'required|exists:supply_categories,id',
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|unique:supplies,sku,'.$id,
            'unit' => 'required|string',
            'reorder_level' => 'required|integer|min:0',
            'description' => 'nullable|string'
        ]);

        $supply->update($request->all());

        return $this->success($supply->load('category'), 'Supply updated successfully');
    }

    public function destroy($id)
    {
        $supply = Supply::findOrFail($id);
        
        if ($supply->stocks()->sum('quantity') > 0) {
            return $this->error('Cannot delete supply with existing stock', 400);
        }

        $supply->delete();
        return $this->success(null, 'Supply deleted successfully');
    }
}
