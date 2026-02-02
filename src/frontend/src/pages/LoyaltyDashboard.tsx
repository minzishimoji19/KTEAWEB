import React, { useEffect, useState } from 'react';
import { Award, Zap, Settings, TrendingUp, AlertCircle, Gift, Crown } from 'lucide-react';
import { getLoyaltyRules, updateLoyaltyRules, getTopCustomers, type PointRule, type TopCustomer } from '../api/services';
import toast from 'react-hot-toast';
import RedeemModal from '../components/RedeemModal';

export default function LoyaltyDashboard() {
    const [rule, setRule] = useState<PointRule | null>(null);
    const [newRule, setNewRule] = useState<Partial<PointRule>>({});
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Top Customers State
    const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
    const [loadingTop, setLoadingTop] = useState(false);

    // Redeem Modal
    const [isRedeemOpen, setIsRedeemOpen] = useState(false);

    useEffect(() => {
        fetchRules();
        fetchTopCustomers();
    }, []);

    const fetchRules = async () => {
        try {
            const data = await getLoyaltyRules();
            setRule(data);
            setNewRule(data); // Pre-fill form
        } catch (err) {
            console.error("Failed to fetch rules", err);
            toast.error("Failed to load loyalty rules");
        }
    };

    const fetchTopCustomers = async () => {
        setLoadingTop(true);
        try {
            const data = await getTopCustomers(10);
            setTopCustomers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingTop(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateLoyaltyRules(newRule);
            await fetchRules();
            setIsEditing(false);
            toast.success("Rules updated successfully. New transactions will use these rules.");
        } catch (err) {
            toast.error("Failed to update rules");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Award className="text-violet-600" />
                    Cấu hình & Báo cáo Tích điểm
                </h2>
                <button
                    onClick={() => setIsRedeemOpen(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold shadow-sm"
                >
                    <Gift size={20} />
                    Đổi Điểm Thưởng
                </button>
            </div>

            {/* Redeem Modal */}
            <RedeemModal
                isOpen={isRedeemOpen}
                onClose={() => setIsRedeemOpen(false)}
                onSuccess={() => fetchTopCustomers()} // Refresh points/list after redeem
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats Cards ... kept same ... */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><TrendingUp size={20} /></div>
                        <h3 className="text-gray-500 font-medium text-sm text-transform uppercase">Điểm đã cấp</h3>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">12,450</p>
                    <p className="text-xs text-green-600 font-medium">+15% tháng này</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Zap size={20} /></div>
                        <h3 className="text-gray-500 font-medium text-sm text-transform uppercase">Điểm đã đổi</h3>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">3,200</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Award size={20} /></div>
                        <h3 className="text-gray-500 font-medium text-sm text-transform uppercase">Chờ nâng hạng</h3>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">5</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Customers Widget */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Crown size={18} className="text-yellow-500" />
                            Top Khách hàng Thân thiết (12 Tháng)
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-gray-500 bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3">Khách hàng</th>
                                    <th className="px-6 py-3">Hạng</th>
                                    <th className="px-6 py-3 text-right">Chi tiêu Net</th>
                                    <th className="px-6 py-3 text-center">Giao dịch</th>
                                    <th className="px-6 py-3 text-right">Điểm hiện có</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loadingTop ? (
                                    <tr><td colSpan={5} className="text-center py-8">Đang tải...</td></tr>
                                ) : topCustomers.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-8">Chưa có dữ liệu</td></tr>
                                ) : (
                                    topCustomers.map((c, idx) => (
                                        <tr key={c.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                        idx === 1 ? 'bg-gray-200 text-gray-700' :
                                                            idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'
                                                        }`}>
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-slate-900">{c.name}</div>
                                                        <div className="text-xs text-gray-500">{c.phone}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${c.tier === 'DIAMOND' ? 'bg-cyan-100 text-cyan-700' :
                                                    c.tier === 'GOLD' ? 'bg-yellow-100 text-yellow-700' :
                                                        c.tier === 'SILVER' ? 'bg-gray-200 text-gray-700' : 'bg-orange-50 text-orange-800'
                                                    }`}>
                                                    {c.tier}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium">{c.netSpend.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-center">{c.transactionsCount} <span className="text-gray-400 text-xs">({c.tickets} vé)</span></td>
                                            <td className="px-6 py-4 text-right font-bold text-orange-600">{c.pointsAvailable.toLocaleString()}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Rule Config Section - Moved to smaller column */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Settings size={18} />
                            Cấu hình
                        </h3>
                        {!isEditing && (
                            <button onClick={() => setIsEditing(true)} className="text-xs text-blue-600 font-medium hover:underline">
                                Sửa
                            </button>
                        )}
                    </div>
                    {/* ... form content ... */}

                    <div className="p-6">
                        {rule ? (
                            <form onSubmit={handleSave} className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị Quy đổi (VND)</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                disabled={!isEditing}
                                                type="number"
                                                className="border rounded p-2 w-full disabled:bg-gray-50 disabled:text-gray-500"
                                                value={newRule.conversionUnit}
                                                onChange={e => setNewRule({ ...newRule, conversionUnit: Number(e.target.value) })}
                                            />
                                            <span className="text-sm text-gray-400">= 1 Điểm</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">Giá trị cơ bản để tạo 1 điểm thô.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Hết hạn điểm (Tháng)</label>
                                        <input
                                            disabled={!isEditing}
                                            type="number"
                                            className="border rounded p-2 w-full disabled:bg-gray-50 disabled:text-gray-500"
                                            value={newRule.pointsExpiryMonths}
                                            onChange={e => setNewRule({ ...newRule, pointsExpiryMonths: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-bold text-gray-900 text-sm">Hệ số nhân</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Hệ số Vé</label>
                                            <input
                                                disabled={!isEditing}
                                                type="number" step="0.01"
                                                className="border rounded p-2 w-full disabled:bg-gray-50 disabled:text-gray-500"
                                                value={newRule.ticketMultiplier}
                                                onChange={e => setNewRule({ ...newRule, ticketMultiplier: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Hệ số Combo</label>
                                            <input
                                                disabled={!isEditing}
                                                type="number" step="0.01"
                                                className="border rounded p-2 w-full disabled:bg-gray-50 disabled:text-gray-500"
                                                value={newRule.comboMultiplier}
                                                onChange={e => setNewRule({ ...newRule, comboMultiplier: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Thưởng App/Web</label>
                                        <input
                                            disabled={!isEditing}
                                            type="number" step="0.01"
                                            className="border rounded p-2 w-full disabled:bg-gray-50 disabled:text-gray-500"
                                            value={newRule.appWebBonus}
                                            onChange={e => setNewRule({ ...newRule, appWebBonus: Number(e.target.value) })}
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Hệ số thưởng thêm cho kênh online.</p>
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="col-span-2 flex justify-end items-center gap-4 border-t pt-4 border-gray-100">
                                        <div className="flex items-center gap-2 text-orange-600 text-xs bg-orange-50 px-3 py-2 rounded">
                                            <AlertCircle size={14} />
                                            Cảnh báo: Thay đổi chỉ áp dụng cho các giao dịch trong tương lai.
                                        </div>
                                        <button type="button" onClick={() => { setIsEditing(false); setNewRule(rule); }} className="text-gray-600 hover:bg-gray-100 px-4 py-2 rounded">Hủy</button>
                                        <button type="submit" disabled={loading} className="bg-violet-600 text-white px-6 py-2 rounded hover:bg-violet-700 font-bold">
                                            {loading ? 'Đang lưu...' : 'Lưu Cấu hình'}
                                        </button>
                                    </div>
                                )}
                            </form>
                        ) : (
                            <div>Loading rules...</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
