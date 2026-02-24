import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kohinoor - Digital Jewellery Billing SaaS',
  description: 'Fast, secure, and smart billing for modern jewellers across India.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav className="navbar">
          <div className="navbar-brand">
            KOHINOOR <span>Billing</span>
          </div>
          <div className="nav-links">
            <a href="/" className="nav-link active">Dashboard</a>
            <a href="/invoices/new" className="nav-link">New Bill</a>
            <a href="/reports" className="nav-link">Reports</a>
            <a href="/settings" className="nav-link">Settings</a>
          </div>
        </nav>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
