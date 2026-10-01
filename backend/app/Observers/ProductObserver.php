<?php

namespace App\Observers;

use App\Models\Product;
use App\Models\PriceHistory;

class ProductObserver
{
    /**
     * Handle the Product "updating" event.
     */
    public function updating(Product $product): void
    {
        $fields = ['cost_price', 'selling_price', 'wholesale_price'];
        
        foreach ($fields as $field) {
            if ($product->isDirty($field)) {
                PriceHistory::create([
                    'product_id' => $product->id,
                    'user_id' => auth()->id(), // Requires user to be authenticated, or null
                    'price_type' => $field,
                    'old_price' => $product->getOriginal($field),
                    'new_price' => $product->{$field},
                ]);
            }
        }
    }
}
