
import { useEffect, useState } from 'react';
import { api, getVouchers, type Voucher } from '../api/services';
import { Check, X } from 'lucide-react';

export default function VoucherValidation() {
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchPending = async () => {
        setLoading(true);
        try {
            const data = await getVouchers(undefined, 'PENDING_VALIDATION');
            setVouchers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
        try {
            const status = action === 'APPROVE' ? 'ACTIVE' : 'INVALID';
            await api.patch(`/vouchers/${id}/validate`, { status });
            // Optimistic update
            setVouchers(vouchers.filter(v => v.id !== id));
        } catch (error) {
            alert('Failed to update voucher');
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Duyệt Voucher ({vouchers.length})</h2>

            <div className="bg-white rounded-xl shadow overflow-hidden">
                {loading ? <div className="p-8 text-center">Đang tải...</div> :
                    vouchers.length === 0 ? <div className="p-8 text-center text-gray-500">Không có voucher cần duyệt.</div> :
                        <div className="divide-y divide-gray-100">
                            {vouchers.map(v => (
                                <div key={v.id} className="p-4 flex items-start justify-between hover:bg-gray-50">
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <span className="font-mono font-bold text-lg text-blue-600">{v.code}</span>
                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{v.platform}</span>
                                        </div>
                                        <p className="text-sm mt-1">{v.rawText || 'Không có nội dung gốc'}</p>
                                        <div className="text-xs text-gray-400 mt-2">
                                            Giảm: {v.discountValue} | Tìm thấy: {v.sourceId || 'N/A'}
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleAction(v.id, 'REJECT')}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded"
                                            title="Từ chối"
                                        >
                                            <X size={24} />
                                        </button>
                                        <button
                                            onClick={() => handleAction(v.id, 'APPROVE')}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded"
                                            title="Duyệt"
                                        >
                                            <Check size={24} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                }
            </div>
        </div>
    );
}
