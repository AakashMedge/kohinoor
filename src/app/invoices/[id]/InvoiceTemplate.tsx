'use client';

type InvoiceParams = {
    invoice: any;
    items: any[];
};

export default function InvoiceTemplate({ invoice, items }: InvoiceParams) {
    // Convert basic Date string securely for the client
    const dateObj = new Date(invoice.date);
    const dateFormatted = `${String(dateObj.getDate()).padStart(2, '0')}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${dateObj.getFullYear()}`;

    const totalItemAmount = items.reduce((acc, item) => acc + Number(item.amount), 0);
    const totalNetWeight = items.reduce((acc, item) => acc + Number(item.net_weight), 0);
    const roundOff = (Number(invoice.grand_total) - (Number(invoice.total_amount) + Number(invoice.cgst) + Number(invoice.sgst))).toFixed(2);

    return (
        <div id="printable-invoice" className="invoice-document" style={{
            background: '#fff',
            padding: '0',
            color: '#000',
            fontFamily: 'Arial, Helvetica, sans-serif', // Using standard system font for precision
            fontSize: '11px',
            maxWidth: '210mm',
            margin: '0 auto'
        }}>
            {/* CSS for print media directly injected to match exact borders and line heights */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { size: A4; margin: 10mm; }
          .no-print { display: none; }
        }
        .maha-table { width: 100%; border-collapse: collapse; }
        .maha-table th, .maha-table td { border: 1px solid #000; padding: 2px 4px; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        .bold { font-weight: bold; }
        
        .header-top { display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; margin-bottom: 5px; }
        
        /* The main logo text */
        .shop-title { text-align: center; color: #6b21a8; font-size: 38px; font-weight: 900; letter-spacing: 1px; margin: 5px 0; font-family: "Impact", "Arial Black", sans-serif; text-shadow: 2px 2px #d8b4e2; }
        .shop-tagline { text-align: center; color: #9d174d; font-size: 14px; font-weight: bold; margin: 0 0 5px 0; }
        .shop-address { text-align: center; font-size: 12px; margin: 0 0 2px 0; }
        .shop-email { text-align: center; font-size: 12px; margin: 0 0 10px 0; }
        .tax-invoice-label { text-align: center; font-weight: bold; text-decoration: underline; margin-bottom: 5px; }

        .meta-grid { display: grid; grid-template-columns: 60% 40%; border: 1px solid #000; border-bottom: none; }
        .meta-box { border-right: 1px solid #000; padding: 4px; }
        .meta-box:last-child { border-right: none; }
        .meta-row { display: flex; border-bottom: 1px solid #000; }
        .meta-row:last-child { border-bottom: none; }
        
        .maha-table th { font-size: 11px; background-color: #f9f9f9; }
        .maha-table td { font-size: 11px; vertical-align: middle; }
        
        .summary-grid { display: grid; grid-template-columns: 70% 30%; border: 1px solid #000; border-top: none; }
        .summary-left { border-right: 1px solid #000; padding: 10px; position: relative; }
        .summary-right { padding: 0; }
        
        .calc-table { width: 100%; border-collapse: collapse; }
        .calc-table td, .calc-table th { border-bottom: 1px solid #000; border-left: 1px solid #000; padding: 3px 6px; }
        .calc-table td:first-child { border-left: none; }
        .calc-table tr:last-child td { border-bottom: none; }
        
        .footer-grid { display: grid; grid-template-columns: 50% 50%; border: 1px solid #000; border-top: none; }
      `}} />

            {/* Very Top Header */}
            <div className="header-top">
                <div>GSTIN : {invoice.shop_gstin}</div>
                <div>Mobile : {invoice.shop_phone}</div>
            </div>

            {/* Main Branding */}
            <h1 className="shop-title">{invoice.shop_name}</h1>
            <p className="shop-tagline">{invoice.shop_tagline}</p>
            <p className="shop-address">{invoice.shop_address}</p>
            <p className="shop-email">Email : {invoice.shop_email}</p>
            <div className="tax-invoice-label">GOLD TAX INVOICE</div>

            {/* Customer & Document Meta Block */}
            <div className="meta-grid">
                <div style={{ padding: '0' }} className="meta-box">
                    <div className="meta-row" style={{ padding: '4px' }}>
                        <span className="bold" style={{ width: '130px' }}>Customer Name :</span>
                        <span className="bold">{invoice.customer_name}</span>
                    </div>
                    <div className="meta-row" style={{ padding: '4px', alignItems: 'center' }}>
                        <span className="bold" style={{ width: '130px' }}>Address :</span>
                        <span>{invoice.customer_address || 'Walk-in Customer'}</span>
                        <span className="bold" style={{ marginLeft: 'auto' }}>Mob No.:</span>
                        <span style={{ marginLeft: '5px' }}>{invoice.customer_phone}</span>
                    </div>
                    <div className="meta-row" style={{ padding: '4px', alignItems: 'center' }}>
                        <span className="bold" style={{ width: '130px' }}>PAN / GSTIN :</span>
                        <span>{invoice.customer_pan || ''}</span>
                        <span className="bold" style={{ marginLeft: 'auto' }}>Aadhaar No. :</span>
                        <span style={{ marginLeft: '5px' }}>{invoice.customer_aadhaar || ''}</span>
                    </div>
                </div>

                <div style={{ padding: '0' }}>
                    <div className="meta-row" style={{ padding: '4px' }}>
                        <span className="bold" style={{ width: '80px' }}>Invoice No</span>
                        <span className="bold">: {invoice.invoice_number}</span>
                    </div>
                    <div className="meta-row" style={{ padding: '4px' }}>
                        <span className="bold" style={{ width: '80px' }}>Date</span>
                        <span className="bold">: {dateFormatted}</span>
                    </div>
                    <div className="meta-row" style={{ padding: '4px' }}>
                        <span className="bold" style={{ width: '80px' }}>Ref</span>
                        <span className="bold">: </span>
                    </div>
                    <div className="meta-row" style={{ padding: '4px' }}>
                        <span className="bold" style={{ width: '80px' }}>Gold Rate</span>
                        <span className="bold">: {invoice.gold_rate || 0}</span>
                    </div>
                </div>
            </div>

            {/* Main Items Table */}
            <table className="maha-table">
                <thead>
                    <tr>
                        <th style={{ width: '4%' }}>SR No</th>
                        <th style={{ width: '28%' }}>Description</th>
                        <th style={{ width: '12%' }}>HUID</th>
                        <th style={{ width: '8%' }}>HSN Code</th>
                        <th style={{ width: '7%' }}>Purity</th>
                        <th style={{ width: '8%' }}>Grs Wt</th>
                        <th style={{ width: '8%' }}>Net<br />Chargeable<br />Wt</th>
                        <th style={{ width: '10%' }}>Rate/Gm</th>
                        <th style={{ width: '15%' }}>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Print 10 Empty rows to maintain table height like traditional bills, filling in data where it exists */}
                    {Array.from({ length: Math.max(10, items.length) }).map((_, idx) => {
                        const item = items[idx];
                        return (
                            <tr key={idx} style={{ height: '22px' }}>
                                <td className="text-center bold">{item ? idx + 1 : ''}</td>
                                <td className="bold">{item ? item.description : ''}</td>
                                <td className="text-center bold">{item ? (item.huid || '-') : ''}</td>
                                <td className="text-center bold">{item ? item.hsn : ''}</td>
                                <td className="text-center bold">{item ? item.purity : ''}</td>
                                <td className="text-right bold">{item ? Number(item.gross_weight).toFixed(3) : ''}</td>
                                <td className="text-right bold">{item ? Number(item.net_weight).toFixed(3) : ''}</td>
                                <td className="text-right bold">{item ? Number(item.rate).toFixed(2) : ''}</td>
                                <td className="text-right bold">{item ? Number(item.amount).toFixed(2) : ''}</td>
                            </tr>
                        );
                    })}
                    {/* Total Row matching the column offsets precisely */}
                    <tr style={{ height: '25px', backgroundColor: '#f9f9f9' }}>
                        <td colSpan={5} style={{ borderRight: 'none' }}></td>
                        <td className="text-right bold" style={{ borderLeft: 'none', borderRight: 'none' }}></td>
                        <td className="text-right bold">{totalNetWeight.toFixed(3)}</td>
                        <td className="text-right bold" style={{ borderRight: 'none' }}></td>
                        <td className="text-right bold">{totalItemAmount.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>

            {/* Subtotal, Taxation and Payments Grid */}
            <div className="summary-grid">
                <div className="summary-left">
                    <div className="bold" style={{ fontSize: '11px', marginBottom: '40px' }}>
                        ORDER NO. :
                    </div>

                    <div className="bold" style={{ fontSize: '11px', lineHeight: '1.5' }}>
                        BIS LIC NO. : {invoice.shop_bis_license}<br />
                        CIN NO. : {invoice.shop_cin_number}<br />
                        GST NO. : {invoice.shop_gstin}<br />
                        Subject To MUMBAI Jurisdiction
                    </div>

                    {/* BIS Logo Placeholder */}
                    <div style={{ position: 'absolute', bottom: '10px', right: '30px', textAlign: 'center' }}>
                        <div style={{
                            width: '30px', height: '30px', border: '2px solid #000', borderRadius: '50%',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold'
                        }}>BIS</div><br />
                        <span style={{ fontSize: '9px', fontWeight: 'bold' }}>BIS Hall Marked<br />Jewellery Available</span>
                    </div>
                </div>

                <div className="summary-right">
                    <table className="calc-table">
                        <tbody>
                            <tr>
                                <td className="bold text-center" style={{ width: '40%' }}>SUB TOTAL</td>
                                <td className="bold text-right">{totalItemAmount.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td className="bold text-center">CGST (1.5%)</td>
                                <td className="bold text-right">{Number(invoice.cgst).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td className="bold text-center">SGST (1.5%)</td>
                                <td className="bold text-right">{Number(invoice.sgst).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td className="bold text-center">ROUND OFF</td>
                                <td className="bold text-right">{roundOff}</td>
                            </tr>
                            <tr>
                                <td className="bold text-center">TOTAL</td>
                                <td className="bold text-right">{Number(invoice.grand_total).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td className="bold text-center">ADVANCE</td>
                                <td className="bold text-right">{Number(invoice.advance_amount).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td className="bold text-center">CARDS</td>
                                <td className="bold text-right">{Number(invoice.cards_amount).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td className="bold text-center">CASH</td>
                                <td className="bold text-right">{Number(invoice.cash_amount).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td className="bold text-center">DIGITAL</td>
                                <td className="bold text-right">{Number(invoice.digital_amount).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td className="bold text-center">Balance</td>
                                <td className="bold text-right">{Number(invoice.balance_amount).toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer Info & Signatures */}
            <div className="footer-grid">
                <div style={{ padding: '4px', borderRight: '1px solid #000' }}>
                    <div className="bold" style={{ marginBottom: '2px' }}>Bank Details</div>
                    {invoice.shop_bank_details ? (
                        <div style={{ fontSize: '10px', lineHeight: '1.4' }}>
                            {invoice.shop_bank_details.split('\n').map((line: string, i: number) => {
                                // Re-split logic to align Left vs Right for Bank Details like in Mahavir
                                if (line.includes('Branch:')) {
                                    return <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}><span>{line.split('Branch:')[0]}</span><span>Branch: {line.split('Branch:')[1]}</span></div>
                                }
                                if (line.includes('IFSC')) {
                                    return <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}><span>{line.split('IFSC')[0]}</span><span>IFSC: {line.split('IFSC')[1]}</span></div>
                                }
                                return <div key={i} className="bold">{line}</div>
                            })}
                        </div>
                    ) : null}
                    <div style={{ borderTop: '1px solid #000', margin: '15px -4px 0 -4px', padding: '4px' }}>
                        <span className="bold">Cheque Details :</span>
                    </div>
                </div>

                <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', bottom: '5px', left: '10px', fontWeight: 'bold' }}>
                        Party's Signature
                    </div>
                    <div style={{ position: 'absolute', bottom: '5px', right: '10px', fontWeight: 'bold', color: '#0f766e', textTransform: 'uppercase' }}>
                        For {invoice.shop_name}
                    </div>
                </div>
            </div>

        </div>
    );
}
