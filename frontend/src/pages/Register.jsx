import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Mail, Briefcase, ArrowRight } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'intern'
    });
    const [error, setError] = useState('');

    const { register, user } = useAuth();
    const navigate = useNavigate();

    const { name, email, password, role } = formData;

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const result = await register(name, email, password, role);

        if (!result.success) {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold text-slate-800 tracking-tight">
                        Create an account
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Join SIPA to track your performance
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
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="input-field pl-10 py-3"
                                placeholder="Full Name"
                                value={name}
                                onChange={onChange}
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="input-field pl-10 py-3"
                                placeholder="Email address"
                                value={email}
                                onChange={onChange}
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
                                onChange={onChange}
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Briefcase className="h-5 w-5 text-slate-400" />
                            </div>
                            <select
                                id="role"
                                name="role"
                                className="input-field pl-10 py-3 appearance-none bg-white"
                                value={role}
                                onChange={onChange}
                            >
                                <option value="intern">Intern</option>
                                <option value="mentor">Mentor</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md transition-all duration-200"
                        >
                            Sign up
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </form>

                <div className="text-center text-sm">
                    <p className="text-slate-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-primary hover:text-blue-500 transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
