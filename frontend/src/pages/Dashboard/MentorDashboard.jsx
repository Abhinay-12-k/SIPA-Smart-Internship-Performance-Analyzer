import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, ClipboardList, CheckSquare, Plus, Search, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import TopPerformersCard from '../../components/TopPerformersCard';

const MentorDashboard = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [interns, setInterns] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'medium',
        deadline: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };

                // Fetch Tasks
                const tasksRes = await axios.get('http://localhost:5000/api/tasks', config);
                setTasks(tasksRes.data);

                // Fetch Interns
                const internsRes = await axios.get('http://localhost:5000/api/users/interns', config);
                setInterns(internsRes.data);
            } catch (error) {
                console.error("Error fetching data", error);
            }
        };
        fetchData();
    }, [user]);

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('http://localhost:5000/api/tasks', newTask, config);
            setShowCreateModal(false);
            // Refresh tasks
            const res = await axios.get('http://localhost:5000/api/tasks', config);
            setTasks(res.data);
            setNewTask({ title: '', description: '', assignedTo: '', priority: 'medium', deadline: '' });
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating task');
        }
    };

    const handleGradeTask = async (taskId, score, comment) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            // Formula requires innovationScore, but for now we use 0 as default if not prompted
            await axios.put(`http://localhost:5000/api/tasks/${taskId}`, { feedbackScore: score, feedbackComment: comment, innovationScore: 0 }, config);
            // Refresh tasks
            const res = await axios.get('http://localhost:5000/api/tasks', config);
            setTasks(res.data);
        } catch (error) {
            console.error("Error grading task", error);
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Mentor Dashboard</h1>
                    <p className="text-slate-500">Manage tasks and track intern performance</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-primary flex items-center"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Assign Task
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card relative overflow-hidden accent-blue">
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Assigned</p>
                            <p className="text-2xl font-bold text-slate-800">{tasks.length}</p>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <ClipboardList className="h-6 w-6 text-blue-500" />
                        </div>
                    </div>
                </div>

                <div className="card relative overflow-hidden accent-green">
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Completed</p>
                            <p className="text-2xl font-bold text-slate-800">{tasks.filter(t => t.status === 'completed').length}</p>
                        </div>
                        <div className="p-2 bg-green-50 rounded-lg">
                            <CheckSquare className="h-6 w-6 text-green-500" />
                        </div>
                    </div>
                </div>

                <div className="card relative overflow-hidden accent-purple">
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Interns</p>
                            <p className="text-2xl font-bold text-slate-800">{interns.length}</p>
                        </div>
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <Users className="h-6 w-6 text-purple-500" />
                        </div>
                    </div>
                </div>

                <div className="card relative overflow-hidden accent-orange">
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Pending Review</p>
                            <p className="text-2xl font-bold text-slate-800">{tasks.filter(t => t.status === 'completed' && !t.feedbackScore).length}</p>
                        </div>
                        <div className="p-2 bg-orange-50 rounded-lg">
                            <Clock className="h-6 w-6 text-orange-500" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-800">Assigned Tasks</h2>
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search tasks..."
                                    className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-600 text-sm">
                                        <th className="p-4 font-semibold">Title</th>
                                        <th className="p-4 font-semibold">Assigned To</th>
                                        <th className="p-4 font-semibold">Deadline</th>
                                        <th className="p-4 font-semibold">Status</th>
                                        <th className="p-4 font-semibold">Score</th>
                                        <th className="p-4 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {tasks
                                        .filter(task =>
                                            task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            (task.assignedTo?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
                                        )
                                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                        .slice(0, 5)
                                        .map(task => (
                                            <tr key={task._id} className="hover:bg-slate-50 transition-colors text-sm">
                                                <td className="p-4 font-medium text-slate-800">{task.title}</td>
                                                <td className="p-4 text-slate-600">
                                                    <div className="flex items-center">
                                                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold mr-2">
                                                            {task.assignedTo?.name?.charAt(0) || 'U'}
                                                        </div>
                                                        {task.assignedTo?.name || 'Unknown'}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-slate-600">{new Date(task.deadline).toLocaleDateString()}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${task.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {task.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-medium text-slate-800">
                                                    {task.feedbackScore ? (
                                                        <span className="text-green-600">{task.feedbackScore}/10</span>
                                                    ) : '-'}
                                                </td>
                                                <td className="p-4">
                                                    {task.status === 'completed' && !task.feedbackScore && (
                                                        <button
                                                            onClick={() => {
                                                                const score = prompt("Enter Score (0-10):");
                                                                const comment = prompt("Enter Feedback Comment:");
                                                                if (score) handleGradeTask(task._id, Number(score), comment);
                                                            }}
                                                            className="text-primary hover:underline font-medium"
                                                        >
                                                            Grade
                                                        </button>
                                                    )}
                                                    {task.feedbackScore && <span className="text-slate-400">Graded</span>}
                                                    {task.status === 'pending' && <span className="text-slate-400">Waiting</span>}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <TopPerformersCard />
                </div>
            </div>

            {/* Create Task Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 animate-fadeIn">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Assign New Task</h2>
                        <form onSubmit={handleCreateTask} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Task Title</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    required
                                    className="input-field min-h-[100px]"
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Assign To (Intern)</label>
                                    <select
                                        required
                                        className="input-field"
                                        value={newTask.assignedTo}
                                        onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                                    >
                                        <option value="">{interns.length === 0 ? "No Interns Found" : "Select Intern"}</option>
                                        {interns.map(intern => (
                                            <option key={intern._id} value={intern._id}>{intern.name} ({intern.email})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Deadline</label>
                                    <input
                                        type="date"
                                        required
                                        className="input-field"
                                        value={newTask.deadline}
                                        onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                                <select
                                    className="input-field"
                                    value={newTask.priority}
                                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    Assign Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MentorDashboard;
