<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Services\SmsService;
use App\Models\Sale;

class PaymentReceivedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $sale;

    public function __construct(Sale $sale)
    {
        $this->sale = $sale;
    }

    public function via($notifiable)
    {
        // For demonstration, we just log/mock SMS here, but normally we'd define a custom channel
        return ['database'];
    }

    public function toArray($notifiable)
    {
        // Try sending SMS via Service immediately (In production, use a proper custom SMS channel)
        if ($this->sale->customer && $this->sale->customer->phone) {
            $sms = new SmsService();
            $msg = "Dear {$this->sale->customer->name}, we have received your payment of ₦{$this->sale->grand_total} for Inv #{$this->sale->receipt_number}. Thank you for choosing Electropoint!";
            $sms->sendSms($this->sale->customer->phone, $msg);
        }

        return [
            'type' => 'payment_received',
            'sale_id' => $this->sale->id,
            'message' => "Payment of ₦{$this->sale->grand_total} received for Invoice #{$this->sale->receipt_number}.",
            'action_url' => "/sales/{$this->sale->id}"
        ];
    }
}
