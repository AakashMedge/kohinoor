'use client';

import { Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

export default function PrintButton() {
    const handlePrint = () => {
        const element = document.getElementById('printable-invoice');
        if (element) {
            window.print();
        }
    };

    return (
        <button onClick={() => handlePrint()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Printer size={18} />
            <span>Print / Download PDF</span>
        </button>
    );
}
