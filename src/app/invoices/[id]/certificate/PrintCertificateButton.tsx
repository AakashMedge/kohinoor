'use client';

export default function PrintCertificateButton() {
    const handlePrint = () => {
        if (typeof window !== 'undefined') {
            window.print();
        }
    };

    return (
        <button onClick={handlePrint} className="btn" style={{ background: '#ca8a04', color: '#fff', border: 'none' }}>
            🖨️ Print Certificate
        </button>
    );
}
