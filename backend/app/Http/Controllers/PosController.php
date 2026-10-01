<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Warehouse;
use App\Services\SaleService;
use App\Models\Sale;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;

class PosController extends Controller
{
    protected $saleService;

    public function __construct(SaleService $saleService)
    {
        $this->saleService = $saleService;
    }

    /**
     * Search products for POS
     */
    public function searchProducts(Request $request)
    {
        $query = $request->input('q');
        $categoryId = $request->input('category_id');
        
        // Normally, POS items are active, sellable products.
        $products = Product::with(['category', 'brand', 'serials' => function($q) {
            $q->where('status', 'available');
        }])
            ->where('status', 'active');

        if ($query) {
            $products->where(function($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('sku', 'like', "%{$query}%")
                  ->orWhere('barcode', 'like', "%{$query}%");
            });
        }

        if ($categoryId) {
            $products->where('category_id', $categoryId);
        }

        // Limit results for fast POS response
        return $this->success($products->limit(50)->get());
    }

    /**
     * Process checkout
     */
    public function checkout(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'payments' => 'nullable|array',
            'status' => 'nullable|string',
            // Default to first warehouse for now. In a real multi-branch setup, the user selects their active branch/warehouse on login.
        ]);

        try {
            $warehouse = Warehouse::where('status', 'active')->first() ?? Warehouse::first(); // Fallback to main warehouse
            
            $sale = $this->saleService->processSale(
                $request->all(),
                auth()->id() ?? 1, // Fallback to 1 if not fully authed in dev
                1, // company_id
                1, // branch_id
                $warehouse
            );

            return $this->success($sale, 'Sale completed successfully.', 201);
            
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    /**
     * Sync Offline Transactions
     */
    public function syncOffline(Request $request)
    {
        $transactions = $request->input('transactions', []);
        $syncedCount = 0;
        $failedCount = 0;

        $warehouse = Warehouse::where('status', 'active')->first() ?? Warehouse::first();

        foreach ($transactions as $tx) {
            try {
                if (isset($tx['uuid']) && Sale::where('uuid', $tx['uuid'])->exists()) {
                    continue; // Skip already synced
                }

                $this->saleService->processSale(
                    $tx,
                    $tx['user_id'] ?? auth()->id() ?? 1,
                    1, 1, $warehouse,
                    $tx['uuid'] ?? null
                );

                $syncedCount++;
            } catch (\Exception $e) {
                Log::error("Offline Sync Error for UUID " . ($tx['uuid'] ?? 'unknown') . ": " . $e->getMessage());
                $failedCount++;
            }
        }

        return $this->success([
            'synced' => $syncedCount,
            'failed' => $failedCount
        ]);
    }
}
