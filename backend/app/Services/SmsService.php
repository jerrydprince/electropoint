<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    /**
     * Send an SMS using Termii.
     * Mocks the request if TERMII_API_KEY is missing or in testing mode.
     */
    public function sendSms(string $to, string $message): bool
    {
        $apiKey = env('TERMII_API_KEY');
        $senderId = env('TERMII_SENDER_ID', 'Electropoint');
        $url = env('TERMII_URL', 'https://api.ng.termii.com/api/sms/send');

        if (empty($apiKey) || env('APP_ENV') === 'testing' || env('TERMII_MOCK_MODE', true)) {
            Log::info("MOCK SMS to {$to}: {$message}");
            return true;
        }

        try {
            $response = Http::post($url, [
                'to' => $to,
                'from' => $senderId,
                'sms' => $message,
                'type' => 'plain',
                'channel' => 'generic',
                'api_key' => $apiKey,
            ]);

            if ($response->successful()) {
                Log::info("Termii SMS sent successfully to {$to}");
                return true;
            }

            Log::error("Termii SMS failed: " . $response->body());
            return false;
        } catch (\Exception $e) {
            Log::error("Termii SMS Exception: " . $e->getMessage());
            return false;
        }
    }
}
