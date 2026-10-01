<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use App\Models\SupplierContact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $query = Supplier::with('contacts')->where('company_id', 1);

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
        }

        return $this->success($query->paginate(20));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'tax_number' => 'nullable|string',
            'credit_limit' => 'nullable|numeric',
            'bank_details' => 'nullable|string',
            'status' => 'in:active,inactive',
            'contacts' => 'nullable|array'
        ]);

        try {
            DB::beginTransaction();

            $supplier = Supplier::create([
                'company_id' => 1,
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'address' => $request->address,
                'tax_number' => $request->tax_number,
                'credit_limit' => $request->credit_limit,
                'bank_details' => $request->bank_details,
                'status' => $request->status ?? 'active',
            ]);

            if ($request->contacts && is_array($request->contacts)) {
                foreach ($request->contacts as $contact) {
                    $supplier->contacts()->create([
                        'name' => $contact['name'],
                        'email' => $contact['email'] ?? null,
                        'phone' => $contact['phone'] ?? null,
                        'position' => $contact['position'] ?? null,
                        'is_primary' => $contact['is_primary'] ?? false,
                    ]);
                }
            }

            DB::commit();

            return $this->success($supplier->load('contacts'), 'Supplier created successfully', 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Failed to create supplier', 500, ['error' => $e->getMessage()]);
        }
    }

    public function show($id)
    {
        $supplier = Supplier::with(['contacts', 'purchaseOrders'])->where('company_id', 1)->findOrFail($id);
        return $this->success($supplier);
    }

    public function update(Request $request, $id)
    {
        $supplier = Supplier::where('company_id', 1)->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'tax_number' => 'nullable|string',
            'credit_limit' => 'nullable|numeric',
            'bank_details' => 'nullable|string',
            'status' => 'in:active,inactive',
            'contacts' => 'nullable|array'
        ]);

        try {
            DB::beginTransaction();

            $supplier->update([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'address' => $request->address,
                'tax_number' => $request->tax_number,
                'credit_limit' => $request->credit_limit,
                'bank_details' => $request->bank_details,
                'status' => $request->status ?? 'active',
            ]);

            if ($request->has('contacts')) {
                // Delete existing contacts and recreate
                $supplier->contacts()->delete();
                foreach ($request->contacts as $contact) {
                    $supplier->contacts()->create([
                        'name' => $contact['name'],
                        'email' => $contact['email'] ?? null,
                        'phone' => $contact['phone'] ?? null,
                        'position' => $contact['position'] ?? null,
                        'is_primary' => $contact['is_primary'] ?? false,
                    ]);
                }
            }

            DB::commit();

            return $this->success($supplier->load('contacts'), 'Supplier updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Failed to update supplier', 500, ['error' => $e->getMessage()]);
        }
    }

    public function destroy($id)
    {
        $supplier = Supplier::where('company_id', 1)->findOrFail($id);
        
        if ($supplier->purchaseOrders()->exists()) {
            return $this->error('Cannot delete supplier with active purchase orders', 400);
        }

        $supplier->delete();
        return $this->success(null, 'Supplier deleted successfully');
    }
}
