<?php

namespace App\Services;

use App\Models\Inventory;
use App\Models\InventoryTransaction;
use App\Models\ProductSerial;
use App\Models\Product;
use App\Models\Warehouse;
use Illuminate\Support\Facades\DB;
use Exception;

class InventoryService
{
    /**
     * Process an inventory movement.
     */
    public function adjustStock(Product $product, Warehouse $warehouse, int $quantityDelta, string $type, ?string $reference = null, ?string $reason = null, array $serials = [])
    {
        if ($quantityDelta === 0) {
            throw new Exception("Quantity delta cannot be zero.");
        }

        return DB::transaction(function () use ($product, $warehouse, $quantityDelta, $type, $reference, $reason, $serials) {
            $inventory = Inventory::firstOrCreate(
                ['product_id' => $product->id, 'warehouse_id' => $warehouse->id],
                ['quantity' => 0, 'reserved_quantity' => 0, 'damaged_quantity' => 0]
            );

            // If removing stock, ensure enough exists
            if ($quantityDelta < 0 && $inventory->quantity + $quantityDelta < 0) {
                throw new Exception("Insufficient stock for product '{$product->name}' in warehouse '{$warehouse->name}'.");
            }

            $inventory->quantity += $quantityDelta;
            $inventory->save();

            $transaction = InventoryTransaction::create([
                'product_id' => $product->id,
                'warehouse_id' => $warehouse->id,
                'type' => $type,
                'quantity' => $quantityDelta,
                'reference' => $reference,
                'reason' => $reason,
                'user_id' => auth()->id()
            ]);

            // Handle serial numbers
            if ($product->serial_tracking) {
                if (count($serials) !== abs($quantityDelta)) {
                    throw new Exception("Product '{$product->name}' requires serial tracking. You provided " . count($serials) . " serials, but the quantity change is " . abs($quantityDelta) . ".");
                }

                if ($quantityDelta > 0) {
                    // Adding stock (opening_stock, purchase, return, transfer_in)
                    foreach ($serials as $serial) {
                        $existing = ProductSerial::where('serial_number', $serial)
                            ->where('product_id', $product->id)
                            ->first();

                        if ($existing && in_array($existing->status, ['available', 'reserved'])) {
                            throw new Exception("Serial number '{$serial}' is already active in inventory.");
                        }

                        if ($existing) {
                            $existing->update([
                                'warehouse_id' => $warehouse->id,
                                'status' => 'available',
                                'transaction_id' => $transaction->id
                            ]);
                        } else {
                            ProductSerial::create([
                                'product_id' => $product->id,
                                'serial_number' => $serial,
                                'warehouse_id' => $warehouse->id,
                                'status' => 'available',
                                'transaction_id' => $transaction->id
                            ]);
                        }
                    }
                } else {
                    // Removing stock (sale, damage, adjustment_out, transfer_out, purchase_return)
                    foreach ($serials as $serial) {
                        $existing = ProductSerial::where('serial_number', $serial)
                            ->where('product_id', $product->id)
                            ->where('warehouse_id', $warehouse->id)
                            ->where('status', 'available')
                            ->first();

                        if (!$existing) {
                            throw new Exception("Serial number '{$serial}' is not available in this warehouse.");
                        }

                        $newStatus = 'sold';
                        if ($type === 'damage') $newStatus = 'damaged';
                        if ($type === 'transfer_out') $newStatus = 'transferred';
                        if ($type === 'purchase_return') $newStatus = 'returned';

                        $existing->update([
                            'status' => $newStatus,
                            'transaction_id' => $transaction->id,
                            'warehouse_id' => ($type === 'sale' || $type === 'purchase_return') ? null : $existing->warehouse_id
                        ]);
                    }
                }
            }

            return $transaction;
        });
    }

    /**
     * Atomically transfer stock between warehouses.
     */
    public function transferStock(Product $product, Warehouse $fromWarehouse, Warehouse $toWarehouse, int $quantity, ?string $reference = null, array $serials = [])
    {
        if ($quantity <= 0) {
            throw new Exception("Transfer quantity must be greater than zero.");
        }

        if ($fromWarehouse->id === $toWarehouse->id) {
            throw new Exception("Cannot transfer to the same warehouse.");
        }

        return DB::transaction(function () use ($product, $fromWarehouse, $toWarehouse, $quantity, $reference, $serials) {
            // Transfer Out
            $this->adjustStock($product, $fromWarehouse, -$quantity, 'transfer_out', $reference, 'Transfer to ' . $toWarehouse->name, $serials);
            
            // Transfer In
            return $this->adjustStock($product, $toWarehouse, $quantity, 'transfer_in', $reference, 'Transfer from ' . $fromWarehouse->name, $serials);
        });
    }
}
