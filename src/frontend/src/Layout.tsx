import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, CreditCard, Gift, Settings, LogOut, Search, Ticket, Check } from 'lucide-react';
import clsx from 'clsx';

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navItems = [
        { icon: Home, label: 'Tổng quan', path: '/dashboard' },
        { icon: Users, label: 'Khách hàng', path: '/customers' },
        { icon: CreditCard, label: 'Giao dịch', path: '/transactions' },
        { icon: Gift, label: 'Loyalty', path: '/loyalty' },
        { icon: Ticket, label: 'Kho Voucher', path: '/vouchers' },
        { icon: Search, label: 'Săn Deals', path: '/internal/vouchers' },
        { icon: Settings, label: 'Cài đặt', path: '/settings' },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-6">
                    <h1 className="text-xl font-bold tracking-tight text-yellow-400">Movie Loyalty</h1>
                    <p className="text-xs text-slate-400 mt-1">Cổng Quản Trị</p>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                                location.pathname.startsWith(item.path)
                                    ? "bg-slate-800 text-yellow-400"
                                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center space-x-3 px-4 py-3">
                        <div className="flex-shrink-0">
                            <Link to="/vouchers" className={clsx("flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition-colors", location.pathname === '/vouchers' && "bg-slate-800 text-yellow-500")}>
                                <Gift size={20} />
                                <span>Vouchers</span>
                            </Link>
                            <Link to="/automation" className={clsx("flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition-colors", location.pathname === '/automation' && "bg-slate-800 text-yellow-500")}>
                                <Settings size={20} />
                                <span>Automation</span>
                            </Link>
                            <Link to="/validation" className={clsx("flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition-colors", location.pathname === '/validation' && "bg-slate-800 text-yellow-500")}>
                                <Check size={20} />
                                <span>Duyệt Deal</span>
                            </Link>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.email || 'Admin'}</p>
                            <p className="text-xs text-slate-500 truncate">{user.role || 'ROLE'}</p>
                        </div>
                        <button onClick={handleLogout} className="text-slate-400 hover:text-white" title="Đăng xuất">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Topbar */}
                <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8">
                    <div className="flex items-center bg-gray-100 rounded-md px-4 py-2 w-96">
                        <Search size={18} className="text-gray-400 mr-2" />
                        <input type="text" placeholder="Tìm SĐT, mã giao dịch..." className="bg-transparent border-none focus:outline-none text-sm w-full" />
                    </div>
                    <div className="flex items-center space-x-4">
                        <select className="text-sm border-none bg-gray-50 focus:ring-0 rounded-md px-3 py-1.5 cursor-pointer">
                            <option>Hôm nay</option>
                            <option>7 ngày qua</option>
                            <option>Tháng này</option>
                        </select>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
