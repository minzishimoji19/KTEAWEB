
import { useEffect, useState } from 'react';
import { api } from '../api/services';
import { Play, Pause, Plus } from 'lucide-react';

interface VoucherSource {
    id: string;
    name: string;
    type: 'TELEGRAM' | 'WEBSITE' | 'MANUAL';
    isActive: boolean;
    configJson: any;
}

interface JobLog {
    id: string;
    status: 'SUCCESS' | 'FAIL';
    foundCount: number;
    createdAt: string;
    source: { name: string };
}

export default function AutomationDashboard() {
    const [sources, setSources] = useState<VoucherSource[]>([]);
    const [logs, setLogs] = useState<JobLog[]>([]);

    // New Source Form
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newSource, setNewSource] = useState({ name: '', type: 'TELEGRAM', config: '{}' });

    const fetchData = async () => {
        try {
            const [sRes, lRes] = await Promise.all([
                api.get('/automation/sources'),
                api.get('/automation/logs')
            ]);
            setSources(sRes.data);
            setLogs(lRes.data);
        } catch (e) {
            console.error(e);
        } finally {
            // Loading done
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const toggleSource = async (id: string, current: boolean) => {
        await api.patch(`/automation/sources/${id}`, { isActive: !current });
        fetchData();
    };

    const createSource = async () => {
        try {
            await api.post('/automation/sources', {
                ...newSource,
                configJson: JSON.parse(newSource.config)
            });
            setIsModalOpen(false);
            fetchData();
        } catch (e) {
            alert('Invalid Config JSON or Error');
        }
    };

    const runJob = async () => {
        await api.post('/automation/run');
        alert('Job Triggered');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Tự động hóa (Automation)</h2>
                <div className="space-x-2">
                    <button onClick={runJob} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Run Now
                    </button>
                    <button onClick={() => setIsModalOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center float-right ml-2">
                        <Plus size={16} className="mr-1" /> Thêm Nguồn
                    </button>
                </div>
            </div>

            {/* Sources List */}
            <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-bold mb-4">Nguồn Voucher</h3>
                <div className="space-y-4">
                    {sources.map(s => (
                        <div key={s.id} className="flex items-center justify-between border p-4 rounded hover:bg-gray-50">
                            <div>
                                <div className="font-bold flex items-center">
                                    {s.name}
                                    <span className={`ml-2 text-xs px-2 py-0.5 rounded ${s.type === 'TELEGRAM' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                        {s.type}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1 font-mono">
                                    {JSON.stringify(s.configJson)}
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => toggleSource(s.id, s.isActive)}
                                    className={`p-2 rounded ${s.isActive ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-100'}`}
                                >
                                    {s.isActive ? <Pause size={20} /> : <Play size={20} />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Logs */}
            <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-bold mb-4">Lịch sử chạy (Logs)</h3>
                <table className="w-full text-sm text-left">
                    <thead className="text-gray-500">
                        <tr>
                            <th className="py-2">Thời gian</th>
                            <th>Nguồn</th>
                            <th>Kết quả</th>
                            <th>Voucher tìm thấy</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {logs.map(log => (
                            <tr key={log.id}>
                                <td className="py-3">{new Date(log.createdAt).toLocaleString()}</td>
                                <td>{log.source.name}</td>
                                <td>
                                    <span className={`px-2 py-1 rounded text-xs ${log.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {log.status}
                                    </span>
                                </td>
                                <td>{log.foundCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h3 className="font-bold text-lg mb-4">Thêm Nguồn Mới</h3>
                        <div className="space-y-3">
                            <input
                                className="w-full border p-2 rounded"
                                placeholder="Tên nguồn (e.g. Tele Deal)"
                                value={newSource.name}
                                onChange={e => setNewSource({ ...newSource, name: e.target.value })}
                            />
                            <select
                                className="w-full border p-2 rounded"
                                value={newSource.type}
                                onChange={e => setNewSource({ ...newSource, type: e.target.value as any })}
                            >
                                <option value="TELEGRAM">Telegram</option>
                                <option value="WEBSITE">Website</option>
                            </select>
                            <textarea
                                className="w-full border p-2 rounded h-24 font-mono text-sm"
                                placeholder='{"channelId": "123456"}'
                                value={newSource.config}
                                onChange={e => setNewSource({ ...newSource, config: e.target.value })}
                            />
                            <div className="flex justify-end space-x-2">
                                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500">Hủy</button>
                                <button onClick={createSource} className="px-4 py-2 bg-blue-600 text-white rounded">Tạo</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
