'use client';

import { useState } from 'react';
import { createInvoice } from '@/app/actions/invoices';

export default function NewInvoicePage() {
    // Starting with 1 active row by default
    const [items, setItems] = useState([
        { id: 1, description: 'CHAIN', huid: '8LNDCZ', hsn: '7113', purity: '916', gross_weight: '10.400', net_weight: '10.400', rate: '9008.59', amount: 93689.34 }
    ]);

    const globalGoldRate = 8400; // default example rate

    const addItem = () => {
        setItems([...items, { id: Date.now(), description: '', huid: '', hsn: '7113', purity: '916', gross_weight: '', net_weight: '', rate: '', amount: 0 }]);
    };

    const updateItem = (id: number, field: string, value: string) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };
                // If weight or rate changes, compute amount
                if (field === 'net_weight' || field === 'rate') {
                    const wt = Number(updated.net_weight || 0);
                    const rt = Number(updated.rate || 0);
                    updated.amount = Number((wt * rt).toFixed(2));
                }
                return updated;
            }
            return item;
        }));
    };

    const removeItem = (id: number) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const totalItemAmount = items.reduce((acc, item) => acc + item.amount, 0);
    const totalCgst = Number((totalItemAmount * 0.015).toFixed(2));
    const totalSgst = Number((totalItemAmount * 0.015).toFixed(2));
    const rawTotal = totalItemAmount + totalCgst + totalSgst;
    const grandTotal = Math.round(rawTotal);

    // Payment splits
    const [payments, setPayments] = useState({ advance: 0, cards: 0, cash: 0, digital: grandTotal });
    const handlePayment = (field: string, val: string) => {
        setPayments({ ...payments, [field]: Number(val) });
    };

    const totalPaid = payments.advance + payments.cards + payments.cash + payments.digital;
    const balance = grandTotal - totalPaid;

    const todayStr = new Date().toISOString().split('T')[0];

    return (
        <div className="container" style={{ maxWidth: '1400px' }}>
            <h1 className="mb-6">Create New Tax Invoice</h1>

            <form action={createInvoice}>

                {/* 1. Meta Details Box (Customer + Invoice Info combined) */}
                <div className="card mb-6" style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                    <div className="grid grid-cols-2 gap-6">
                        {/* Box Left: Customer Details */}
                        <div>
                            <h3 className="mb-4 text-primary">Customer Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group mb-2">
                                    <label className="form-label">Full Name</label>
                                    <input type="text" name="customerName" required className="form-control" placeholder="E.g. ROSHAN RAM" />
                                </div>
                                <div className="form-group mb-2">
                                    <label className="form-label">Mobile Number</label>
                                    <input type="tel" name="customerPhone" required className="form-control" placeholder="E.g. 9082530705" />
                                </div>
                                <div className="form-group mb-2" style={{ gridColumn: 'span 2' }}>
                                    <label className="form-label">Address</label>
                                    <input type="text" name="customerAddress" className="form-control" placeholder="E.g. Maheshwari Nagar Midc 400093" />
                                </div>
                                <div className="form-group mb-0">
                                    <label className="form-label">PAN No. / GSTIN</label>
                                    <input type="text" name="customerPan" className="form-control" placeholder="Customer PAN" />
                                </div>
                                <div className="form-group mb-0">
                                    <label className="form-label">Aadhaar No.</label>
                                    <input type="text" name="customerAadhaar" className="form-control" placeholder="Customer Aadhaar" />
                                </div>
                                <div className="form-group mb-0">
                                    <label className="form-label">Date of Birth</label>
                                    <input type="date" name="customerDob" className="form-control" />
                                </div>
                                <div className="form-group mb-0">
                                    <label className="form-label">Anniversary</label>
                                    <input type="date" name="customerAnniversary" className="form-control" />
                                </div>
                            </div>
                        </div>

                        {/* Box Right: Invoice Details */}
                        <div>
                            <h3 className="mb-4 text-primary">Invoice Settings</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group mb-2">
                                    <label className="form-label">Invoice Date</label>
                                    <input type="date" name="date" required defaultValue={todayStr} className="form-control" />
                                </div>
                                <div className="form-group mb-2">
                                    <label className="form-label">Global Gold Rate (₹)</label>
                                    <input type="number" name="goldRate" defaultValue={globalGoldRate} className="form-control" style={{ fontWeight: 'bold' }} />
                                </div>
                                <div className="form-group mb-0" style={{ gridColumn: 'span 2' }}>
                                    <label className="form-label">Internal Reference Note / Salesperson</label>
                                    <input type="text" name="reference" className="form-control" placeholder="e.g. Sold by Rahul" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Item details spreadsheet style */}
                <div className="card mb-6" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="flex justify-between items-center bg-white p-4 border-b">
                        <h3 className="m-0">Jewellery Items</h3>
                        <button type="button" onClick={addItem} className="btn btn-secondary">+ Add Row</button>
                    </div>

                    <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                        <table className="table" style={{ minWidth: '100%', tableLayout: 'fixed' }}>
                            <thead style={{ background: '#f1f5f9', color: '#0f172a', borderBottom: '1px solid #cbd5e1' }}>
                                <tr>
                                    <th style={{ width: '40px' }}>#</th>
                                    <th style={{ width: '250px' }}>Description</th>
                                    <th style={{ width: '120px' }}>HUID</th>
                                    <th style={{ width: '80px' }}>HSN</th>
                                    <th style={{ width: '80px' }}>Purity</th>
                                    <th style={{ width: '100px' }}>Grs Wt</th>
                                    <th style={{ width: '100px' }}>Net Wt</th>
                                    <th style={{ width: '120px' }}>Rate/Gm (₹)</th>
                                    <th style={{ width: '130px', textAlign: 'right' }}>Amount (₹)</th>
                                    <th style={{ width: '50px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={item.id}>
                                        <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{index + 1}</td>
                                        <td style={{ padding: '0.25rem' }}>
                                            <input type="text" className="form-control" style={{ height: '35px' }} value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} />
                                        </td>
                                        <td style={{ padding: '0.25rem' }}>
                                            <input type="text" className="form-control" style={{ height: '35px' }} value={item.huid} onChange={(e) => updateItem(item.id, 'huid', e.target.value)} />
                                        </td>
                                        <td style={{ padding: '0.25rem' }}>
                                            <input type="text" className="form-control" style={{ height: '35px' }} value={item.hsn} onChange={(e) => updateItem(item.id, 'hsn', e.target.value)} />
                                        </td>
                                        <td style={{ padding: '0.25rem' }}>
                                            <input type="text" className="form-control" style={{ height: '35px' }} value={item.purity} onChange={(e) => updateItem(item.id, 'purity', e.target.value)} />
                                        </td>
                                        <td style={{ padding: '0.25rem' }}>
                                            <input type="number" step="0.001" className="form-control" style={{ height: '35px' }} value={item.gross_weight} onChange={(e) => updateItem(item.id, 'gross_weight', e.target.value)} />
                                        </td>
                                        <td style={{ padding: '0.25rem' }}>
                                            <input type="number" step="0.001" className="form-control" style={{ height: '35px' }} value={item.net_weight} onChange={(e) => updateItem(item.id, 'net_weight', e.target.value)} />
                                        </td>
                                        <td style={{ padding: '0.25rem' }}>
                                            <input type="number" step="0.01" className="form-control" style={{ height: '35px' }} value={item.rate} onChange={(e) => updateItem(item.id, 'rate', e.target.value)} />
                                        </td>
                                        <td className="font-bold text-right" style={{ verticalAlign: 'middle' }}>
                                            {item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td style={{ verticalAlign: 'middle', textAlign: 'center', padding: '0.25rem' }}>
                                            <button type="button" onClick={() => removeItem(item.id)} className="btn btn-danger" style={{ padding: '0 0.5rem', height: '35px' }} disabled={items.length === 1}>✕</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <input type="hidden" name="itemsData" value={JSON.stringify(items)} />

                {/* 3. Bottom Summary Split Layout */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                    {/* Left: Payment Types */}
                    <div className="card">
                        <h3 className="mb-4">Split Payment Engine</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1rem' }}>
                            <div className="flex justify-between items-center" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                                <span>Advance</span>
                                <input type="number" name="advance" className="form-control" style={{ width: '120px', textAlign: 'right' }} value={payments.advance} onChange={(e) => handlePayment('advance', e.target.value)} />
                            </div>
                            <div className="flex justify-between items-center" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                                <span>Cards</span>
                                <input type="number" name="cards" className="form-control" style={{ width: '120px', textAlign: 'right' }} value={payments.cards} onChange={(e) => handlePayment('cards', e.target.value)} />
                            </div>
                            <div className="flex justify-between items-center" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                                <span>Cash</span>
                                <input type="number" name="cash" className="form-control" style={{ width: '120px', textAlign: 'right' }} value={payments.cash} onChange={(e) => handlePayment('cash', e.target.value)} />
                            </div>
                            <div className="flex justify-between items-center" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                                <span>Digital (UPI)</span>
                                <input type="number" name="digital" className="form-control" style={{ width: '120px', textAlign: 'right' }} value={payments.digital} onChange={(e) => handlePayment('digital', e.target.value)} />
                            </div>
                            <div className="flex justify-between items-center mt-2" style={{ gridColumn: 'span 2' }}>
                                <span className={balance < 0 ? "text-danger" : balance > 0 ? "text-danger" : "text-success"} style={{ fontWeight: 'bold' }}>
                                    BALANCE DUE
                                </span>
                                <h3 className={balance !== 0 ? "text-danger m-0" : "text-success m-0"}>
                                    ₹ {balance.toLocaleString('en-IN')}
                                </h3>
                                <input type="hidden" name="balance" value={balance} />
                            </div>
                        </div>
                    </div>

                    {/* Right: Master Math */}
                    <div className="card" style={{ background: '#f8fafc' }}>
                        <div className="flex justify-between mb-2">
                            <span>SUB TOTAL</span>
                            <strong>₹ {totalItemAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span>CGST (1.5%)</span>
                            <strong>₹ {totalCgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span>SGST (1.5%)</span>
                            <strong>₹ {totalSgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                        </div>
                        <div className="flex justify-between mb-4 border-b border-gray-300 pb-2">
                            <span>ROUND OFF</span>
                            <strong>₹ {(grandTotal - rawTotal).toFixed(2)}</strong>
                        </div>
                        <div className="flex justify-between items-center">
                            <h4 className="text-muted m-0">GRAND TOTAL</h4>
                            <h1 className="text-primary m-0" style={{ fontSize: '2.5rem' }}>
                                ₹ {grandTotal.toLocaleString('en-IN')}
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="text-right pb-10">
                    <button type="submit" className="btn btn-primary text-xl px-10 py-3">
                        Save & Record Bill
                    </button>
                </div>
            </form>
        </div>
    );
}
