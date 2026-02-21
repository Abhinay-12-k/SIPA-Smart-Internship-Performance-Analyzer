import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await login(email, password);

        if (!result.success) {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold text-slate-800 tracking-tight">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Sign in to access your SIPA dashboard
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm flex items-center gap-2">
                        <span>⚠️</span> {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                required
                                className="input-field pl-10 py-3"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="input-field pl-10 py-3"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md transition-all duration-200"
                        >
                            Sign in
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </form>

                <div className="text-center text-sm">
                    <p className="text-slate-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-medium text-primary hover:text-blue-500 transition-colors">
                            Sign up free
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
