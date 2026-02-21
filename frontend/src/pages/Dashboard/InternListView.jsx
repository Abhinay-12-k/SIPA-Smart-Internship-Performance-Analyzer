import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Search, ChevronRight, Mail, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const InternListView = ({ onViewReport }) => {
    const { user } = useAuth();
    const [interns, setInterns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchInterns = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                console.log("Fetching interns with token:", user.token);
                const res = await axios.get('http://localhost:5000/api/users/interns', config);
                console.log("Interns response data:", res.data);
                setInterns(res.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching interns:", error);
                alert("Failed to fetch interns. Check console for details.");
                setLoading(false);
            }
        };
        fetchInterns();
    }, [user]);

    const filteredInterns = interns.filter(i =>
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const cardThemes = [
        { card: 'glass-green', avatar: 'bg-green-100 text-green-600', btn: 'hover:bg-green-500 hover:text-white', icon: 'text-green-500' },
        { card: 'glass-yellow', avatar: 'bg-yellow-100 text-yellow-700', btn: 'hover:bg-yellow-500 hover:text-white', icon: 'text-yellow-600' },
        { card: 'glass-blue', avatar: 'bg-blue-100 text-blue-600', btn: 'hover:bg-blue-500 hover:text-white', icon: 'text-blue-500' },
        { card: 'glass-purple', avatar: 'bg-purple-100 text-purple-600', btn: 'hover:bg-purple-500 hover:text-white', icon: 'text-purple-500' },
        { card: 'glass-orange', avatar: 'bg-orange-100 text-orange-600', btn: 'hover:bg-orange-500 hover:text-white', icon: 'text-orange-500' }
    ];

    if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Intern Directory</h1>
                    <p className="text-slate-500">View and manage all active interns</p>
                </div>
                <div className="relative w-64">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search interns..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInterns.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500">
                        {searchTerm ? "No interns match your search." : "No interns found in the system. Register one to see them here."}
                    </div>
                ) : (
                    filteredInterns.map((intern, index) => {
                        const theme = cardThemes[index % cardThemes.length];
                        return (
                            <div key={intern._id} className={`${theme.card} glass-hover p-6 group transition-all duration-300 relative`}>
                                <div className="flex items-center mb-6">
                                    <div className={`w-14 h-14 rounded-2xl ${theme.avatar} flex items-center justify-center font-bold text-xl shadow-inner transition-transform duration-300 group-hover:scale-110`}>
                                        {intern.name.charAt(0)}
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="font-extrabold text-[#1e1b4b] text-lg">{intern.name}</h3>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Intern ID: {intern._id.slice(-6)}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center text-sm font-medium text-slate-600">
                                        <div className="p-1.5 bg-white/60 rounded-lg mr-3 shadow-sm">
                                            <Mail className={`w-4 h-4 ${theme.icon}`} />
                                        </div>
                                        {intern.email}
                                    </div>
                                    <div className="flex items-center text-sm font-medium text-slate-600">
                                        <div className="p-1.5 bg-white/60 rounded-lg mr-3 shadow-sm">
                                            <Calendar className={`w-4 h-4 ${theme.icon}`} />
                                        </div>
                                        Joined: {new Date(intern.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                <button
                                    onClick={() => onViewReport(intern)}
                                    className={`w-full py-3 bg-white/60 backdrop-blur-md text-slate-700 text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center border border-white/80 shadow-sm ${theme.btn}`}
                                >
                                    View Performance <ChevronRight className="w-4 h-4 ml-1" />
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default InternListView;
