import { useEffect, useState } from 'react';
import { getVouchers, createVoucher, deleteVoucher, type Voucher } from '../api/services';
import { Search, Plus, X } from 'lucide-react';

export default function VoucherList() {
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newVoucher, setNewVoucher] = useState<Partial<Voucher>>({
        discountType: 'PERCENT',
        expiryDate: '',
        status: 'ACTIVE'
    });

    useEffect(() => {
        fetchVouchers();
    }, [search]);

    const fetchVouchers = async () => {
        try {
            const data = await getVouchers(search);
            setVouchers(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createVoucher(newVoucher);
            setIsModalOpen(false);
            setNewVoucher({ discountType: 'PERCENT', expiryDate: '', status: 'ACTIVE' }); // reset
            fetchVouchers();
        } catch (err) {
            alert('Failed to create voucher. Code might be duplicate.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Quản lý Voucher</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-violet-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-violet-700 font-bold text-sm"
                >
                    <Plus size={18} /> Thêm Voucher
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm mã hoặc nền tảng..."
                        className="pl-10 w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">Mã</th>
                            <th className="px-6 py-4">Giảm giá</th>
                            <th className="px-6 py-4">Nền tảng</th>
                            <th className="px-6 py-4">Trạng thái</th>
                            <th className="px-6 py-4">Hết hạn</th>
                            <th className="px-6 py-4">Ghi chú</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vouchers.map((v) => (
                            <tr key={v.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <span className="font-mono font-bold text-slate-700 bg-gray-100 px-2 py-1 rounded border">{v.code}</span>
                                </td>
                                <td className="px-6 py-4 font-medium">
                                    {v.discountType === 'PERCENT' ? `${v.discountValue}%` :
                                        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v.discountValue)}
                                </td>
                                <td className="px-6 py-4">{v.platform}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${v.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                        v.status === 'EXPIRED' ? 'bg-red-100 text-red-700' :
                                            v.status === 'EXPIRING' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {v.status === 'ACTIVE' ? 'HOẠT ĐỘNG' :
                                            v.status === 'EXPIRING' ? 'SẮP HẾT HẠN' :
                                                v.status === 'EXPIRED' ? 'HẾT HẠN' :
                                                    v.status === 'EXHAUSTED' ? 'ĐA HẾT' : 'KHÔNG HỢP LỆ'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    {v.expiryDate ? new Date(v.expiryDate).toLocaleDateString() : 'Vĩnh viễn'}
                                </td>
                                <td className="px-6 py-4 text-gray-400 italic max-w-xs truncate">{v.note}</td>
                            </tr>
                        ))}
                        {vouchers.length === 0 && (
                            <tr><td colSpan={6} className="text-center p-8 text-gray-500">Chưa có voucher nào.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold">Tạo Voucher Mới</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Mã Voucher</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full border rounded p-2 text-sm font-mono uppercase"
                                        placeholder="SUMMER2026"
                                        value={newVoucher.code}
                                        onChange={e => setNewVoucher({ ...newVoucher, code: e.target.value.toUpperCase() })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Nền tảng</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full border rounded p-2 text-sm"
                                        placeholder="CGV, MOMO..."
                                        value={newVoucher.platform}
                                        onChange={e => setNewVoucher({ ...newVoucher, platform: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Loại giảm giá</label>
                                    <select
                                        className="w-full border rounded p-2 text-sm"
                                        value={newVoucher.discountType}
                                        onChange={e => setNewVoucher({ ...newVoucher, discountType: e.target.value as any })}
                                    >
                                        <option value="PERCENT">Phần trăm (%)</option>
                                        <option value="AMOUNT">Số tiền (VND)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Giá trị</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full border rounded p-2 text-sm"
                                        placeholder="10 hoặc 50000"
                                        value={newVoucher.discountValue}
                                        onChange={e => setNewVoucher({ ...newVoucher, discountValue: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Hạn sử dụng (Tùy chọn)</label>
                                <input
                                    type="date"
                                    className="w-full border rounded p-2 text-sm"
                                    value={newVoucher.expiryDate ? String(newVoucher.expiryDate) : ''}
                                    onChange={e => setNewVoucher({ ...newVoucher, expiryDate: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Ghi chú</label>
                                <textarea
                                    className="w-full border rounded p-2 text-sm"
                                    rows={2}
                                    value={newVoucher.note}
                                    onChange={e => setNewVoucher({ ...newVoucher, note: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 text-sm hover:bg-gray-100 rounded">Hủy</button>
                                <button type="submit" className="px-4 py-2 bg-violet-600 text-white rounded text-sm hover:bg-violet-700 font-bold">Tạo Voucher</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
