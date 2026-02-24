import db from '@/lib/db';
import { saveSettings } from '@/app/actions/settings';

export const dynamic = 'force-dynamic';

export default async function SettingsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { success } = await searchParams;
    const SHOP_ID = 1;
    const shops = await db`SELECT * FROM shops WHERE id = ${SHOP_ID}`;
    const shop = shops.length > 0 ? shops[0] : null;

    return (
        <div className="container" style={{ maxWidth: '800px', paddingBottom: '100px' }}>
            <h1 className="mb-6 border-b pb-4">Shop Settings</h1>

            {success === '1' && (
                <div style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#047857', padding: '12px 16px', borderRadius: '6px', marginBottom: '20px', fontWeight: 'bold' }}>
                    ✅ Shop Profile Settings Saved Successfully!
                </div>
            )}

            <form action={saveSettings} className="card">
                <div className="grid grid-cols-2 gap-4">
                    <div className="form-group mb-4" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label" style={{ fontWeight: 'bold' }}>Shop Name</label>
                        <input type="text" name="name" defaultValue={shop?.name || ''} required className="form-control" style={{ fontSize: '18px', padding: '12px' }} />
                        <small style={{ color: '#64748b' }}>Appears as the big logo font on top of the print invoice.</small>
                    </div>

                    <div className="form-group mb-4" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Tagline</label>
                        <input type="text" name="tagline" defaultValue={shop?.tagline || ''} className="form-control" />
                    </div>

                    <div className="form-group mb-4">
                        <label className="form-label">GSTIN Number</label>
                        <input type="text" name="gstin" defaultValue={shop?.gstin || ''} className="form-control" />
                    </div>

                    <div className="form-group mb-4">
                        <label className="form-label">Mobile Number</label>
                        <input type="text" name="phone" defaultValue={shop?.phone || ''} className="form-control" />
                    </div>

                    <div className="form-group mb-4">
                        <label className="form-label">Email Address</label>
                        <input type="email" name="email" defaultValue={shop?.email || ''} className="form-control" />
                    </div>
                </div>

                <div className="form-group mb-4">
                    <label className="form-label">Full Address</label>
                    <textarea name="address" defaultValue={shop?.address || ''} className="form-control" rows={2} />
                </div>

                <div className="border-t my-6 pt-6">
                    <h3 className="mb-4">Legal & Banking Info</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group mb-4">
                            <label className="form-label">BIS License No.</label>
                            <input type="text" name="bis_license" defaultValue={shop?.bis_license || ''} className="form-control" />
                        </div>
                        <div className="form-group mb-4">
                            <label className="form-label">CIN Number</label>
                            <input type="text" name="cin_number" defaultValue={shop?.cin_number || ''} className="form-control" />
                        </div>
                    </div>

                    <div className="form-group mb-4">
                        <label className="form-label">Bank Details (As it prints on Bottom Left)</label>
                        <textarea
                            name="bank_details"
                            defaultValue={shop?.bank_details || ''}
                            className="form-control"
                            rows={5}
                            style={{ fontFamily: 'monospace' }}
                            placeholder="A/C Name: Your Name&#10;Bank Name: Your Bank&#10;Account No.: Your Acct&#10;Branch: Your Branch&#10;IFSC Code: Your Code"
                        />
                    </div>
                </div>

                <div className="flex justify-end border-t pt-4">
                    <button type="submit" className="btn btn-primary" style={{ fontSize: '16px', padding: '12px 24px' }}>
                        💾 Save Profile Settings
                    </button>
                </div>
            </form>
        </div>
    );
}
