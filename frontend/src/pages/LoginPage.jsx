import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Placeholder for an icon, e.g., from react-icons
const LoginIcon = () => (
  <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
);

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // For displaying errors in the UI
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login/', {
        username,
        password,
      });

      const { access_token, refresh_token } = response.data;
      if (!access_token || !refresh_token) {
        setError('Login failed: Tokens not received.');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      const profileResponse = await axios.get('http://127.0.0.1:8000/api/user/details/', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const {
        full_name,
        age,
        highest_education,
        skills,
        interests,
        career_goals,
      } = profileResponse.data;

      const isProfileComplete =
        full_name &&
        age &&
        highest_education &&
        Array.isArray(skills) && skills.length > 0 &&
        Array.isArray(interests) && interests.length > 0 &&
        Array.isArray(career_goals) && career_goals.length > 0;

      if (isProfileComplete) {
        navigate('/career-guidance');
      } else {
        navigate('/personal-details');
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || 'Login failed. Please check your credentials.');
      setIsLoading(false);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, x: -50 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: 50 },
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5,
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="min-h-screen flex bg-gray-50 font-sans"
    >
      {/* Left Side - Branding/Illustration */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 items-center justify-center p-0 relative overflow-hidden">
        <motion.img 
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "circOut" }}
          src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
          alt="Login page illustration - professionals collaborating"
          className="w-full h-full object-cover"
        />
        {/* Overlaying a subtle gradient for text legibility if needed, or a logo */}
        <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center p-12 text-center">
            <Link to="/" className="inline-block mb-8">
                <h1 className="text-5xl font-bold tracking-tight text-white filter drop-shadow-lg">CareerSphere</h1>
            </Link>
            <p className="text-xl max-w-md leading-relaxed text-white/90 filter drop-shadow-md">
                Welcome back! Sign in to continue your journey towards career excellence.
            </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center lg:text-left">
            <Link to="/" className="lg:hidden inline-block mb-6 text-3xl font-bold text-blue-600">
              CareerSphere
            </Link>
            <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-center lg:justify-start">
              <LoginIcon /> 
              <span className="ml-2">Sign In</span>
            </h2>
            <p className="mt-2 text-gray-600">
              New to CareerSphere?{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
                Create an account
              </Link>
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{opacity: 0, y: -10}}
              animate={{opacity:1, y:0}}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm"
              role="alert"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow shadow-sm text-gray-900"
                placeholder="your_username"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                {/* <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">Forgot password?</Link> */}
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow shadow-sm text-gray-900"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md hover:shadow-lg 
                ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'}`}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          
          <p className="text-center text-sm text-gray-500">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="underline hover:text-blue-600">Terms</Link> and{' '}
            <Link to="/privacy" className="underline hover:text-blue-600">Privacy Policy</Link>.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default LoginPage;
