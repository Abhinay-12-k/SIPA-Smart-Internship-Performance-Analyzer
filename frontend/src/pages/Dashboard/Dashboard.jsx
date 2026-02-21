import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, LayoutDashboard, CheckSquare, Users, BarChart3, Menu, X } from 'lucide-react';
import InternDashboard from './InternDashboard';
import MentorDashboard from './MentorDashboard';
import AdminDashboard from './AdminDashboard';
import InternListView from './InternListView';
import ReportsView from './ReportsView';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeView, setActiveView] = useState('dashboard'); // 'dashboard', 'tasks', 'interns', 'reports'
    const [selectedIntern, setSelectedIntern] = useState(null);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const navigateToReport = (intern) => {
        setSelectedIntern(intern);
        setActiveView('reports');
    };

    const getDashboardComponent = () => {
        if (activeView === 'reports') return <ReportsView targetIntern={selectedIntern} />;
        if (activeView === 'interns' && user?.role !== 'intern') return <InternListView onViewReport={navigateToReport} />;
        if (activeView === 'tasks' && user?.role === 'intern') return <InternDashboard />;

        switch (user?.role) {
            case 'admin':
                return <AdminDashboard setActiveView={setActiveView} />;
            case 'mentor':
                return <MentorDashboard />;
            case 'intern':
                return <InternDashboard />;
            default:
                return <div>Role not recognized</div>;
        }
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <LayoutDashboard className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-slate-800">SIPA</span>
                    </div>
                    <button onClick={toggleSidebar} className="lg:hidden p-1 rounded-md hover:bg-slate-100">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-4">
                    <div className="mb-8">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Menu</p>
                        <nav className="space-y-1">
                            <button
                                onClick={() => { setActiveView('dashboard'); setIsSidebarOpen(false); }}
                                className={`flex items-center w-full px-4 py-2.5 rounded-lg group transition-colors ${activeView === 'dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                <LayoutDashboard className={`mr-3 h-5 w-5 ${activeView === 'dashboard' ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                <span className="font-medium">Dashboard</span>
                            </button>

                            {user?.role === 'intern' && (
                                <button
                                    onClick={() => { setActiveView('tasks'); setIsSidebarOpen(false); }}
                                    className={`flex items-center w-full px-4 py-2.5 rounded-lg group transition-colors ${activeView === 'tasks' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <CheckSquare className={`mr-3 h-5 w-5 ${activeView === 'tasks' ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                    <span className="font-medium">My Tasks</span>
                                </button>
                            )}

                            {user?.role !== 'intern' && (
                                <button
                                    onClick={() => { setActiveView('interns'); setIsSidebarOpen(false); }}
                                    className={`flex items-center w-full px-4 py-2.5 rounded-lg group transition-colors ${activeView === 'interns' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <Users className={`mr-3 h-5 w-5 ${activeView === 'interns' ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                    <span className="font-medium">Interns</span>
                                </button>
                            )}

                            <button
                                onClick={() => { setActiveView('reports'); setIsSidebarOpen(false); }}
                                className={`flex items-center w-full px-4 py-2.5 rounded-lg group transition-colors ${activeView === 'reports' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                <BarChart3 className={`mr-3 h-5 w-5 ${activeView === 'reports' ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                <span className="font-medium">Reports</span>
                            </button>
                        </nav>
                    </div>
                </div>

                <div className="absolute bottom-0 w-full p-4 border-t border-slate-100 bg-white">
                    <div className="flex items-center mb-4">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-slate-800">{user?.name}</p>
                            <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="mr-3 h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
                    onClick={toggleSidebar}
                ></div>
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white shadow-sm border-b border-slate-200 lg:hidden user-select-none">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <LayoutDashboard className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-slate-800">SIPA</span>
                        </div>
                        <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-slate-100">
                            <Menu className="w-6 h-6 text-slate-600" />
                        </button>
                    </div>
                </header>

                <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                    {getDashboardComponent()}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
