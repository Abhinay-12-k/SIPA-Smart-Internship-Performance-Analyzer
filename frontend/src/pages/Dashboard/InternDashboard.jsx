import { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle2, Clock, BarChart2, Award, Zap, CheckSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import TopPerformersCard from '../../components/TopPerformersCard';

const InternDashboard = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [performance, setPerformance] = useState(null);
    const [aiFeedback, setAiFeedback] = useState(null);
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                // Fetch Tasks
                const tasksRes = await axios.get('http://localhost:5000/api/tasks', config);
                setTasks(tasksRes.data);
                // Fetch Performance
                const perfRes = await axios.get(`http://localhost:5000/api/performance/${user._id}`, config);
                setPerformance(perfRes.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const handleTaskCompletion = async (taskId) => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            await axios.put(`http://localhost:5000/api/tasks/${taskId}`, { status: 'completed' }, config);
            // Refresh tasks
            const tasksRes = await axios.get('http://localhost:5000/api/tasks', config);
            setTasks(tasksRes.data);
            // Refresh performance
            const perfRes = await axios.get(`http://localhost:5000/api/performance/${user._id}`, config);
            setPerformance(perfRes.data);
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    const getAiFeedback = async () => {
        setAiLoading(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            setAiError(null);

            const res = await axios.post(`http://localhost:5000/api/ai-feedback/${user._id}`, {}, config);
            setAiFeedback(res.data);
            setAiLoading(false);
        } catch (error) {
            console.error("Error getting AI feedback:", error);
            setAiError(error.response?.data?.message || "AI Service unavailable");
            setAiLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    }

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-2xl font-bold text-slate-800">Hello, {user.name} 👋</h1>
                <p className="text-slate-500">Here's your performance overview for today.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card relative overflow-hidden accent-blue">
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Overall Score</p>
                            <p className="text-2xl font-bold text-slate-800">{performance?.overallScore || 0}/100</p>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Award className="h-6 w-6 text-blue-500" />
                        </div>
                    </div>
                </div>
                <div className="card relative overflow-hidden accent-green">
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Completion Rate</p>
                            <p className="text-2xl font-bold text-slate-800">{performance?.completionRate || 0}%</p>
                        </div>
                        <div className="p-2 bg-green-50 rounded-lg">
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                        </div>
                    </div>
                </div>
                <div className="card relative overflow-hidden accent-purple">
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Avg. Feedback</p>
                            <p className="text-2xl font-bold text-slate-800">{performance?.averageFeedbackScore || 0}/10</p>
                        </div>
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <BarChart2 className="h-6 w-6 text-purple-500" />
                        </div>
                    </div>
                </div>
                <div className="card relative overflow-hidden accent-orange">
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Pending Tasks</p>
                            <p className="text-2xl font-bold text-slate-800">{Array.isArray(tasks) ? tasks.filter(t => t.status === 'pending').length : 0}</p>
                        </div>
                        <div className="p-2 bg-orange-50 rounded-lg">
                            <Clock className="h-6 w-6 text-orange-500" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Tasks List */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center">
                        <CheckSquare className="w-5 h-5 mr-2 text-primary" />
                        Active Tasks
                    </h2>
                    <div className="space-y-4">
                        {!Array.isArray(tasks) || tasks.length === 0 ? (
                            <p className="text-slate-500">No tasks assigned yet.</p>
                        ) : (
                            tasks.map(task => (
                                <div key={task._id} className="card hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <h3 className="font-semibold text-slate-800">{task.title}</h3>
                                                <span className={`px-2 py-0.5 text-xs rounded-full ${task.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-green-100 text-green-700'
                                                    }`}>
                                                    {task.priority}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                                            <p className="text-xs text-slate-400 mt-2">Deadline: {new Date(task.deadline).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            {task.status === 'completed' ? (
                                                <span className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                                                    <CheckCircle2 className="w-4 h-4 mr-1" /> Completed
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleTaskCompletion(task._id)}
                                                    className="btn btn-primary text-sm"
                                                >
                                                    Mark Done
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {task.feedbackScore && (
                                        <div className="mt-4 pt-4 border-t border-slate-100">
                                            <p className="text-sm text-slate-600">
                                                <span className="font-medium text-slate-800">Feedback:</span> {task.feedbackScore}/10 - {task.feedbackComment || "No comment"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-1 space-y-8">
                    {/* AI Feedback Section - Refactored for Glassmorphism */}
                    <div className="glass-green glass-hover p-8 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <h2 className="text-xl font-bold flex items-center text-slate-800">
                                <Zap className="w-6 h-6 mr-2 text-[#10b981]" />
                                AI Coach
                            </h2>
                            <button
                                onClick={getAiFeedback}
                                disabled={aiLoading}
                                className="btn-green-pill"
                            >
                                {aiLoading ? (
                                    <div className="flex items-center">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                        Thinking...
                                    </div>
                                ) : 'Analyze Me'}
                            </button>
                        </div>

                        {aiError && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-start">
                                <span className="mr-2">⚠️</span>
                                {aiError}
                            </div>
                        )}

                        {!aiFeedback ? (
                            <div className="text-center py-10">
                                <p className="text-slate-500 max-w-[240px] mx-auto text-sm leading-relaxed">
                                    Click "Analyze Me" to get personalized performance insights and a roadmap for growth.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6 text-sm animate-fadeIn relative z-10">
                                <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-5 border border-white/60">
                                    <p className="font-bold text-[#10b981] mb-2 uppercase tracking-wider text-[11px]">Summary</p>
                                    <p className="text-[#4b5563] leading-relaxed text-sm">{aiFeedback.summary}</p>
                                </div>
                                <div className="space-y-3 px-2">
                                    <p className="font-bold text-[#1e1b4b] flex items-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></div>
                                        Strengths
                                    </p>
                                    <ul className="space-y-2">
                                        {aiFeedback.strengths.map((s, i) => (
                                            <li key={i} className="text-slate-600 flex items-start">
                                                <span className="text-green-500 mr-2">✓</span>
                                                {typeof s === 'object' ? (s.description || s.area || JSON.stringify(s)) : s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="space-y-3 px-2">
                                    <p className="font-bold text-[#1e1b4b] flex items-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></div>
                                        🚀 Growth Roadmap
                                    </p>
                                    <ul className="space-y-3">
                                        {aiFeedback.roadmap.map((item, i) => (
                                            <li key={i} className="flex items-start bg-white/30 p-3 rounded-xl border border-white/40">
                                                <span className="font-bold text-[#10b981] mr-3">{i + 1}.</span>
                                                <span className="text-slate-600 leading-relaxed font-medium">
                                                    {typeof item === 'object' ? (item.description || item.area || JSON.stringify(item)) : item}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Top Performers Leaderboard */}
                    <TopPerformersCard />
                </div>
            </div>
        </div>
    );
};

export default InternDashboard;