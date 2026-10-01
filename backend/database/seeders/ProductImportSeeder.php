<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\Warehouse;
use App\Models\Inventory;
use Illuminate\Support\Str;

class ProductImportSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $json = file_get_contents('c:/Users/jerry/.gemini/antigravity-ide/brain/dc80a2ff-ea00-4995-8cd2-5ed6f6f008bc/scratch/seeder_data.json');
        $data = json_decode($json, true);

        // Ensure we have a default warehouse
        $warehouse = Warehouse::first();
        if (!$warehouse) {
            $warehouse = Warehouse::create([
                'name' => 'Main Warehouse',
                'location' => 'Lagos',
                'status' => 'active'
            ]);
        }

        foreach ($data as $item) {
            $brand = Brand::firstOrCreate(
                ['name' => $item['brand']],
                ['status' => 'active']
            );

            $category = Category::firstOrCreate(
                ['name' => $item['category_name']],
                ['status' => 'active']
            );

            $productName = $item['model'];
            $sku = $item['barcode']; // Using barcode as SKU for simplicity, or we can use both
            
            $product = Product::firstOrCreate(
                ['barcode' => $item['barcode']],
                [
                    'name' => $productName,
                    'sku' => 'SKU-' . $item['barcode'],
                    'category_id' => $category->id,
                    'brand_id' => $brand->id,
                    'description' => $item['description'],
                    'cost_price' => rand(50000, 200000), // Default placeholders
                    'selling_price' => rand(250000, 500000),
                    'reorder_level' => 5,
                    'status' => 'active',
                ]
            );

            // Seed inventory
            Inventory::firstOrCreate(
                [
                    'product_id' => $product->id,
                    'warehouse_id' => $warehouse->id,
                ],
                [
                    'quantity' => rand(10, 50),
                    'reserved_quantity' => 0,
                    'damaged_quantity' => 0,
                ]
            );
        }
        
        $this->command->info("Seeded " . count($data) . " products and their inventory successfully.");
    }
}
