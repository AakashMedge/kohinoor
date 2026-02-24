'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ReportClient({ invoices }: { invoices: any[] }) {
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(new Set(invoices.map(inv => inv.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelectOne = (id: number) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) { 
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const downloadCSV = () => {
        if (selectedIds.size === 0) {
            alert("Please select at least one invoice to export.");
            return;
        }

        const selectedInvoices = invoices.filter(inv => selectedIds.has(inv.id));

        // Define CSV Headers exactly as a CA expects for Audit
        const headers = [
            "Invoice No",
            "Date",
            "Customer Name",
            "PAN Number",
            "Aadhaar Number",
            "HSN Code",
            "Taxable Value (Rs)",
            "CGST 1.5% (Rs)",
            "SGST 1.5% (Rs)",
            "Grand Total (Rs)",
            "Cash Paid (Rs)",
            "Cards Paid (Rs)",
            "Digital/UPI Paid (Rs)",
            "Advance Paid (Rs)"
        ];

        // Map data to rows
        const rows = selectedInvoices.map(inv => [
            inv.invoice_number,
            new Date(inv.date).toLocaleDateString('en-IN'),
            `"${inv.customer_name || ''}"`,
            inv.customer_pan || '',
            inv.customer_aadhaar || '',
            '7113', // Standard gold jewellery HSN
            Number(inv.total_amount || 0).toFixed(2),
            Number(inv.cgst || 0).toFixed(2),
            Number(inv.sgst || 0).toFixed(2),
            Number(inv.grand_total || 0).toFixed(2),
            Number(inv.cash_amount || 0).toFixed(2),
            Number(inv.cards_amount || 0).toFixed(2),
            Number(inv.digital_amount || 0).toFixed(2),
            Number(inv.advance_amount || 0).toFixed(2)
        ]);

        // Construct CSV string
        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.join(","))
        ].join("\n");

        // Create a Blob and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Kohinoor_CA_Export_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="flex justify-between items-center p-4 bg-white border-b">
                <h3 className="m-0">All Generated Invoices</h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span className="text-muted" style={{ fontWeight: 'bold' }}>Showing {invoices.length} results</span>
                    <button
                        type="button"
                        onClick={downloadCSV}
                        className="btn btn-primary"
                        style={{ padding: '0.4rem 1rem', fontSize: '14px', background: '#0284c7', color: '#fff', border: 'none', cursor: 'pointer', opacity: selectedIds.size > 0 ? 1 : 0.6 }}
                    >
                        📥 Download CA Report (CSV)
                    </button>
                </div>
            </div>

            {invoices.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <p>No invoices found matching these filters.</p>
                </div>
            ) : (
                <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                    <table className="table" style={{ margin: 0 }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>
                                <th style={{ width: '50px', textAlign: 'center' }}>
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={invoices.length > 0 && selectedIds.size === invoices.length}
                                        style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                                    />
                                </th>
                                <th style={{ color: '#0f172a' }}>Inv No.</th>
                                <th style={{ color: '#0f172a' }}>Date</th>
                                <th style={{ color: '#0f172a' }}>Customer</th>
                                <th style={{ color: '#0f172a' }}>Taxable</th>
                                <th style={{ color: '#0f172a', whiteSpace: 'nowrap' }}>Tax (CGST+SGST)</th>
                                <th style={{ color: '#0f172a' }}>Total</th>
                                <th style={{ color: '#0f172a' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((inv) => {
                                return (
                                    <tr key={inv.id} style={{ background: selectedIds.has(inv.id) ? '#f0f9ff' : 'transparent' }}>
                                        <td style={{ textAlign: 'center' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(inv.id)}
                                                onChange={() => handleSelectOne(inv.id)}
                                                style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                                            />
                                        </td>
                                        <td style={{ fontWeight: 'bold' }}>{inv.invoice_number}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{new Date(inv.date).toLocaleDateString('en-IN')}</td>
                                        <td>
                                            <div style={{ fontWeight: 'bold', color: '#334155' }}>{inv.customer_name}</div>
                                            {inv.customer_pan && <div style={{ fontSize: '11px', color: '#64748b' }}>PAN: {inv.customer_pan}</div>}
                                        </td>
                                        <td style={{ color: '#475569' }}>₹ {Number(inv.total_amount).toLocaleString('en-IN')}</td>
                                        <td style={{ color: '#475569' }}>₹ {(Number(inv.cgst) + Number(inv.sgst)).toLocaleString('en-IN')}</td>
                                        <td style={{ fontWeight: 'bold', fontSize: '15px' }}>₹ {Number(inv.grand_total).toLocaleString('en-IN')}</td>
                                        <td>
                                            <Link href={`/invoices/${inv.id}`} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px', textDecoration: 'none' }}>
                                                View
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
    );
}
