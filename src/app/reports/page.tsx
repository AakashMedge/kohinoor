import db from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ReportsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { dateFilter, searchNumber } = await searchParams;

    let query = db`SELECT id, invoice_number, date, grand_total, payment_mode, customer_id, created_at FROM invoices WHERE 1=1 `;

    if (dateFilter) {
        query = db`SELECT id, invoice_number, date, grand_total, payment_mode, customer_id, created_at FROM invoices WHERE date = ${dateFilter as string} `;
    }

    if (searchNumber) {
        const cleanNumber = (searchNumber as string).trim();
        query = db`SELECT id, invoice_number, date, grand_total, payment_mode, customer_id, created_at FROM invoices WHERE invoice_number ILIKE ${'%' + cleanNumber + '%'} `;
    }

    const invoices = await db`
    ${query}
    ORDER BY created_at DESC 
    LIMIT 100
  `;

    return (
        <div className="container" style={{ maxWidth: '1000px', paddingBottom: '100px' }}>
            <h1 className="mb-6 border-b pb-4 text-primary">Invoice Ledger</h1>

            {/* Filter Options */}
            <form className="card mb-6 bg-white" style={{ display: 'flex', gap: '20px', alignItems: 'end' }}>
                <div style={{ flex: 1 }}>
                    <label className="form-label" style={{ fontWeight: 'bold' }}>Filter By Date</label>
                    <input type="date" name="dateFilter" defaultValue={dateFilter as string || ''} className="form-control" />
                </div>
                <div style={{ flex: 1 }}>
                    <label className="form-label" style={{ fontWeight: 'bold' }}>Search Invoice No.</label>
                    <input type="text" name="searchNumber" defaultValue={searchNumber as string || ''} placeholder="Ex: 3/25-26" className="form-control" />
                </div>
                <div>
                    <button type="submit" className="btn btn-secondary" style={{ padding: '0.6rem 2rem' }}>Apply Filters</button>
                </div>
                <div>
                    <a href="/reports" className="btn btn-outline" style={{ padding: '0.6rem 2rem', textDecoration: 'none' }}>Clear</a>
                </div>
            </form>

            {/* Results Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="flex justify-between items-center p-4 bg-white border-b">
                    <h3 className="m-0">All Generated Invoices</h3>
                    <span className="text-muted" style={{ fontWeight: 'bold' }}>Showing {invoices.length} results</span>
                </div>

                {invoices.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <p>No invoices found matching these filters.</p>
                    </div>
                ) : (
                    <div className="table-container" style={{ borderRadius: 0, border: 'none' }}>
                        <table className="table" style={{ margin: 0 }}>
                            <thead style={{ background: '#f8fafc' }}>
                                <tr>
                                    <th style={{ color: '#0f172a' }}>Inv No.</th>
                                    <th style={{ color: '#0f172a' }}>Date</th>
                                    <th style={{ color: '#0f172a' }}>Amount</th>
                                    <th style={{ color: '#0f172a' }}>Payment Mode</th>
                                    <th style={{ color: '#0f172a' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((inv: any) => {
                                    let badgeColor = '#64748b';
                                    let badgeBg = '#f1f5f9';

                                    if (inv.payment_mode === 'SPLIT DETAILS') {
                                        badgeColor = '#047857';
                                        badgeBg = '#d1fae5';
                                    } else if (inv.payment_mode === 'Cash') {
                                        badgeColor = '#0369a1';
                                        badgeBg = '#e0f2fe';
                                    } else if (inv.payment_mode === 'UPI') {
                                        badgeColor = '#6d28d9';
                                        badgeBg = '#ede9fe';
                                    }

                                    return (
                                        <tr key={inv.id}>
                                            <td style={{ fontWeight: 'bold' }}>{inv.invoice_number}</td>
                                            <td>{new Date(inv.date).toLocaleDateString('en-IN')}</td>
                                            <td style={{ fontWeight: 'bold', fontSize: '15px' }}>₹ {Number(inv.grand_total).toLocaleString('en-IN')}</td>
                                            <td>
                                                <span style={{
                                                    background: badgeBg,
                                                    color: badgeColor,
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    fontWeight: 'bold',
                                                    fontSize: '11px',
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    {inv.payment_mode === 'SPLIT DETAILS' ? 'MULTI / SPLIT' : inv.payment_mode}
                                                </span>
                                            </td>
                                            <td>
                                                <Link href={`/invoices/${inv.id}`} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px', textDecoration: 'none' }}>
                                                    View Bill
                                                </Link>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
