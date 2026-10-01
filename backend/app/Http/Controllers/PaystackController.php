<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\PaystackTransaction;
use App\Models\Sale;

class PaystackController extends Controller
{
    private $secretKey;

    public function __construct()
    {
        $this->secretKey = env('PAYSTACK_SECRET_KEY', 'sk_test_mock123'); // Default mock for testing
    }

    /**
     * Initialize Payment (Called by React)
     */
    public function initialize(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'amount' => 'required|numeric|min:100', // Amount in NGN
            'sale_id' => 'nullable|exists:sales,id'
        ]);

        $reference = 'EP_' . uniqid() . '_' . time();

        PaystackTransaction::create([
            'reference' => $reference,
            'amount' => $request->amount,
            'email' => $request->email,
            'sale_id' => $request->sale_id,
            'status' => 'pending'
        ]);

        // Mock mode for local testing if key is dummy
        if ($this->secretKey === 'sk_test_mock123' || env('APP_ENV') === 'testing') {
            return $this->success([
                'authorization_url' => "http://localhost:5175/mock-paystack?ref={$reference}",
                'access_code' => "mock_code",
                'reference' => $reference
            ]);
        }

        $response = Http::withToken($this->secretKey)
            ->post('https://api.paystack.co/transaction/initialize', [
                'email' => $request->email,
                'amount' => $request->amount * 100, // Paystack expects Kobo
                'reference' => $reference,
                'callback_url' => env('FRONTEND_URL') . "/payment/callback"
            ]);

        if ($response->successful()) {
            return $this->success($response->json()['data']);
        }

        return $this->error('Failed to initialize Paystack payment', 400);
    }

    /**
     * Webhook Endpoint (Called by Paystack Server)
     */
    public function webhook(Request $request)
    {
        // 1. Validate Signature
        $signature = $request->header('x-paystack-signature');
        $payload = $request->getContent();
        
        if ($this->secretKey !== 'sk_test_mock123') { // Skip signature check in mock mode
            if (!$signature || $signature !== hash_hmac('sha512', $payload, $this->secretKey)) {
                Log::error("Paystack Webhook: Invalid Signature");
                return response()->json(['status' => 'error'], 401);
            }
        }

        $event = json_decode($payload, true);
        Log::info("Paystack Webhook Event: " . $event['event']);

        if ($event['event'] === 'charge.success') {
            $reference = $event['data']['reference'];
            $transaction = PaystackTransaction::where('reference', $reference)->first();

            if (!$transaction) {
                Log::error("Paystack Webhook: Transaction $reference not found in DB.");
                return response()->json(['status' => 'ok']);
            }

            // 2. Idempotency Check
            if ($transaction->status === 'success') {
                return response()->json(['status' => 'ok']); // Already processed
            }

            // 3. Update DB
            $transaction->update([
                'status' => 'success',
                'gateway_response' => $event['data'],
                'paid_at' => now()
            ]);

            // Optional: Mark sale as paid
            if ($transaction->sale_id) {
                $sale = Sale::find($transaction->sale_id);
                if ($sale) {
                    $sale->update(['payment_status' => 'paid']);
                    // Trigger PaymentReceivedNotification here if needed
                }
            }
        }

        return response()->json(['status' => 'success']);
    }

    /**
     * Verify Transaction (Optional, callable by Frontend after redirect)
     */
    public function verify($reference)
    {
        $transaction = PaystackTransaction::where('reference', $reference)->firstOrFail();

        if ($this->secretKey === 'sk_test_mock123' || env('APP_ENV') === 'testing') {
            $transaction->update(['status' => 'success', 'paid_at' => now()]);
            return $this->success(['status' => 'success', 'transaction' => $transaction]);
        }

        $response = Http::withToken($this->secretKey)
            ->get("https://api.paystack.co/transaction/verify/" . $reference);

        if ($response->successful()) {
            $data = $response->json()['data'];
            if ($data['status'] === 'success' && $transaction->status !== 'success') {
                $transaction->update([
                    'status' => 'success',
                    'gateway_response' => $data,
                    'paid_at' => now()
                ]);
            }
            return $this->success(['status' => $data['status'], 'transaction' => $transaction]);
        }

        return $this->error('Verification failed', 400);
    }
}
