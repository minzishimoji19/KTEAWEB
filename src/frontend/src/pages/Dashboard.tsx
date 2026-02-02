import React, { useEffect, useState } from 'react';
import { getDashboardSummary, getDashboardOps, getRevenueSeries } from '../api/services';
import { DollarSign, Ticket, Users, Award, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const [summary, setSummary] = useState<any>(null);
    const [ops, setOps] = useState<any>(null);
    const [series, setSeries] = useState<any[]>([]);
    const [dateRange, setDateRange] = useState('30'); // days

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Calc dates
                const to = new Date();
                const from = new Date();
                from.setDate(from.getDate() - Number(dateRange));

                const [sumData, opsData, seriesData] = await Promise.all([
                    getDashboardSummary(from.toISOString(), to.toISOString()),
                    getDashboardOps(),
                    getRevenueSeries(from.toISOString(), to.toISOString())
                ]);

                setSummary(sumData);
                setOps(opsData);
                setSeries(seriesData);
            } catch (err) {
                console.error("Dashboard load failed", err);
            }
        };
        fetchData();
    }, [dateRange]);

    if (!summary) return <div className="p-8">Loading Dashboard...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Tổng quan Kinh doanh</h2>
                <select
                    className="border rounded-lg p-2 bg-white text-sm"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                >
                    <option value="7">7 ngày qua</option>
                    <option value="30">30 ngày qua</option>
                    <option value="90">3 tháng qua</option>
                </select>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-5 gap-4">
                <KpiCard title="Doanh thu Gộp" value={summary.gross_revenue} icon={<DollarSign />} color="bg-blue-50 text-blue-600" isCurrency />
                <KpiCard title="Doanh thu Ròng (Net)" value={summary.net_revenue} icon={<TrendingUp />} color="bg-green-50 text-green-600" isCurrency />
                <KpiCard title="Vé đã bán" value={summary.tickets_sold} icon={<Ticket />} color="bg-orange-50 text-orange-600" />
                <KpiCard title="Khách mới" value={summary.new_customers} icon={<Users />} color="bg-purple-50 text-purple-600" />
                <KpiCard title="Điểm lưu hành" value={summary.points_circulating} icon={<Award />} color="bg-yellow-50 text-yellow-600" />
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Main Chart */}
                <div className="col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200 min-h-[400px]">
                    <h3 className="font-bold text-slate-800 mb-4">Biểu đồ Doanh thu (Ròng)</h3>
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={series}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    fontSize={12}
                                />
                                <YAxis
                                    fontSize={12}
                                    tickFormatter={(val) => `${val / 1000}k`}
                                />
                                <Tooltip
                                    formatter={(val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0)}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                />
                                <Line type="monotone" dataKey="net" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 6 }} name="DT Ròng" />
                                <Line type="monotone" dataKey="gross" stroke="#94a3b8" strokeWidth={2} dot={false} strokeDasharray="5 5" name="DT Gộp" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Ops Widgets */}
                <div className="col-span-1 space-y-6">
                    {/* Pending Tx */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-slate-800 mb-3 flex items-center justify-between">
                            <span>Chờ xử lý</span>
                            <Link to="/transactions/pending" className="text-xs text-blue-600 hover:underline">Xem tất cả</Link>
                        </h3>
                        <div className="space-y-3">
                            {ops?.pending_transactions?.length > 0 ? ops.pending_transactions.map((t: any) => (
                                <div key={t.id} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                                    <div>
                                        <div className="font-medium text-slate-900">{t.customer.name}</div>
                                        <div className="text-xs text-gray-500">{new Date(t.purchaseDate).toLocaleDateString()}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold">{t.amountGross.toLocaleString()}</div>
                                        <Link to="/transactions/pending" className="text-xs text-blue-600">Duyệt</Link>
                                    </div>
                                </div>
                            )) : <div className="text-sm text-gray-500 text-center py-4">Đã xử lý hết!</div>}
                        </div>
                    </div>

                    {/* Expiring Vouchers */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <AlertTriangle size={16} className="text-orange-500" />
                            Voucher hết hạn (7 ngày)
                        </h3>
                        <div className="space-y-3">
                            {ops?.expiring_vouchers?.length > 0 ? ops.expiring_vouchers.map((v: any) => (
                                <div key={v.id} className="flex justify-between items-center p-2 bg-orange-50/50 rounded text-sm border border-orange-100">
                                    <div>
                                        <div className="font-mono font-bold text-slate-900">{v.code}</div>
                                        <div className="text-xs text-orange-600 flex items-center gap-1">
                                            <Clock size={10} /> {new Date(v.expiryDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="text-xs font-bold bg-white px-2 py-1 rounded border">
                                        {v.discountType === 'PERCENT' ? `${v.discountValue}%` : `${v.discountValue / 1000}k`}
                                    </div>
                                </div>
                            )) : <div className="text-sm text-gray-500 text-center py-4">Không có cảnh báo.</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const KpiCard = ({ title, value, icon, color, isCurrency }: any) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
            <span className="text-gray-500 text-sm font-medium">{title}</span>
        </div>
        <div className="text-2xl font-bold text-slate-900">
            {isCurrency ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value) : value.toLocaleString()}
        </div>
    </div>
);
