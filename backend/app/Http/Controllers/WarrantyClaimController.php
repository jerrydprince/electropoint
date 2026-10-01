<?php

namespace App\Http\Controllers;

use App\Models\WarrantyClaim;
use App\Models\Warranty;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WarrantyClaimController extends Controller
{
    public function index(Request $request)
    {
        $query = WarrantyClaim::with(['warranty.product', 'warranty.customer'])
            ->orderBy('created_at', 'desc');

        if ($request->status) {
            $query->where('status', $request->status);
        }

        return $this->success($query->paginate(20));
    }

    public function show($id)
    {
        $claim = WarrantyClaim::with(['warranty.product', 'warranty.customer', 'warranty.sale'])->findOrFail($id);
        return $this->success($claim);
    }

    public function store(Request $request)
    {
        $request->validate([
            'warranty_id' => 'required|exists:warranties,id',
            'complaint' => 'required|string',
        ]);

        $warranty = Warranty::findOrFail($request->warranty_id);
        if ($warranty->status !== 'active') {
            return $this->error("Cannot create claim for non-active warranty.", 400);
        }
        if ($warranty->expiry_date < now()) {
            return $this->error("Warranty has expired.", 400);
        }

        $claim = WarrantyClaim::create([
            'claim_number' => 'CLM-' . strtoupper(Str::random(8)),
            'warranty_id' => $warranty->id,
            'complaint' => $request->complaint,
            'status' => 'received',
            'notes' => $request->notes ?? null
        ]);

        return $this->success($claim, 'Claim created successfully');
    }

    public function update(Request $request, $id)
    {
        $claim = WarrantyClaim::findOrFail($id);

        $request->validate([
            'status' => 'nullable|string',
            'technician_name' => 'nullable|string',
            'diagnosis' => 'nullable|string',
            'action_taken' => 'nullable|string',
            'parts_used' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $claim->update($request->only([
            'status', 'technician_name', 'diagnosis', 'action_taken', 'parts_used', 'notes'
        ]));

        return $this->success($claim, 'Claim updated successfully');
    }
}
