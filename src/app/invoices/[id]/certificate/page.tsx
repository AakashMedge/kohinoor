import db from '@/lib/db';
import { notFound } from 'next/navigation';
import PrintCertificateButton from './PrintCertificateButton';

export const dynamic = 'force-dynamic';

export default async function CertificatePage({
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
           s.name as shop_name, s.gstin as shop_gstin, s.address as shop_address, s.bis_license as shop_bis_license
    FROM invoices i
    JOIN customers c ON i.customer_id = c.id
    JOIN shops s ON i.shop_id = s.id
    WHERE i.id = ${invoiceId}
  `;

    if (invoiceQuery.length === 0) {
        return notFound();
    }

    const invoice = invoiceQuery[0];

    // Fetch Invoice Items
    const itemsQuery = await db`
    SELECT * FROM invoice_items
    WHERE invoice_id = ${invoiceId}
  `;
    const totalNetWeight = itemsQuery.reduce((acc: number, item: any) => acc + Number(item.net_weight), 0);

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '2rem 0', fontFamily: 'serif' }}>
            {/* Print Action Bar */}
            <div className="container no-print mb-6 flex justify-between items-center" style={{ maxWidth: '800px' }}>
                <a href={`/invoices/${invoiceId}`} className="btn btn-outline" style={{ textDecoration: 'none' }}>← Back to Invoice</a>
                <PrintCertificateButton />
            </div>

            {/* Certificate Template */}
            <div className="container" id="printable-certificate" style={{
                maxWidth: '800px',
                background: '#fff',
                padding: '4rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative Borders */}
                <div style={{ position: 'absolute', top: '15px', left: '15px', right: '15px', bottom: '15px', border: '2px solid #ca8a04' }}></div>
                <div style={{ position: 'absolute', top: '22px', left: '22px', right: '22px', bottom: '22px', border: '1px solid #ca8a04', opacity: 0.5 }}></div>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
                    <h1 style={{
                        margin: '0',
                        color: '#92400e',
                        fontSize: '2.5rem',
                        letterSpacing: '3px',
                        textTransform: 'uppercase'
                    }}>{invoice.shop_name}</h1>
                    <p style={{ color: '#b45309', letterSpacing: '2px', fontSize: '0.9rem', marginTop: '0.5rem', textTransform: 'uppercase' }}>
                        Govt. Approved BIS Hallmark Jewellers
                    </p>
                    <div style={{ width: '100px', height: '2px', background: '#ca8a04', margin: '1.5rem auto' }}></div>
                    <h2 style={{ color: '#1e293b', fontSize: '1.8rem', letterSpacing: '1px' }}>CERTIFICATE OF AUTHENTICITY</h2>
                </div>

                {/* Declaration Statement */}
                <div style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#334155', textAlign: 'justify', marginBottom: '3rem', padding: '0 2rem' }}>
                    This is to proudly certify that the jewellery article(s) purchased by <strong>{invoice.customer_name}</strong> on <strong>{new Date(invoice.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</strong> under Invoice <strong>{invoice.invoice_number}</strong> have been rigorously tested for quality and purity.
                    We hereby guarantee the fineness and craftsmanship of the product as detailed below.
                </div>

                {/* Product Detail Table */}
                <div style={{ padding: '0 2rem', marginBottom: '3rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1' }}>
                        <thead style={{ background: '#fef3c7', color: '#92400e' }}>
                            <tr>
                                <th style={{ padding: '12px', border: '1px solid #cbd5e1', textAlign: 'left' }}>Item Description</th>
                                <th style={{ padding: '12px', border: '1px solid #cbd5e1', textAlign: 'center' }}>HUID Code</th>
                                <th style={{ padding: '12px', border: '1px solid #cbd5e1', textAlign: 'center' }}>Purity</th>
                                <th style={{ padding: '12px', border: '1px solid #cbd5e1', textAlign: 'right' }}>Net Weight</th>
                            </tr>
                        </thead>
                        <tbody>
                            {itemsQuery.map((item: any, index: number) => (
                                <tr key={index}>
                                    <td style={{ padding: '12px', border: '1px solid #cbd5e1', color: '#1e293b' }}>{item.description}</td>
                                    <td style={{ padding: '12px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold', color: '#1e293b' }}>{item.hsn_huid}</td>
                                    {/* Default to 22K (916) but if it's 75% or 99.9%, this logic holds up well */}
                                    <td style={{ padding: '12px', border: '1px solid #cbd5e1', textAlign: 'center', color: '#1e293b' }}>
                                        {item.purity_kt || '22K (91.6%)'}
                                    </td>
                                    <td style={{ padding: '12px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#1e293b' }}>{Number(item.net_weight).toFixed(3)} g</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot style={{ background: '#fffbeb' }}>
                            <tr>
                                <td colSpan={3} style={{ padding: '12px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 'bold', color: '#92400e' }}>Total Certified Weight:</td>
                                <td style={{ padding: '12px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 'bold', color: '#92400e' }}>{totalNetWeight.toFixed(3)} g</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Footer Signature Block */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2rem', marginTop: '5rem', alignItems: 'flex-end' }}>
                    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                        <strong>BIS License:</strong> {invoice.shop_bis_license || 'Not Available'}<br />
                        <strong>Date of Issue:</strong> {new Date().toLocaleDateString('en-IN')}<br />
                        <span style={{ fontSize: '0.8rem', marginTop: '10px', display: 'block' }}>* Protect this document for resale/insurance purposes.</span>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '200px', borderBottom: '1px solid #1e293b', marginBottom: '10px' }}></div>
                        <strong style={{ color: '#1e293b' }}>Authorized Signatory</strong><br />
                        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>For {invoice.shop_name}</span>
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        body { background: #fff !important; }
                        .no-print { display: none !important; }
                        #printable-certificate {
                            box-shadow: none !important;
                            padding: 2rem !important;
                        }
                    }
                `}} />
            </div>
        </div>
    );
}
