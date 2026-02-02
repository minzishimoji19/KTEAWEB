import { useState, useEffect } from 'react';
import { X, Gift, Check, Search, Ticket } from 'lucide-react';
import { getCustomers, redeemVoucher, type Customer, type RewardVoucher } from '../api/services';
import toast from 'react-hot-toast';

interface RedeemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    preselectedCustomer?: Customer | null;
}

const REWARDS = [
    { id: 'DISC10K10P', points: 10000, discount: 10, title: 'Voucher giảm 10%' },
    { id: 'DISC20K20P', points: 20000, discount: 20, title: 'Voucher giảm 20%' }
];

export default function RedeemModal({ isOpen, onClose, onSuccess, preselectedCustomer }: RedeemModalProps) {
    const [step, setStep] = useState(1);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [selectedReward, setSelectedReward] = useState<typeof REWARDS[0] | null>(null);

    // Search State
    const [search, setSearch] = useState('');
    const [foundCustomers, setFoundCustomers] = useState<Customer[]>([]);

    // Result
    const [resultVoucher, setResultVoucher] = useState<RewardVoucher | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setResultVoucher(null);
            setSelectedReward(null);
            setCustomer(preselectedCustomer || null);
            setSearch('');
            setFoundCustomers([]);
        }
    }, [isOpen, preselectedCustomer]);

    // Auto-search
    useEffect(() => {
        if (step === 1 && !customer && search.length > 2) {
            const timer = setTimeout(() => {
                getCustomers(search).then(setFoundCustomers);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [search, step, customer]);

    const handleRedeem = async () => {
        if (!customer || !selectedReward) return;

        if (customer.totalPoints < selectedReward.points) {
            toast.error("Không đủ điểm!");
            return;
        }

        if (!window.confirm(`Xác nhận đổi ${selectedReward.points.toLocaleString()} điểm lấy ${selectedReward.title} cho khách ${customer.name}?`)) {
            return;
        }

        setLoading(true);
        try {
            const res = await redeemVoucher(customer.id, selectedReward.id);
            setResultVoucher(res.voucher);
            setStep(3); // Success Screen
            toast.success("Đổi điểm thành công!");
            onSuccess();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Đổi điểm thất bại");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg overflow-hidden">
                <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Gift className="text-violet-600" />
                        Đổi Điểm Thưởng
                    </h3>
                    <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
                </div>

                <div className="p-6">
                    {step === 1 && !customer && (
                        <div className="space-y-4">
                            <label className="block text-sm font-medium">Tìm khách hàng</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input
                                    autoFocus
                                    className="w-full pl-10 border rounded p-2"
                                    placeholder="SĐT hoặc Tên..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="max-h-60 overflow-y-auto border rounded divide-y">
                                {foundCustomers.map(c => (
                                    <div key={c.id} onClick={() => setCustomer(c)} className="p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center">
                                        <div>
                                            <div className="font-bold">{c.name}</div>
                                            <div className="text-xs text-gray-500">{c.phone}</div>
                                        </div>
                                        <div className="text-sm font-bold text-orange-600">{c.totalPoints.toLocaleString()} điểm</div>
                                    </div>
                                ))}
                                {search.length > 2 && foundCustomers.length === 0 && <div className="p-4 text-center text-gray-500">Không tìm thấy</div>}
                            </div>
                        </div>
                    )}

                    {(step === 1 || step === 2) && customer && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 p-3 rounded flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-bold text-blue-900">{customer.name}</p>
                                    <p className="text-xs text-blue-700">Hiện có: <span className="font-bold">{customer.totalPoints.toLocaleString()}</span> điểm</p>
                                </div>
                                <button onClick={() => { setCustomer(null); setStep(1); }} className="text-xs text-blue-600 underline">Đổi khách</button>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-sm font-medium">Chọn quà đổi</label>
                                {REWARDS.map(r => (
                                    <div
                                        key={r.id}
                                        onClick={() => customer.totalPoints >= r.points && setSelectedReward(r)}
                                        className={`border p-4 rounded-lg flex justify-between items-center cursor-pointer transition-all ${selectedReward?.id === r.id ? 'border-violet-600 bg-violet-50 ring-1 ring-violet-600' : 'hover:border-gray-300'
                                            } ${customer.totalPoints < r.points ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${selectedReward?.id === r.id ? 'bg-violet-200 text-violet-700' : 'bg-gray-100 text-gray-500'}`}>
                                                <Ticket size={24} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800">{r.title}</div>
                                                <div className="text-xs text-gray-500">Giảm giá trực tiếp trên hóa đơn</div>
                                            </div>
                                        </div>
                                        <div className="font-bold text-orange-600">{r.points.toLocaleString()} điểm</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && resultVoucher && (
                        <div className="text-center space-y-6 py-4">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                <Check size={32} />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-slate-800">Đổi thành công!</h4>
                                <p className="text-gray-500">Mã voucher đã được tạo và gửi cho khách.</p>
                            </div>

                            <div className="bg-gray-100 p-4 rounded-xl border border-dashed border-gray-300">
                                <p className="text-xs text-gray-500 uppercase mb-1">Mã Voucher</p>
                                <div className="text-2xl font-mono font-bold tracking-wider text-slate-900">{resultVoucher.code}</div>
                                <div className="text-sm text-green-600 font-medium mt-2">Giảm {resultVoucher.discountPercent}%</div>
                                <div className="text-xs text-gray-400 mt-1">Hết hạn: {new Date(resultVoucher.expiresAt).toLocaleDateString()}</div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t">
                    {step === 3 ? (
                        <button onClick={onClose} className="px-6 py-2 bg-slate-800 text-white rounded font-bold hover:bg-slate-900">Đóng</button>
                    ) : (
                        <>
                            <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded">Hủy</button>
                            <button
                                disabled={!selectedReward || loading}
                                onClick={handleRedeem}
                                className="px-6 py-2 bg-violet-600 text-white rounded font-bold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Đang xử lý...' : 'Xác nhận Đổi'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
