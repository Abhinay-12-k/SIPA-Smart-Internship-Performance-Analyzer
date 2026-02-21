import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, TrendingUp, PieChart as PieIcon, Activity, Download, ChevronRight } from 'lucide-react';
import {
    ComposedChart,
    Area,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { useAuth } from '../../context/AuthContext';

const ReportsView = ({ targetIntern }) => {
    const { user } = useAuth();
    const [performance, setPerformance] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [aiFeedback, setAiFeedback] = useState(null);
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState(null);

    const reportUser = targetIntern || user;

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                setAiError(null);

                // 1. Fetch Performance Metrics
                const perfRes = await axios.get(`http://localhost:5000/api/performance/${reportUser._id}`, config);
                setPerformance(perfRes.data);

                // 2. Fetch Task History for the intern
                const tasksRes = await axios.get(`http://localhost:5000/api/tasks`, config);
                // Filter tasks for this specific intern
                const internTasks = tasksRes.data.filter(t => t.assignedTo?._id === reportUser._id || t.assignedTo === reportUser._id);
                setTasks(internTasks);

                setLoading(false);

                // 3. Fetch AI Feedback (in background)
                setAiLoading(true);
                try {
                    const aiRes = await axios.post(`http://localhost:5000/api/ai-feedback/${reportUser._id}`, {}, config);
                    setAiFeedback(aiRes.data);
                } catch (err) {
                    console.error("AI Error:", err);
                    setAiError(err.response?.data?.message || err.message);
                } finally {
                    setAiLoading(false);
                }

            } catch (error) {
                console.error("Error fetching reports data", error);
                setLoading(false);
            }
        };
        fetchAllData();
    }, [user, reportUser]);

    // Prepare chart data for Bar Chart
    const barData = tasks
        .filter(t => t.status === 'completed' && t.feedbackScore !== undefined)
        .slice(-10)
        .map((task, index) => ({
            name: `T${index + 1}`,
            score: task.feedbackScore,
            fullTitle: task.title,
            color: task.feedbackScore >= 8 ? '#1e293b' : task.feedbackScore >= 6 ? '#64748b' : '#94a3b8'
        }));

    // Gauge Data (Semi-circle)
    const efficiencyValue = performance?.overallScore || 0;
    const gaugeData = [
        { name: 'Value', value: efficiencyValue },
        { name: 'Remaining', value: 100 - efficiencyValue }
    ];
    const GAUGE_COLORS = ['#3f6212', '#4d7c0f', '#a16207', '#7f1d1d']; // Darker variants of Green, Yellow, Orange, Red

    if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div>
                    <h1 className="text-xl font-bold text-slate-400">Dashboard <span className="text-slate-200">/</span> <span className="text-black">Analytics</span></h1>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-slate-600 uppercase tracking-wider">{reportUser.role}</span>
                    <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
                        {reportUser.name?.charAt(0) || 'U'}
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Bar Chart Card */}
                <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-50 min-h-[400px]">
                    <div className="h-full flex flex-col">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={barData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#166534" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#166534" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={{ stroke: '#e2e8f0' }}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                />
                                <YAxis
                                    domain={[0, 10]}
                                    axisLine={{ stroke: '#e2e8f0' }}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    ticks={[0, 2, 4, 6, 8, 10]}
                                />
                                <Tooltip
                                    cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [`${value}/10`, 'Score']}
                                    labelFormatter={(name, props) => props[0]?.payload?.fullTitle || name}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="score"
                                    stroke="none"
                                    fillOpacity={1}
                                    fill="url(#colorScore)"
                                    tooltipType="none"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#166534"
                                    strokeWidth={3}
                                    dot={{ fill: '#16a34a', stroke: '#fff', strokeWidth: 2, r: 6 }}
                                    activeDot={{ r: 8, fill: '#166534', stroke: '#fff', strokeWidth: 2 }}
                                />
                                <Bar
                                    dataKey="score"
                                    barSize={8}
                                    radius={[2, 2, 2, 2]}
                                    fill="#e2e8f0"
                                    tooltipType="none"
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right: Gauge Chart Card - Vertical Stacked Layout */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-50 flex flex-col items-center justify-center relative overflow-hidden">
                    {/* Top: Dynamic Percentage and Label */}
                    <div className="flex flex-col items-center mb-6">
                        <h2
                            className="text-5xl font-bold leading-none transition-colors duration-500"
                            style={{
                                color: efficiencyValue >= 75 ? '#16a34a' : efficiencyValue >= 50 ? '#ea580c' : '#dc2626'
                            }}
                        >
                            {Math.round(efficiencyValue)}%
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">
                            Overall Efficiency
                        </p>
                    </div>

                    {/* Bottom: Original Gauge Meter - Increased size and thickness */}
                    <div className="relative w-full flex justify-center -mt-4">
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie
                                    data={[
                                        { value: 25 }, { value: 25 }, { value: 25 }, { value: 25 }
                                    ]}
                                    cx="50%"
                                    cy="80%"
                                    startAngle={180}
                                    endAngle={0}
                                    innerRadius={85}
                                    outerRadius={130}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    <Cell fill="#166534" /> {/* Green */}
                                    <Cell fill="#eab308" /> {/* Yellow */}
                                    <Cell fill="#ea580c" /> {/* Orange */}
                                    <Cell fill="#991b1b" /> {/* Red */}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Gauge Pointer Pin & Needle */}
                        <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 flex flex-col items-center">
                            <div className="w-4 h-4 rounded-full bg-slate-700 border-2 border-white z-10 shadow-sm relative"></div>
                            <div
                                className="w-1.5 h-32 bg-slate-700 absolute bottom-2 origin-bottom transition-transform duration-1000 ease-out z-10"
                                style={{ transform: `rotate(${(efficiencyValue / 100) * 180 - 90}deg)` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom: Status Metric Cards */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {[
                        { label: 'Task Completion', value: performance?.completionRate || 0, color: 'bg-green-700' },
                        { label: 'Avg. Feedback', value: (performance?.averageFeedbackScore || 0) * 10, color: 'bg-yellow-500' },
                        { label: 'Deadline Discipline', value: performance?.deadlineDiscipline || 0, color: 'bg-orange-600' },
                        { label: 'Overall Efficiency', value: performance?.overallScore || 0, color: 'bg-red-800' }
                    ].map((metric, idx) => (
                        <div key={idx} className="space-y-2">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-semibold text-slate-700">{metric.label}</span>
                                <span className="text-sm font-bold text-slate-900">{Math.round(metric.value)}%</span>
                            </div>
                            <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${metric.color} transition-all duration-1000`}
                                    style={{ width: `${metric.value}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI Coaching Section - Refactored for Glassmorphism */}
            <div className="glass-green glass-hover p-10 text-slate-800 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row gap-12">
                    <div className="flex-1 space-y-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <BarChart3 className="w-6 h-6 text-[#10b981]" />
                            </div>
                            <h3 className="text-xl font-bold text-[#1e1b4b]">AI Performance Coaching</h3>
                        </div>
                        {aiLoading ? (
                            <div className="animate-pulse flex space-x-2 items-center p-4">
                                <div className="h-2 w-2 bg-[#10b981] rounded-full animate-bounce"></div>
                                <div className="h-2 w-2 bg-[#10b981] rounded-full animate-bounce delay-100"></div>
                                <div className="h-2 w-2 bg-[#10b981] rounded-full animate-bounce delay-200"></div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {aiError ? (
                                    <p className="text-red-600 text-sm bg-red-50 p-4 rounded-xl border border-red-100">
                                        ⚠️ {aiError}
                                    </p>
                                ) : (
                                    <p className="text-[#4b5563] text-base leading-relaxed max-w-xl">
                                        {aiFeedback?.summary || "Analyzing metrics to provide growth insights..."}
                                    </p>
                                )}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#10b981]">Roadmap & Growth</h4>
                                    <div className="grid grid-cols-1 gap-3">
                                        {(aiFeedback?.roadmap || ["Awaiting data...", "Complete more tasks"]).map((item, i) => (
                                            <div key={i} className="flex items-center space-x-4 bg-white/40 p-4 rounded-xl border border-white/60 shadow-sm">
                                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-[#10b981]">{i + 1}</div>
                                                <span className="text-slate-600 font-medium">
                                                    {typeof item === 'object' ? (item.description || item.area || JSON.stringify(item)) : item}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="w-full md:w-80 space-y-8 bg-white/30 p-6 rounded-2xl border border-white/40 backdrop-blur-sm">
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-[#1e1b4b] flex items-center">
                                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                                Key Strengths
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {(aiFeedback?.strengths || ["Analyzing"]).map((s, i) => (
                                    <span key={i} className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-[11px] font-bold border border-green-100 shadow-sm">
                                        {typeof s === 'object' ? (s.description || s.area || JSON.stringify(s)) : s}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4 border-t border-white/40 pt-6">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-[#1e1b4b] flex items-center">
                                <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
                                Focus Areas
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {(aiFeedback?.weaknesses || ["Analyzing"]).map((w, i) => (
                                    <span key={i} className="px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-[11px] font-bold border border-amber-100 shadow-sm">
                                        {typeof w === 'object' ? (w.description || w.area || JSON.stringify(w)) : w}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsView;
