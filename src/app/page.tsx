import Link from 'next/link';
import db from '../lib/db';

import SplashScreen from '@/components/SplashScreen';

// Force dynamic since dashboard should not be cached
export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  // In a real app, we would only fetch for the currently authenticated shop (shop_id)

  // Calculate today's basic stats. 
  const today = new Date().toISOString().split('T')[0];
  const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const todayDb = await db`SELECT SUM(grand_total) as total, SUM(total_net_weight) as gold FROM invoices WHERE date = ${today}`;
  const monthDb = await db`SELECT SUM(grand_total) as total, SUM(cgst + sgst) as gst FROM invoices WHERE date >= ${thisMonthStart}`;

  const todaySales = todayDb[0]?.total || 0;
  const todayGold = todayDb[0]?.gold || 0;

  const monthSales = monthDb[0]?.total || 0;
  const monthGst = monthDb[0]?.gst || 0;

  // Let's get recent invoices
  const recentInvoices = await db`
    SELECT id, invoice_number, date, grand_total, payment_mode
    FROM invoices
    ORDER BY created_at DESC
    LIMIT 5
  `;

  return (
    <>
      <SplashScreen />
      <div className="container">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back! Here's the overview of your shop.</p>
          </div>
          <Link href="/invoices/new" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            <span>+ Create New Bill</span>
          </Link>
        </div>

        <div className="grid grid-cols-4 mb-6">
          <div className="card">
            <p>Today's Sales</p>
            <h2>₹ {Number(todaySales).toLocaleString('en-IN')}</h2>
          </div>
          <div className="card">
            <p>Gold Sold Today</p>
            <h2>{Number(todayGold).toFixed(3)} g</h2>
          </div>
          <div className="card">
            <p>This Month's Sales</p>
            <h2>₹ {Number(monthSales).toLocaleString('en-IN')}</h2>
          </div>
          <div className="card">
            <p>GST Collected (MTD)</p>
            <h2>₹ {Number(monthGst).toLocaleString('en-IN')}</h2>
          </div>
        </div>

        <div className="card mb-6" style={{ marginTop: '2.5rem' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="m-0">Recent Invoices</h3>
            <Link href="/reports" className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', textDecoration: 'none' }}>View All →</Link>
          </div>
          {recentInvoices.length === 0 ? (
            <p>No invoices generated yet. Create your first bill!</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Inv No.</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Payment Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((inv: any) => (
                    <tr key={inv.id}>
                      <td>{inv.invoice_number}</td>
                      <td>{new Date(inv.date).toLocaleDateString('en-IN')}</td>
                      <td className="font-bold">₹ {Number(inv.grand_total).toLocaleString('en-IN')}</td>
                      <td>{inv.payment_mode || 'Cash'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
