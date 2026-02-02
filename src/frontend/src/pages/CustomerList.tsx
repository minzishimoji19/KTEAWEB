import { useEffect, useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { getCustomers, createCustomer, type Customer } from '../api/services';
import { Link } from 'react-router-dom';

export default function CustomerList() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ phone: '', name: '', relationship: '', bankAccount: '', gameRank: '', note: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const data = await getCustomers(search);
            setCustomers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(fetchCustomers, 500);
        return () => clearTimeout(debounce);
    }, [search]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await createCustomer(newCustomer);
            setIsModalOpen(false);
            setNewCustomer({ phone: '', name: '', relationship: '', bankAccount: '', gameRank: '', note: '' });
            fetchCustomers();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create customer');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mr-100">
                <h2 className="text-2xl font-bold text-slate-800">Danh sách Khách hàng</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-medium"
                >
                    <Plus size={18} />
                    <span>Thêm Khách hàng</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center space-x-3">
                    <Search className="text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm theo tên hoặc SĐT..."
                        className="flex-1 border-none focus:ring-0 text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-3">SĐT</th>
                            <th className="px-6 py-3">Tên hiển thị</th>
                            <th className="px-6 py-3">Rank / Mối quan hệ</th>
                            <th className="px-6 py-3">Trạng thái</th>
                            <th className="px-6 py-3">Ngày tham gia</th>
                            <th className="px-6 py-3 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={6} className="text-center py-8 text-gray-400">Đang tải...</td></tr>
                        ) : customers.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-8 text-gray-400">Không tìm thấy khách hàng.</td></tr>
                        ) : (
                            customers.map((c) => (
                                <tr key={c.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">{c.phone}</td>
                                    <td className="px-6 py-4">{c.name}</td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {c.gameRank ? <span className="mr-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">{c.gameRank}</span> : null}
                                        {c.relationship}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${c.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {c.status === 'ACTIVE' ? 'HOẠT ĐỘNG' : 'KHÓA'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Link to={`/customers/${c.id}`} className="text-blue-600 hover:text-blue-800">
                                            Chi tiết
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
                        <h3 className="text-lg font-bold mb-4">Thêm Khách hàng Mới</h3>
                        {error && <div className="bg-red-50 text-red-600 p-2 rounded mb-4 text-sm">{error}</div>}
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Số điện thoại *</label>
                                    <input required type="text" className="w-full border rounded p-2 text-sm" value={newCustomer.phone} onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Tên *</label>
                                    <input required type="text" className="w-full border rounded p-2 text-sm" value={newCustomer.name} onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Mối quan hệ</label>
                                    <input type="text" className="w-full border rounded p-2 text-sm" value={newCustomer.relationship} onChange={e => setNewCustomer({ ...newCustomer, relationship: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Rank Game</label>
                                    <input type="text" className="w-full border rounded p-2 text-sm" value={newCustomer.gameRank} onChange={e => setNewCustomer({ ...newCustomer, gameRank: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Tài khoản Ngân hàng</label>
                                <input type="text" className="w-full border rounded p-2 text-sm" value={newCustomer.bankAccount} onChange={e => setNewCustomer({ ...newCustomer, bankAccount: e.target.value })} />
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Hủy</button>
                                <button type="submit" className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">tạo Mới</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
