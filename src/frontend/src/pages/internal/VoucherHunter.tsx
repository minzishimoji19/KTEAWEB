import React, { useEffect, useState } from 'react';
import { Search, Plus, Filter, CheckCircle, ExternalLink, Copy, RefreshCw, X } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

interface Voucher {
    id: string;
    title: string;
    description: string;
    code: string;
    cinemaChain: string;
    status: string;
    verifyStatus: string;
    discountType: string;
    discountValue: number;
    endAt: string;
    internalNotes: string;
    paymentMethods: string[];
    applyUrl: string;
}

export default function VoucherHunter() {
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    // Filters
    const [search, setSearch] = useState('');
    const [cinemaChain, setCinemaChain] = useState('');
    const [status, setStatus] = useState('');
    const [verifyStatus, setVerifyStatus] = useState('');

    useEffect(() => {
        fetchVouchers();
    }, [page, cinemaChain, status, verifyStatus]);

    const fetchVouchers = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 20,
                search,
                cinemaChain,
                status,
                verifyStatus
            };
            const res = await api.get('/internal/vouchers', { params });
            setVouchers(res.data.data);
            setTotal(res.data.meta.total);
        } catch (err) {
            toast.error("Failed to load vouchers");
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        const toastId = toast.loading("Syncing vouchers...");
        try {
            await api.post('/internal/vouchers/sync');
            toast.success("Sync started in background", { id: toastId });
        } catch (err) {
            toast.error("Sync failed", { id: toastId });
        }
    };

    const handleVerify = async (id: string) => {
        try {
            await api.post(`/internal/vouchers/${id}/verify`);
            toast.success("Voucher Verified!");
            fetchVouchers(); // Refresh
        } catch (err) {
            toast.error("Verification failed");
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied!");
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    🎯 Voucher Hunter (Internal)
                </h2>
                <div className="flex gap-2">
                    <button onClick={handleSync} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-medium">
                        <RefreshCw size={18} />
                        Sync Sources
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700 font-medium font-bold shadow-sm">
                        <Plus size={18} />
                        Add Manually
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        className="w-full pl-10 border rounded p-2 text-sm"
                        placeholder="Search title, code, cinema..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && fetchVouchers()}
                    />
                </div>

                <select className="border rounded p-2 text-sm" value={cinemaChain} onChange={e => setCinemaChain(e.target.value)}>
                    <option value="">All Cinemas</option>
                    <option value="CGV">CGV</option>
                    <option value="LOTTE">Lotte</option>
                    <option value="GALAXY">Galaxy</option>
                    <option value="BHD">BHD</option>
                    <option value="BETA">Beta</option>
                </select>

                <select className="border rounded p-2 text-sm" value={verifyStatus} onChange={e => setVerifyStatus(e.target.value)}>
                    <option value="">Verification Status</option>
                    <option value="VERIFIED">Verified Only</option>
                    <option value="UNVERIFIED">Unverified</option>
                </select>

                <button onClick={fetchVouchers} className="px-4 py-2 bg-gray-800 text-white rounded text-sm hover:bg-gray-700">Filter</button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vouchers.map(v => (
                    <div key={v.id} className={`bg-white rounded-xl shadow-sm border p-5 relative group transition-all hover:shadow-md ${v.status === 'EXPIRED' ? 'opacity-60 grayscale' : ''} ${v.verifyStatus === 'VERIFIED' ? 'border-green-200 bg-green-50/30' : 'border-gray-200'}`}>
                        {v.verifyStatus === 'VERIFIED' && (
                            <div className="absolute top-3 right-3 text-green-600 bg-green-100 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                                <CheckCircle size={12} /> Verified
                            </div>
                        )}

                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold uppercase bg-slate-100 text-slate-600 px-2 py-1 rounded">{v.cinemaChain}</span>
                            {v.status === 'EXPIRED' && <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">EXPIRED</span>}
                        </div>

                        <h3 className="font-bold text-slate-900 mb-1 line-clamp-2" title={v.title}>{v.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{v.description}</p>

                        <div className="flex items-center gap-2 mb-4">
                            <div className="text-2xl font-bold text-orange-600">
                                {v.discountType === 'PERCENT' ? `-${v.discountValue}%` :
                                    v.discountType === 'AMOUNT' ? `-${v.discountValue?.toLocaleString()}đ` : 'PROMO'}
                            </div>
                            {v.code && (
                                <div
                                    onClick={() => copyToClipboard(v.code)}
                                    className="bg-gray-100 hover:bg-gray-200 cursor-pointer px-2 py-1 rounded text-sm font-mono flex items-center gap-1 border border-gray-300 border-dashed"
                                >
                                    {v.code} <Copy size={12} className="text-gray-400" />
                                </div>
                            )}
                        </div>

                        {v.paymentMethods && v.paymentMethods.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                                {v.paymentMethods.map(pm => (
                                    <span key={pm} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">{pm}</span>
                                ))}
                            </div>
                        )}

                        <div className="pt-3 border-t flex justify-between items-center text-sm">
                            <div className="text-gray-400 text-xs">
                                {v.endAt ? `Ends: ${new Date(v.endAt).toLocaleDateString()}` : 'No Expiry'}
                            </div>

                            <div className="flex gap-2">
                                {v.applyUrl && (
                                    <a href={v.applyUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Open Link">
                                        <ExternalLink size={18} />
                                    </a>
                                )}
                                {v.verifyStatus !== 'VERIFIED' && (
                                    <button onClick={() => handleVerify(v.id)} className="p-2 text-green-600 hover:bg-green-50 rounded" title="Mark Verified">
                                        <CheckCircle size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center gap-2 mt-8">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                    Prev
                </button>
                <span className="px-3 py-1 text-gray-500">Page {page} of {Math.ceil(total / 20)}</span>
                <button
                    disabled={page * 20 >= total}
                    onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
