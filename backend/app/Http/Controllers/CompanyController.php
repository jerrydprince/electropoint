<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    public function show()
    {
        $company = Company::first();
        if (!$company) {
            $company = Company::create(['name' => 'Electropoint']);
        }
        return $this->success($company);
    }

    public function update(Request $request)
    {
        $company = Company::first();
        if (!$company) {
            $company = Company::create(['name' => 'Electropoint']);
        }
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'tax_number' => 'nullable|string',
            'currency' => 'nullable|string',
            'receipt_configuration' => 'nullable|array',
            'logo' => 'nullable|image|max:2048' // Optional image
        ]);

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('company', 'public');
            $validated['logo'] = $path;
        }

        $company->update($validated);
        
        return $this->success($company, 'Company updated successfully.');
    }
}
