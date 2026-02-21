import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, BarChart, ChevronRight, Clock, User as UserIcon, CheckCircle, PlusCircle, Award, Activity as ActivityIcon, RefreshCw, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import TopPerformersCard from '../../components/TopPerformersCard';

const AdminDashboard = ({ setActiveView }) => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            setRefreshing(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const [tasksRes, activityRes] = await Promise.all([
                axios.get('http://localhost:5000/api/tasks', config),
                axios.get('http://localhost:5000/api/activity', config)
            ]);
            setTasks(tasksRes.data);
            setActivities(activityRes.data);
            setLoading(false);
            setRefreshing(false);
        } catch (error) {
            console.error("Error fetching admin data:", error);
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const getActivityIcon = (action) => {
        switch (action) {
            case 'intern_registered':
            case 'registered': return <UserIcon className="w-4 h-4 text-blue-500" />;
            case 'task_created': return <PlusCircle className="w-4 h-4 text-green-500" />;
            case 'task_completed':
            case 'task_submitted': return <Clock className="w-4 h-4 text-orange-500" />;
            case 'task_graded': return <Award className="w-4 h-4 text-purple-500" />;
            case 'generated': return <Zap className="w-4 h-4 text-yellow-500" />;
            default: return <ActivityIcon className="w-4 h-4 text-slate-500" />;
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-2xl font-bold text-slate-800">Admin Overview</h1>
                <p className="text-slate-500">System-wide performance monitoring</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                    onClick={() => setActiveView('interns')}
                    className="card bg-slate-900 text-white border-slate-800 cursor-pointer hover:bg-slate-800 transition-all group"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-slate-800 rounded-lg group-hover:bg-slate-700 transition-colors">
                                <Users className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-400">Total System Interns</p>
                                <h3 className="text-2xl font-bold">Manage Interns</h3>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors" />
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <BarChart className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Tasks Tracked</p>
                            <h3 className="text-2xl font-bold text-slate-800">{tasks.length}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-800">Recent Activity Log</h2>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={fetchData}
                                    disabled={refreshing}
                                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-4 h-4 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
                                </button>
                                <span className="text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-600 rounded-full">Live Updates</span>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {loading ? (
                                <div className="p-12 text-center text-slate-400">Loading activities...</div>
                            ) : activities.length === 0 ? (
                                <div className="p-12 text-center text-slate-400">No recent activity found.</div>
                            ) : (
                                activities.slice(0, 6).map((activity) => (
                                    <div key={activity._id} className="p-4 hover:bg-slate-50 transition-colors flex items-start space-x-4">
                                        <div className="mt-1 p-2 bg-slate-50 rounded-lg">
                                            {getActivityIcon(activity.action)}
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex justify-between">
                                                <p className="text-sm text-slate-800 font-medium">
                                                    <span className="text-blue-600 font-bold">{activity.user?.name}</span>
                                                    <span className="mx-1">[{activity.role}]</span>
                                                    {activity.action.replace('_', ' ')}: {activity.entity}
                                                </p>
                                                <p className="text-xs text-slate-400">{formatTime(activity.createdAt)}</p>
                                            </div>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1">
                                                {activity.role} Activity
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <TopPerformersCard />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
