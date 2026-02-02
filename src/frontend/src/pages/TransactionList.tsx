import { useEffect, useState } from 'react';
import { Search, Plus, Filter, Check, X } from 'lucide-react';
import { getTransactions, createTransaction, confirmTransaction, rejectTransaction, type Transaction, getCustomers, type Customer } from '../api/services';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';

export default function TransactionList() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Reject Modal State
    const [rejectId, setRejectId] = useState<string | null>(null);
    const [rejecting, setRejecting] = useState(false);

    // Create Form State
    const [step, setStep] = useState(1); // 1: Select Customer, 2: Details
    const [customerSearch, setCustomerSearch] = useState('');
    const [foundCustomers, setFoundCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const [newTx, setNewTx] = useState<Partial<Transaction>>({
        amountGross: 0,
        amountNet: 0,
        productType: 'TICKET',
        movieName: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        cinemaName: '',
        discountPercent: 0
    });

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const data = await getTransactions({ status: statusFilter || undefined });
            setTransactions(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load transactions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [statusFilter]);

    // Search Customer Logic
    useEffect(() => {
        if (step === 1 && customerSearch.length > 2) {
            const timer = setTimeout(() => {
                getCustomers(customerSearch).then(setFoundCustomers);
            }, 500);
            return () => clearTimeout(timer);
        } else {
            setFoundCustomers([]);
        }
    }, [customerSearch, step]);

    const handleCreate = async () => {
        if (!selectedCustomer) return;
        try {
            await createTransaction({
                ...newTx,
                customerId: selectedCustomer.id,
                purchaseDate: new Date(newTx.purchaseDate!).toISOString()
            });
            setIsModalOpen(false);
            setStep(1);
            setNewTx({ ...newTx, amountGross: 0, movieName: '', cinemaName: '', discountPercent: 0 });
            setSelectedCustomer(null);
            setCustomerSearch('');
            fetchTransactions();
            toast.success("Transaction created");
        } catch (error) {
            toast.error("Failed to create transaction");
        }
    };

    const handleConfirm = async (id: string) => {
        if (!window.confirm("Confirm this transaction? Point will be added.")) return;
        try {
            await confirmTransaction(id);
            toast.success("Transaction confirmed");
            fetchTransactions();
        } catch (error) {
            toast.error("Failed to confirm");
        }
    };

    const handleRejectClick = (id: string) => {
        setRejectId(id);
    };

    const confirmReject = async () => {
        if (!rejectId) return;
        setRejecting(true);
        try {
            await rejectTransaction(rejectId);
            toast.success("Transaction rejected");
            fetchTransactions();
            setRejectId(null);
        } catch (error) {
            toast.error("Failed to reject");
        } finally {
            setRejecting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Lịch sử Giao dịch</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-medium"
                >
                    <Plus size={18} />
                    <span>Thêm Giao dịch</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center space-x-4">
                <Filter size={18} className="text-gray-400" />
                <select
                    className="border-none bg-gray-50 rounded-md px-3 py-1.5 text-sm focus:ring-0"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="PENDING">Chờ xử lý</option>
                    <option value="CONFIRMED">Thành công</option>
                    <option value="REJECTED">Đã hủy</option>
                </select>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-3">Ngày</th>
                            <th className="px-6 py-3">Khách hàng</th>
                            <th className="px-6 py-3">Hạng</th>
                            <th className="px-6 py-3">Phim / Sản phẩm</th>
                            <th className="px-6 py-3">Số tiền</th>
                            <th className="px-6 py-3">Kênh</th>
                            <th className="px-6 py-3">Trạng thái</th>
                            <th className="px-6 py-3 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? <tr><td colSpan={8} className="text-center py-8">Đang tải...</td></tr> :
                            transactions.length === 0 ? <tr><td colSpan={8} className="text-center py-8">Chưa có giao dịch nào.</td></tr> :
                                transactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">{new Date(t.purchaseDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{t.customer?.name}</div>
                                            <div className="text-xs text-gray-500">{t.customer?.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">Member</td>
                                        <td className="px-6 py-4">
                                            <div>{t.productType}</div>
                                            <div className="text-xs text-gray-500">{t.movieName}</div>
                                        </td>
                                        <td className="px-6 py-4 font-bold">{t.amountGross.toLocaleString()}</td>
                                        <td className="px-6 py-4">{t.channel}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${t.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                                t.status === 'PENDING' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {t.status === 'CONFIRMED' ? 'THÀNH CÔNG' :
                                                    t.status === 'PENDING' ? 'CHỜ XỬ LÝ' : 'ĐÃ HỦY'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {t.status === 'PENDING' && (
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleConfirm(t.id)} className="p-1 hover:bg-green-50 text-green-600 rounded" title="Confirm">
                                                        <Check size={16} />
                                                    </button>
                                                    <button onClick={() => handleRejectClick(t.id)} className="p-1 hover:bg-red-50 text-red-600 rounded" title="Reject">
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                    </tbody>
                </table>
            </div>

            <ConfirmModal
                isOpen={!!rejectId}
                title="Reject Transaction"
                message="Are you sure you want to reject this transaction? This action cannot be undone."
                onConfirm={confirmReject}
                onCancel={() => setRejectId(null)}
                isDestructive={true}
                isLoading={rejecting}
                confirmText="Reject"
            />

            {/* Add Transaction Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
                        <h3 className="text-lg font-bold mb-4">Giao dịch Mới</h3>

                        {step === 1 && (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-500">Tìm Khách theo SĐT hoặc Tên</p>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                    <input
                                        autoFocus
                                        type="text"
                                        className="w-full pl-10 border rounded p-2"
                                        placeholder="0912..."
                                        value={customerSearch}
                                        onChange={e => setCustomerSearch(e.target.value)}
                                    />
                                </div>
                                <div className="max-h-60 overflow-y-auto border rounded divide-y">
                                    {foundCustomers.map(c => (
                                        <div key={c.id} className="p-3 hover:bg-gray-50 cursor-pointer flex justify-between"
                                            onClick={() => { setSelectedCustomer(c); setStep(2); }}
                                        >
                                            <div>
                                                <p className="font-medium">{c.name}</p>
                                                <p className="text-xs text-gray-500">{c.phone}</p>
                                            </div>
                                            <div className="text-xs bg-gray-100 px-2 py-1 rounded">Chọn</div>
                                        </div>
                                    ))}
                                    {customerSearch.length > 2 && foundCustomers.length === 0 && (
                                        <div className="p-3 text-center text-gray-500 text-sm">Không tìm thấy khách hàng.</div>
                                    )}
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600">Hủy</button>
                                </div>
                            </div>
                        )}

                        {step === 2 && selectedCustomer && (
                            <div className="space-y-4">
                                <div className="bg-blue-50 p-3 rounded flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-bold text-blue-900">{selectedCustomer.name}</p>
                                        <p className="text-xs text-blue-700">{selectedCustomer.phone}</p>
                                    </div>
                                    <button onClick={() => setStep(1)} className="text-xs text-blue-600 underline">Thay đổi</button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium mb-1">Ngày mua</label>
                                        <input type="date" className="w-full border rounded p-2 text-sm"
                                            value={newTx.purchaseDate}
                                            onChange={e => setNewTx({ ...newTx, purchaseDate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium mb-1">Loại</label>
                                        <select className="w-full border rounded p-2 text-sm"
                                            value={newTx.productType}
                                            onChange={e => setNewTx({ ...newTx, productType: e.target.value as any })}
                                        >
                                            <option value="TICKET">Vé</option>
                                            <option value="COMBO">Combo (Bắp/Nước)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium mb-1">Tổng tiền</label>
                                        <input type="number" className="w-full border rounded p-2 text-sm font-bold"
                                            value={newTx.amountGross}
                                            onChange={e => setNewTx({ ...newTx, amountGross: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium mb-1">Rạp</label>
                                        <input type="text" className="w-full border rounded p-2 text-sm"
                                            value={newTx.cinemaName || ''}
                                            onChange={e => setNewTx({ ...newTx, cinemaName: e.target.value })}
                                            placeholder="CGV Vincom..."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium mb-1">Tên Phim / Sản phẩm</label>
                                    <input type="text" className="w-full border rounded p-2 text-sm"
                                        value={newTx.movieName}
                                        onChange={e => setNewTx({ ...newTx, movieName: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium mb-1">% Được giảm (Voucher/Member)</label>
                                    <input type="number" className="w-full border rounded p-2 text-sm"
                                        value={newTx.discountPercent || 0}
                                        onChange={e => setNewTx({ ...newTx, discountPercent: Number(e.target.value) })}
                                        placeholder="10"
                                        max={100}
                                        min={0}
                                    />
                                </div>

                                <div className="flex justify-end space-x-2 pt-4">
                                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600">Hủy</button>
                                    <button onClick={handleCreate} className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 font-bold">Tạo Giao dịch</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
