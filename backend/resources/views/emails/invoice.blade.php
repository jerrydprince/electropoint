<!DOCTYPE html>
<html>
<head>
    <title>Invoice from Electropoint</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-w-2xl mx-auto p-4">
        <h2 style="color: #ef4444;">Electropoint Electronics</h2>
        <p>Dear {{ $sale->customer ? $sale->customer->name : 'Customer' }},</p>
        
        <p>Thank you for your business. Please find the details of your invoice below:</p>
        
        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Invoice Number:</strong> {{ $sale->receipt_number }}</p>
            <p><strong>Date:</strong> {{ $sale->created_at->format('M d, Y') }}</p>
            <p><strong>Total Amount:</strong> ₦{{ number_format($sale->grand_total, 2) }}</p>
            <p><strong>Payment Status:</strong> {{ ucfirst($sale->payment_status) }}</p>
        </div>

        @if($sale->payment_status !== 'paid')
            <p style="color: #ea580c;"><strong>Note:</strong> Please make payment to our designated bank accounts or click the secure payment link provided separately.</p>
        @endif

        <p>Best regards,<br>The Electropoint Team</p>
    </div>
</body>
</html>
