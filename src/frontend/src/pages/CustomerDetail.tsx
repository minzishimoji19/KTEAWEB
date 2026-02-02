import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCustomer, type Customer, getPointLedger, type PointLedger, redeemPoints } from '../api/services';
import { User, Phone, CreditCard, Star, Clock, Award, Gift } from 'lucide-react';

export default function CustomerDetail() {
    const { id } = useParams();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [ledger, setLedger] = useState<PointLedger[]>([]);
    const [activeTab, setActiveTab] = useState<'transactions' | 'ledger'>('transactions');
    const [isRedeemOpen, setIsRedeemOpen] = useState(false);
    const [redeemAmount, setRedeemAmount] = useState(0);

    const fetchData = () => {
        if (id) {
            getCustomer(id).then(setCustomer).catch(console.error);
            getPointLedger(id).then(setLedger).catch(console.error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleRedeem = async () => {
        if (!id || redeemAmount <= 0) return;
        try {
            await redeemPoints({ customerId: id, points: redeemAmount });
            setIsRedeemOpen(false);
            setRedeemAmount(0);
            fetchData(); // Refresh points and ledger
        } catch (err) {
            alert("Redemption failed");
        }
    };

    if (!customer) return <div className="p-8">Đang tải...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Link to="/customers" className="hover:text-slate-800">Khách hàng</Link>
                <span>/</span>
                <span className="text-slate-800 font-medium">{customer.name}</span>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                            <User size={32} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">{customer.name}</h1>
                            <p className="text-sm text-gray-500">{customer.relationship || 'Khách hàng'}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center space-x-3 text-sm">
                            <Phone size={16} className="text-gray-400" />
                            <span>{customer.phone}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm">
                            <CreditCard size={16} className="text-gray-400" />
                            <span>{customer.bankAccount || 'Chưa có thông tin ngân hàng'}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm">
                            <Star size={16} className="text-yellow-400" />
                            <span>{customer.gameRank || 'Chưa có rank'}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm">
                            <Clock size={16} className="text-gray-400" />
                            <span>Tham gia {new Date(customer.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500">Trạng thái</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${customer.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {customer.status === 'ACTIVE' ? 'HOẠT ĐỘNG' : 'KHÓA'}
                            </span>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 flex items-center gap-1"><Award size={14} /> Điểm</span>
                            <span className="font-bold text-slate-900 text-lg">{customer.totalPoints || 0}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm mt-2">
                            <span className="text-gray-500 flex items-center gap-1"><Star size={14} /> Hạng</span>
                            <span className={`font-bold px-2 py-0.5 rounded text-xs ${customer.tier === 'DIAMOND' ? 'bg-purple-100 text-purple-700' :
                                customer.tier === 'GOLD' ? 'bg-yellow-100 text-yellow-700' :
                                    customer.tier === 'SILVER' ? 'bg-slate-200 text-slate-700' : 'bg-orange-100 text-orange-800'
                                }`}>
                                {customer.tier === 'DIAMOND' ? 'KIM CƯƠNG' :
                                    customer.tier === 'GOLD' ? 'VÀNG' :
                                        customer.tier === 'SILVER' ? 'BẠC' : 'ĐỒNG'}
                            </span>
                        </div>

                        <button
                            onClick={() => setIsRedeemOpen(true)}
                            className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center justify-center space-x-2 shadow-sm"
                        >
                            <Gift size={16} />
                            <span>Đổi Điểm</span>
                        </button>
                    </div>
                </div>

                {/* Main Content: Transactions or Ledger */}
                <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
                    <div className="border-b border-gray-100 bg-gray-50 flex">
                        <button
                            className={`px-6 py-4 font-bold text-sm ${activeTab === 'transactions' ? 'bg-white text-yellow-600 border-t-2 border-yellow-500' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('transactions')}
                        >
                            Lịch sử Giao dịch
                        </button>
                        <button
                            className={`px-6 py-4 font-bold text-sm ${activeTab === 'ledger' ? 'bg-white text-yellow-600 border-t-2 border-yellow-500' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('ledger')}
                        >
                            Lịch sử Điểm
                        </button>
                    </div>

                    <div className="p-0">
                        {activeTab === 'transactions' && (
                            customer.transactions && customer.transactions.length > 0 ? (
                                <table className="w-full text-sm text-left">
                                    <thead className="text-gray-500 font-medium border-b border-gray-100 bg-gray-50/50">
                                        <tr>
                                            <th className="px-6 py-3">Ngày</th>
                                            <th className="px-6 py-3">Loại</th>
                                            <th className="px-6 py-3">Số tiền</th>
                                            <th className="px-6 py-3">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {customer.transactions.map(t => (
                                            <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                                <td className="px-6 py-3">{new Date(t.purchaseDate).toLocaleDateString()}</td>
                                                <td className="px-6 py-3">{t.productType}</td>
                                                <td className="px-6 py-3 font-medium">{t.amountGross.toLocaleString()}</td>
                                                <td className="px-6 py-3">
                                                    <span className={`text-xs px-2 py-0.5 rounded ${t.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                                        t.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {t.status === 'CONFIRMED' ? 'THÀNH CÔNG' :
                                                            t.status === 'PENDING' ? 'CHỜ XỬ LÝ' : 'ĐÃ HỦY'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-8 text-center text-gray-500">Chưa có giao dịch.</div>
                            ))}

                        {activeTab === 'ledger' && (
                            ledger.length > 0 ? (
                                <table className="w-full text-sm text-left">
                                    <thead className="text-gray-500 font-medium border-b border-gray-100 bg-gray-50/50">
                                        <tr>
                                            <th className="px-6 py-3">Ngày</th>
                                            <th className="px-6 py-3">Loại</th>
                                            <th className="px-6 py-3 text-right">Điểm</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ledger.map(l => (
                                            <tr key={l.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                                <td className="px-6 py-3">{new Date(l.createdAt).toLocaleString()}</td>
                                                <td className="px-6 py-3">
                                                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${l.type === 'EARN' ? 'bg-green-100 text-green-700' :
                                                        l.type === 'REDEEM' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {l.type === 'EARN' ? 'TÍCH LŨY' :
                                                            l.type === 'REDEEM' ? 'ĐỔI ĐIỂM' : l.type}
                                                    </span>
                                                </td>
                                                <td className={`px-6 py-3 font-bold text-right ${l.points > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                    {l.points > 0 ? '+' : ''}{l.points}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-8 text-center text-gray-500">Chưa có lịch sử điểm.</div>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* Redeem Modal */}
            {isRedeemOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
                        <h3 className="text-lg font-bold mb-4">Đổi Điểm</h3>
                        <div className="bg-blue-50 p-3 rounded mb-4">
                            <p className="text-xs text-blue-800">Điểm khả dụng</p>
                            <p className="text-xl font-bold text-blue-900">{customer.totalPoints} pts</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Điểm muốn đổi</label>
                                <input
                                    type="number"
                                    className="w-full border rounded p-2 text-sm font-bold"
                                    value={redeemAmount}
                                    onChange={(e) => setRedeemAmount(Number(e.target.value))}
                                    max={customer.totalPoints}
                                    min={1}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Ghi chú (Tùy chọn)</label>
                                <input
                                    type="text"
                                    className="w-full border rounded p-2 text-sm"
                                    placeholder="Đổi quà..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-6">
                            <button onClick={() => setIsRedeemOpen(false)} className="px-4 py-2 text-gray-600 text-sm hover:bg-gray-100 rounded">Hủy</button>
                            <button
                                onClick={handleRedeem}
                                disabled={redeemAmount <= 0 || redeemAmount > customer.totalPoints}
                                className="px-4 py-2 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 font-bold disabled:opacity-50"
                            >
                                Đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
