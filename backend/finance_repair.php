<?php

use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\JournalEntry;
use App\Services\AccountingService;

$accountingService = app(AccountingService::class);

$salesIds = Sale::where('status', '!=', 'draft')->pluck('id')->toArray();
$journalSalesIds = JournalEntry::where('reference_type', 'Sale')->pluck('reference_id')->toArray();
$missingSales = array_diff($salesIds, $journalSalesIds);

echo "Found " . count($missingSales) . " missing sales journals. Repairing...\n";

foreach ($missingSales as $saleId) {
    $sale = Sale::with('items.product', 'payments')->find($saleId);
    if ($sale) {
        try {
            // FIX CORRUPT SALE RECORDS FROM OLD TESTS
            if ((float)$sale->grand_total == 0) {
                $subtotal = 0;
                $tax = 0;
                
                // If payment exists, use payment amount to guess total, otherwise use product price
                $totalPaid = $sale->payments->sum('amount');
                
                foreach($sale->items as $item) {
                    $itemPrice = $item->product->selling_price;
                    $itemSubtotal = $itemPrice * $item->quantity;
                    $itemTax = $itemSubtotal * (($item->product->tax_rate ?? 0) / 100);
                    
                    $item->unit_price = $itemPrice;
                    $item->subtotal = $itemSubtotal;
                    $item->tax_amount = $itemTax;
                    $item->total = $itemSubtotal + $itemTax;
                    $item->save();
                    
                    $subtotal += $itemSubtotal;
                    $tax += $itemTax;
                }
                $sale->subtotal = $subtotal;
                $sale->tax_amount = $tax;
                $sale->grand_total = $subtotal + $tax - $sale->discount_amount;
                $sale->save();
                echo "Fixed Corrupt Sale Totals for Sale #{$saleId}: New Grand Total = {$sale->grand_total}\n";
            }

            $accountingService->postSale($sale);
            echo "Repaired Sale #{$saleId}: Journal Entry created successfully.\n";
        } catch (\Exception $e) {
            echo "Failed to repair Sale #{$saleId}: " . $e->getMessage() . "\n";
        }
    }
}

echo "Repair complete.\n";
