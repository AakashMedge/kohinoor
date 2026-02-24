'use client';

import { MessageCircle } from 'lucide-react';

interface WhatsAppProps {
    phone: string;
    customerName: string;
    invoiceNumber: string;
    amount: string | number;
}

export default function WhatsAppButton({ phone, customerName, invoiceNumber, amount }: WhatsAppProps) {
    const handleWhatsApp = () => {
        // Format the personalized message
        const message = `Dear ${customerName || 'Customer'},\n\nThank you for shopping at Kohinoor Jewellers! Your Invoice No ${invoiceNumber} for ₹${Number(amount).toLocaleString('en-IN')} is confirmed.\n\nPlease find your printed bill attached or collect it from the store.\n\nWe look forward to serving you again!`;

        // Clean the phone number by stripping any spaces/hyphens
        let cleanPhone = phone ? phone.replace(/\D/g, '') : '';

        // If the number starts with 0 (e.g., 09876543210), strip the leading 0
        if (cleanPhone.startsWith('0')) {
            cleanPhone = cleanPhone.substring(1);
        }

        // Map native 10 digit Indian number to the 91 Country Code logic
        if (cleanPhone && cleanPhone.length === 10) {
            cleanPhone = '91' + cleanPhone;
        }

        // URL encode the message properly for HTTP rendering
        const encodedMessage = encodeURIComponent(message);

        // Generate the click-to-chat API link
        let url = `https://api.whatsapp.com/send?text=${encodedMessage}`;
        if (cleanPhone) {
            url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;
        }

        // Force launch into a new tab 
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <button
            onClick={handleWhatsApp}
            className="btn"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#25D366', // Official WhatsApp Green
                color: '#fff',
                border: 'none'
            }}
        >
            <MessageCircle size={18} />
            <span>WhatsApp</span>
        </button>
    );
}
