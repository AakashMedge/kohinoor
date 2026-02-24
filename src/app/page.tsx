import Link from 'next/link';
import db from '../lib/db';
import { IndianRupee, Scale, TrendingUp, Landmark } from 'lucide-react';

import SplashScreen from '@/components/SplashScreen';
import InteractiveCharts from '@/components/InteractiveCharts';

// Force dynamic since dashboard should not be cached
export const dynamic = 'force-dynamic';

export default async function Dashboard(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const filter = typeof searchParams.filter === 'string' ? searchParams.filter : 'sixMonth';
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

  // Fetch Special Occasions for CRM Marketing
  const currentMonthDay = new Date().toISOString().substring(5, 10); // Format: MM-DD
  const occasions = await db`
    SELECT id, name, phone, dob, anniversary 
    FROM customers 
    WHERE to_char(dob, 'MM-DD') = ${currentMonthDay} 
       OR to_char(anniversary, 'MM-DD') = ${currentMonthDay}
  `;

  // Fetch chart data based on filter
  let barData: any[] = [];
  let pieData: any[] = [];

  if (filter === 'today') {
    barData = await db`SELECT to_char(date, 'Mon DD') as label, SUM(grand_total) as total FROM invoices WHERE date = CURRENT_DATE GROUP BY date ORDER BY date ASC`;
    pieData = await db`SELECT payment_mode, SUM(grand_total) as value FROM invoices WHERE date = CURRENT_DATE GROUP BY payment_mode`;
  } else if (filter === 'week') {
    barData = await db`SELECT to_char(date, 'Mon DD') as label, SUM(grand_total) as total FROM invoices WHERE date >= CURRENT_DATE - INTERVAL '6 days' GROUP BY date ORDER BY date ASC`;
    pieData = await db`SELECT payment_mode, SUM(grand_total) as value FROM invoices WHERE date >= CURRENT_DATE - INTERVAL '6 days' GROUP BY payment_mode`;
  } else if (filter === 'month') {
    barData = await db`SELECT to_char(date, 'Mon DD') as label, SUM(grand_total) as total FROM invoices WHERE date >= CURRENT_DATE - INTERVAL '1 month' GROUP BY date ORDER BY date ASC`;
    pieData = await db`SELECT payment_mode, SUM(grand_total) as value FROM invoices WHERE date >= CURRENT_DATE - INTERVAL '1 month' GROUP BY payment_mode`;
  } else if (filter === 'sixMonth') {
    barData = await db`SELECT to_char(date_trunc('month', date), 'Mon YYYY') as label, SUM(grand_total) as total FROM invoices WHERE date >= CURRENT_DATE - INTERVAL '6 months' GROUP BY date_trunc('month', date) ORDER BY date_trunc('month', date) ASC`;
    pieData = await db`SELECT payment_mode, SUM(grand_total) as value FROM invoices WHERE date >= CURRENT_DATE - INTERVAL '6 months' GROUP BY payment_mode`;
  } else if (filter === 'year') {
    barData = await db`SELECT to_char(date_trunc('month', date), 'Mon YYYY') as label, SUM(grand_total) as total FROM invoices WHERE date >= CURRENT_DATE - INTERVAL '1 year' GROUP BY date_trunc('month', date) ORDER BY date_trunc('month', date) ASC`;
    pieData = await db`SELECT payment_mode, SUM(grand_total) as value FROM invoices WHERE date >= CURRENT_DATE - INTERVAL '1 year' GROUP BY payment_mode`;
  } else {
    barData = await db`SELECT to_char(date_trunc('year', date), 'YYYY') as label, SUM(grand_total) as total FROM invoices GROUP BY date_trunc('year', date) ORDER BY date_trunc('year', date) ASC`;
    pieData = await db`SELECT payment_mode, SUM(grand_total) as value FROM invoices GROUP BY payment_mode`;
  }

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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '2rem' }}>
          {/* Card 1 */}
          <div style={{ padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '500', margin: 0, color: '#0f172a' }}>Today's Sales</h3>
              <IndianRupee size={16} color="#64748b" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: '4px 0' }}>
              ₹ {Number(todaySales).toLocaleString('en-IN')}
            </div>
          </div>

          {/* Card 2 */}
          <div style={{ padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '500', margin: 0, color: '#0f172a' }}>Gold Sold Today</h3>
              <Scale size={16} color="#64748b" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: '4px 0' }}>
              {Number(todayGold).toFixed(3)} <span style={{ fontSize: '16px', color: '#64748b' }}>g</span>
            </div>
          </div>

          {/* Card 3 */}
          <div style={{ padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '500', margin: 0, color: '#0f172a' }}>This Month's Sales</h3>
              <TrendingUp size={16} color="#64748b" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: '4px 0' }}>
              ₹ {Number(monthSales).toLocaleString('en-IN')}
            </div>
          </div>

          {/* Card 4 */}
          <div style={{ padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '500', margin: 0, color: '#0f172a' }}>GST Collected (MTD)</h3>
              <Landmark size={16} color="#64748b" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: '4px 0' }}>
              ₹ {Number(monthGst).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Central Analytical Engine */}
        <InteractiveCharts barData={barData} pieData={pieData} currentFilter={filter} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          <div className="card" style={{ gridColumn: 'span 2' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="m-0">Recent Invoices</h3>
              <Link href="/reports" className="text-primary font-bold" style={{ textDecoration: 'none' }}>View Ledgers →</Link>
            </div>
            {recentInvoices.length === 0 ? (
              <p>No invoices created yet.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ paddingLeft: '1rem' }}>Inv No.</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Method</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((inv: any) => (
                    <tr key={inv.id} style={{ transition: 'background 0.2s ease', cursor: 'pointer' }} className="hover:bg-slate-50">
                      <td style={{ paddingLeft: '1rem' }}>
                        <Link href={`/invoices/${inv.id}`} className="text-primary font-bold" style={{ textDecoration: 'none' }}>
                          #{inv.invoice_number}
                        </Link>
                      </td>
                      <td>{new Date(inv.date).toLocaleDateString('en-IN')}</td>
                      <td className="font-bold">₹ {Number(inv.grand_total).toLocaleString('en-IN')}</td>
                      <td>
                        <span style={{
                          padding: '4px 10px',
                          background: inv.payment_mode === 'Cash' ? '#dcfce7' : inv.payment_mode === 'UPI' ? '#ede9fe' : '#e0f2fe',
                          color: inv.payment_mode === 'Cash' ? '#166534' : inv.payment_mode === 'UPI' ? '#5b21b6' : '#075985',
                          borderRadius: '16px',
                          fontWeight: '500',
                          fontSize: '12px'
                        }}>
                          {inv.payment_mode || 'Cash'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card">
            <h3 className="mb-4 text-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🎉</span> Today's Occasions
            </h3>
            {occasions.length === 0 ? (
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                <p className="text-muted m-0">No birthdays or anniversaries today.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {occasions.map((occ: any) => {
                  const isBirthday = occ.dob && occ.dob.toISOString().substring(5, 10) === currentMonthDay;
                  const typeLabel = isBirthday ? 'Birthday 🎂' : 'Anniversary 🥂';

                  const message = `Dear ${occ.name}! Kohinoor Jewellers wishes you a very Happy ${isBirthday ? 'Birthday' : 'Anniversary'}! Make this day golden. Visit us this week for an exclusive 10% off on making charges just for you!`;
                  let cleanPhone = occ.phone ? occ.phone.replace(/\D/g, '') : '';
                  if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
                  if (cleanPhone && cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
                  const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;

                  return (
                    <div key={`occ-${occ.id}`} style={{ padding: '1rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px' }}>
                      <div className="flex justify-between items-center mb-2">
                        <strong style={{ color: '#92400e' }}>{occ.name}</strong>
                        <span style={{ fontSize: '12px', background: '#fcd34d', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', color: '#92400e' }}>{typeLabel}</span>
                      </div>
                      <p className="text-muted m-0 mb-2" style={{ fontSize: '12px' }}>{occ.phone}</p>
                      <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn" style={{ background: '#25D366', color: '#fff', width: '100%', padding: '0.4rem', fontSize: '12px', textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                        <span>Send Offer via WhatsApp</span>
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
