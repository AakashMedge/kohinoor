import db from '@/lib/db';
import { notFound } from 'next/navigation';
import PrintButton from './PrintButton';
import InvoiceTemplate from './InvoiceTemplate';

export const dynamic = 'force-dynamic';

export default async function InvoicePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const invoiceId = parseInt(id, 10);

    if (isNaN(invoiceId)) {
        notFound();
    }

    // Fetch Full Invoice Details
    const invoiceQuery = await db`
    SELECT i.*, 
           c.name as customer_name, c.phone as customer_phone, c.pan as customer_pan, c.aadhaar as customer_aadhaar,
           s.name as shop_name, s.gstin as shop_gstin, s.address as shop_address, s.bank_details as shop_bank_details,
           s.phone as shop_phone, s.email as shop_email, s.tagline as shop_tagline, s.bis_license as shop_bis_license, s.cin_number as shop_cin_number
    FROM invoices i
    JOIN customers c ON i.customer_id = c.id
    JOIN shops s ON i.shop_id = s.id
    WHERE i.id = ${invoiceId}
  `;

    if (invoiceQuery.length === 0) {
        return (
            <div className="container text-center mt-6">
                <h1>Invoice Not Found</h1>
                <p>The requested invoice does not exist or has been deleted.</p>
                <a href="/" className="btn btn-primary mt-4" style={{ textDecoration: 'none' }}>Go Back</a>
            </div>
        );
    }

    const invoice = invoiceQuery[0];

    // Fetch Invoice Items
    const itemsQuery = await db`
    SELECT * FROM invoice_items
    WHERE invoice_id = ${invoiceId}
  `;

    return (
        <div className="container" style={{ maxWidth: '900px' }}>
            <div className="flex justify-between items-center mb-6 no-print">
                <div>
                    <h1 className="mb-0">Invoice {invoice.invoice_number}</h1>
                    <p>Created on {new Date(invoice.created_at).toLocaleString('en-IN')}</p>
                </div>
                <div className="flex gap-4">
                    <a href="/" className="btn btn-outline" style={{ textDecoration: 'none' }}>Back to Dashboard</a>
                    <PrintButton />
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="invoice-print-wrapper" style={{ padding: '2rem' }}>
                    <InvoiceTemplate invoice={invoice} items={itemsQuery} />
                </div>
            </div>
        </div>
    );
}
