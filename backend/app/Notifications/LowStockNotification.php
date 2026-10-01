<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Product;

class LowStockNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $product;
    public $currentStock;

    public function __construct(Product $product, int $currentStock)
    {
        $this->product = $product;
        $this->currentStock = $currentStock;
    }

    public function via($notifiable)
    {
        return ['database']; // Can add 'mail' based on user config later
    }

    public function toArray($notifiable)
    {
        return [
            'type' => 'low_stock',
            'product_id' => $this->product->id,
            'message' => "Stock for {$this->product->name} (SKU: {$this->product->sku}) is running low! Current stock: {$this->currentStock}.",
            'action_url' => "/products/{$this->product->id}"
        ];
    }
}
