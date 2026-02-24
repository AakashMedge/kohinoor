'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { TrendingUp, PieChart as PieIcon, CreditCard, Banknote } from 'lucide-react';
import {
    Bar, BarChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

interface ChartProps {
    barData: any[];
    pieData: any[];
    currentFilter: string;
}

const COLORS = ['#d4af37', '#0f172a', '#64748b', '#e2e8f0'];

export default function InteractiveCharts({ barData, pieData, currentFilter }: ChartProps) {
    const router = useRouter();

    const filters = [
        { id: 'today', label: 'Today' },
        { id: 'week', label: 'Week' },
        { id: 'month', label: 'Month' },
        { id: 'sixMonth', label: '6 Months' },
        { id: 'year', label: 'Year' },
        { id: 'all', label: 'All Time' },
    ];

    const setFilter = (id: string) => {
        router.push(`/?filter=${id}`, { scroll: false });
    };

    // Provide default empty states if no data and explicitly cast Postgres SQL Strings to Javascript Numbers for Recharts engine
    const safeBarData = barData && barData.length > 0
        ? barData.map(d => ({ ...d, total: Number(d.total) }))
        : [{ label: 'No Data', total: 0 }];

    const safePieData = pieData && pieData.length > 0
        ? pieData.map(d => ({ ...d, value: Number(d.value) }))
        : [{ payment_mode: 'No Data', value: 1 }];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '24px', marginBottom: '2rem' }}>
            {/* Bar Chart Panel */}
            <div style={{ padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div>
                        <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px' }}>Revenue Overview</h3>
                        <p className="text-muted" style={{ margin: '4px 0 0 0', fontSize: '14px' }}>Gross sales volume by selected period.</p>
                    </div>
                    {/* Pill Filter Toggle */}
                    <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px', gap: '4px' }}>
                        {filters.map(f => (
                            <button
                                key={f.id}
                                onClick={() => setFilter(f.id)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    background: currentFilter === f.id ? '#fff' : 'transparent',
                                    color: currentFilter === f.id ? '#0f172a' : '#64748b',
                                    boxShadow: currentFilter === f.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                                }}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ width: '100%', minHeight: '300px', flexGrow: 1 }}>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={safeBarData} margin={{ top: 20, right: 10, left: -10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="label"
                                axisLine={{ stroke: '#e2e8f0' }}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                dy={10}
                            />
                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                                itemStyle={{ color: '#0f172a' }}
                                formatter={(value: any) => [`₹ ${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                                labelStyle={{ color: '#64748b', marginBottom: '4px', fontWeight: 'normal' }}
                            />
                            <Bar
                                dataKey="total"
                                fill="#0f172a"
                                radius={[6, 6, 0, 0]}
                                barSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>
                    Trending analysis active <TrendingUp size={16} color="#d4af37" />
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                    Showing total revenue for the period: {filters.find(f => f.id === currentFilter)?.label}
                </div>
            </div>

            {/* Pie Chart Panel */}
            <div style={{ padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px' }}>Payment Distribution</h3>
                    <p className="text-muted" style={{ margin: '4px 0 0 0', fontSize: '14px' }}>Revenue breakdown by method.</p>
                </div>

                <div style={{ width: '100%', minHeight: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart margin={{ top: 20, right: 0, bottom: 20, left: 0 }}>
                            <Tooltip
                                formatter={(value: any) => [`₹ ${Number(value).toLocaleString('en-IN')}`, 'Amount']}
                                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            />
                            <Pie
                                data={safePieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={110}
                                paddingAngle={2}
                                dataKey="value"
                                nameKey="payment_mode"
                                stroke="none"
                            >
                                {safePieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                formatter={(value) => <span style={{ color: '#0f172a', fontSize: '13px', fontWeight: '500', marginRight: '16px' }}>{value || 'Cash'}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div style={{ marginTop: '1rem', background: '#f8fafc', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <CreditCard size={20} color="#64748b" />
                    <div>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>Liquidity Overview</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>Real-time payment split</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
