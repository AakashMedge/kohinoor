import db from '@/lib/db';
import ReportClient from './ReportClient';

export const dynamic = 'force-dynamic';

export default async function ReportsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { fromDate, toDate, searchNumber } = await searchParams;

    // Build the dynamic query using postgres.js template literal behavior.
    // Instead of building strings which causes SQL injection risks, we construct it safely.

    let filterConditions = '';

    let sql = db`
    SELECT i.*, 
           c.name as customer_name, c.pan as customer_pan, c.aadhaar as customer_aadhaar 
    FROM invoices i 
    JOIN customers c ON i.customer_id = c.id 
    ORDER BY i.created_at DESC 
    LIMIT 1000
  `;

    // Safe routing of filters
    if (fromDate && !toDate && !searchNumber) {
        sql = db`SELECT i.*, c.name as customer_name, c.pan as customer_pan, c.aadhaar as customer_aadhaar FROM invoices i JOIN customers c ON i.customer_id = c.id WHERE i.date >= ${fromDate as string} ORDER BY i.created_at DESC LIMIT 1000`;
    }
    else if (fromDate && toDate && !searchNumber) {
        sql = db`SELECT i.*, c.name as customer_name, c.pan as customer_pan, c.aadhaar as customer_aadhaar FROM invoices i JOIN customers c ON i.customer_id = c.id WHERE i.date >= ${fromDate as string} AND i.date <= ${toDate as string} ORDER BY i.created_at DESC LIMIT 1000`;
    }
    else if (searchNumber) {
        const cn = '%' + searchNumber.toString().trim() + '%';
        sql = db`SELECT i.*, c.name as customer_name, c.pan as customer_pan, c.aadhaar as customer_aadhaar FROM invoices i JOIN customers c ON i.customer_id = c.id WHERE i.invoice_number ILIKE ${cn} ORDER BY i.created_at DESC LIMIT 1000`;
    }

    const invoices = await sql;

    return (
        <div className="container" style={{ maxWidth: '1100px', paddingBottom: '100px' }}>
            <h1 className="mb-6 border-b pb-4 text-primary">Invoice Ledger & CA Export</h1>

            {/* Filter Options */}
            <form className="card mb-6 bg-white" style={{ display: 'flex', gap: '20px', alignItems: 'end', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <label className="form-label" style={{ fontWeight: 'bold' }}>From Date</label>
                    <input type="date" name="fromDate" defaultValue={fromDate as string || ''} className="form-control" />
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <label className="form-label" style={{ fontWeight: 'bold' }}>To Date (Optional)</label>
                    <input type="date" name="toDate" defaultValue={toDate as string || ''} className="form-control" />
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
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

            {/* Renders the interactive client-side multi-selectable table */}
            <ReportClient invoices={invoices} />

        </div>
    );
}
