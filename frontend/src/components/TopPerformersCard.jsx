import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Medal, Star, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TopPerformersCard = () => {
    const { user } = useAuth();
    const [performers, setPerformers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopPerformers = async () => {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                const res = await axios.get('http://localhost:5000/api/performance/top', config);
                setPerformers(res.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching top performers", error);
                setLoading(false);
            }
        };

        fetchTopPerformers();
    }, [user.token]);

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1:
                return <Trophy className="w-5 h-5 text-yellow-500" />;
            case 2:
                return <Medal className="w-5 h-5 text-slate-400" />;
            case 3:
                return <Medal className="w-5 h-5 text-amber-600" />;
            default:
                return <Star className="w-4 h-4 text-slate-300" />;
        }
    };

    const getRankColor = (rank) => {
        switch (rank) {
            case 1: return 'bg-yellow-50 border-yellow-100';
            case 2: return 'bg-slate-50 border-slate-100';
            case 3: return 'bg-amber-50 border-amber-100';
            default: return 'bg-white border-transparent';
        }
    };

    if (loading) {
        return (
            <div className="glass-lavender glass-hover h-[400px] p-8 animate-pulse overflow-hidden">
                <div className="h-8 bg-white/40 rounded-xl w-1/3 mb-8"></div>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-16 bg-white/20 rounded-2xl border border-white/30"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="glass-lavender glass-hover p-8 relative overflow-hidden">
            <div className="flex justify-between items-center mb-8 relative z-10">
                <h2 className="text-xl font-bold text-[#1e1b4b] flex items-center">
                    <Trophy className="w-6 h-6 mr-3 text-yellow-500" />
                    Top Performers
                </h2>
                <div className="flex items-center space-x-2 px-3 py-1 bg-white/60 backdrop-blur-md rounded-full border border-white/80 shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Live</span>
                </div>
            </div>

            <div className="space-y-4 relative z-10">
                {performers.length > 0 ? (
                    performers.map((performer) => {
                        const isSelf = user.role === 'intern' && performer.id === user.id;
                        return (
                            <div
                                key={performer.id}
                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 group ${performer.rank === 1
                                    ? 'bg-amber-50 border-amber-200/70 shadow-sm'
                                    : 'bg-white border-white/60 hover:bg-white/90'
                                    } ${isSelf ? 'ring-2 ring-indigo-500/20 shadow-md' : ''}`}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-transform duration-300 group-hover:scale-110 ${performer.rank === 1 ? 'bg-yellow-100 text-yellow-700 shadow-inner' : 'bg-slate-50 text-slate-400'
                                        }`}>
                                        {performer.rank}
                                    </div>
                                    <div>
                                        <p className={`font-bold text-sm ${isSelf ? 'text-indigo-600' : 'text-slate-800'}`}>
                                            {performer.name} {isSelf && <span className="text-[10px] ml-1 px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-full font-bold">YOU</span>}
                                        </p>
                                        {performer.rank === 1 && (
                                            <div className="flex items-center mt-0.5">
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Performance Leader</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="text-right">
                                        <p className="font-black text-slate-800 text-sm">{performer.score}%</p>
                                        <div className="w-20 h-1.5 bg-slate-100/50 rounded-full overflow-hidden mt-1.5">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${performer.score > 80 ? 'bg-green-500' : performer.score > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                style={{ width: `${performer.score}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="p-2 bg-white/60 rounded-xl shadow-sm border border-white/80">
                                        {getRankIcon(performer.rank)}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <div className="w-16 h-16 bg-white/40 rounded-3xl flex items-center justify-center mb-4 border border-white/60 shadow-inner">
                            <User className="w-8 h-8 opacity-20" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest">Awaiting Rankings</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TopPerformersCard;
