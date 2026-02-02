import { useEffect, useState } from 'react';
import { Check, X, Eye } from 'lucide-react';
import { getTransactions, confirmTransaction, rejectTransaction, type Transaction } from '../api/services';

export default function PendingQueue() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchPending = async () => {
        setLoading(true);
        try {
            const data = await getTransactions({ status: 'PENDING' });
            setTransactions(data);
            if (data.length > 0 && !selectedTx) {
                setSelectedTx(data[0]); // Auto select first one
            } else if (data.length === 0) {
                setSelectedTx(null);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleConfirm = async () => {
        if (!selectedTx) return;
        if (window.confirm(`Confirm transaction for ${selectedTx.customer?.name}?`)) {
            await confirmTransaction(selectedTx.id);
            fetchPending();
            setSelectedTx(null);
        }
    };

    const handleReject = async () => {
        if (!selectedTx) return;
        if (window.confirm(`Reject transaction? This cannot be undone.`)) {
            await rejectTransaction(selectedTx.id);
            fetchPending();
            setSelectedTx(null);
        }
    };

    return (
        <div className="h-[calc(100vh-100px)] flex space-x-6">
            {/* Left List */}
            <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-orange-50">
                    <h2 className="font-bold text-orange-800 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-orange-500 mr-2 animate-pulse"></span>
                        Hàng chờ Xử lý ({transactions.length})
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                    {loading ? <div className="p-4 text-center">Đang tải...</div> :
                        transactions.length === 0 ? <div className="p-8 text-center text-gray-400">Không có giao dịch chờ xử lý.</div> :
                            transactions.map(t => (
                                <div
                                    key={t.id}
                                    onClick={() => setSelectedTx(t)}
                                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedTx?.id === t.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-slate-800">{t.amountGross.toLocaleString()}</span>
                                        <span className="text-xs text-gray-500">{new Date(t.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-1">{t.customer?.name}</p>
                                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                                        <span className="uppercase">{t.channel}</span>
                                        <span>•</span>
                                        <span>{t.productType}</span>
                                    </div>
                                </div>
                            ))
                    }
                </div>
            </div>

            {/* Right Preview Panel */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
                {selectedTx ? (
                    <>
                        <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 mb-1">Duyệt Giao dịch</h1>
                                <p className="text-sm text-gray-500">ID: {selectedTx.id}</p>
                            </div>
                            <div className="flex space-x-3">
                                <button onClick={handleReject} className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 flex items-center space-x-2">
                                    <X size={18} />
                                    <span>Từ chối</span>
                                </button>
                                <button onClick={handleConfirm} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm flex items-center space-x-2 font-bold">
                                    <Check size={18} />
                                    <span>Xác nhận</span>
                                </button>
                            </div>
                        </div>

                        <div className="p-8 grid grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Khách hàng</label>
                                    <div className="text-lg font-medium text-slate-900">{selectedTx.customer?.name}</div>
                                    <div className="text-slate-500">{selectedTx.customer?.phone}</div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Số tiền</label>
                                        <div className="text-2xl font-bold text-slate-900">{selectedTx.amountGross.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Số vé</label>
                                        <div className="text-2xl font-bold text-slate-900">{selectedTx.ticketCount}</div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Chi tiết</label>
                                    <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Sản phẩm</span>
                                            <span className="font-medium">{selectedTx.productType}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Phim</span>
                                            <span className="font-medium">{selectedTx.movieName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Kênh</span>
                                            <span className="font-medium">{selectedTx.channel}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Ngày mua</span>
                                            <span className="font-medium">{new Date(selectedTx.purchaseDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-l border-gray-100 pl-10">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">Ảnh minh chứng</label>
                                {selectedTx.proofImageUrl ? (
                                    <img src={selectedTx.proofImageUrl} alt="Proof" className="w-full rounded-lg border border-gray-200" />
                                ) : (
                                    <div className="w-full aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-300">
                                        <Eye size={32} className="mb-2" />
                                        <span>Chưa có ảnh minh chứng</span>
                                    </div>
                                )}

                                <div className="mt-6 bg-yellow-50 p-4 rounded text-sm text-yellow-800">
                                    <strong>Lưu ý:</strong> Giao dịch đang ở trạng thái
                                    <span className="font-bold mx-1">CHỜ XỬ LÝ</span>.
                                    Xác nhận sẽ cộng điểm (sprint sau) và khóa các thông tin này.
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Check size={24} />
                        </div>
                        <p>Đã xong hết! Không còn giao dịch chờ.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
