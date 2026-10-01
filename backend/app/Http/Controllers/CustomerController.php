<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = Customer::with(['corporateAccount', 'corporatePlan'])->where('company_id', 1);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('first_name', 'like', "%{$request->search}%")
                  ->orWhere('last_name', 'like', "%{$request->search}%")
                  ->orWhere('company_name', 'like', "%{$request->search}%")
                  ->orWhere('phone', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhere('customer_code', 'like', "%{$request->search}%");
            });
        }

        return $this->success($query->paginate(100)); // Increased from 20 to 100 for better client-side filtering
    }

    private function generateCustomerCode()
    {
        $lastCustomer = Customer::where('company_id', 1)->orderBy('id', 'desc')->first();
        if (!$lastCustomer) {
            return 'CUST-00001';
        }
        
        $number = intval(str_replace('CUST-', '', $lastCustomer->customer_code)) + 1;
        return 'CUST-' . str_pad($number, 5, '0', STR_PAD_LEFT);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'nullable|string|max:50',
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'customer_type' => 'in:retail,wholesale,corporate',
            'credit_limit' => 'nullable|numeric',
            'corporate_account_id' => 'nullable|exists:customers,id',
            'corporate_plan_id' => 'nullable|exists:corporate_plans,id',
            'notes' => 'nullable|string',
            'status' => 'in:active,inactive',
        ]);

        $data = $request->all();
        $data['company_id'] = 1;
        $data['customer_code'] = $this->generateCustomerCode();

        $customer = Customer::create($data);

        return $this->success($customer, 'Customer created successfully', 201);
    }

    public function show($id)
    {
        $customer = Customer::with(['corporateAccount', 'corporatePlan'])->where('company_id', 1)->findOrFail($id);
        return $this->success($customer);
    }

    public function update(Request $request, $id)
    {
        $customer = Customer::where('company_id', 1)->findOrFail($id);

        $request->validate([
            'title' => 'nullable|string|max:50',
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'customer_type' => 'in:retail,wholesale,corporate',
            'credit_limit' => 'nullable|numeric',
            'corporate_account_id' => 'nullable|exists:customers,id',
            'corporate_plan_id' => 'nullable|exists:corporate_plans,id',
            'notes' => 'nullable|string',
            'status' => 'in:active,inactive',
        ]);

        $customer->update($request->all());

        return $this->success($customer, 'Customer updated successfully');
    }

    public function destroy($id)
    {
        $customer = Customer::where('company_id', 1)->findOrFail($id);
        $customer->delete();
        
        return $this->success(null, 'Customer deleted successfully');
    }
}
