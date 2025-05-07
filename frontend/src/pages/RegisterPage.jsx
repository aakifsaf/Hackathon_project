import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Placeholder for an icon
const RegisterIcon = () => (
  <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path></svg>
);

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/register/', {
        username,
        email,
        password,
      });

      // Assuming the register endpoint also returns tokens upon successful registration
      // If not, this part might need adjustment based on your API
      const { access_token, refresh_token } = response.data;
      if (!access_token || !refresh_token) {
        // If tokens are not expected here, but registration is successful,
        // you might just navigate to login without setting tokens.
        // For now, assuming tokens are provided similar to login for auto-login or profile setup.
        console.warn('Tokens not received on registration, but registration might be successful.');
        // Fallback or specific logic if tokens are not part of registration response
      }
      
      // Storing tokens if available, otherwise, this step can be conditional or removed
      if(access_token && refresh_token){
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
      }
      
      // Consider direct navigation to personal-details or a welcome/confirmation step
      // instead of immediate login, or auto-logging in if tokens are provided.
      alert('Registration successful! Please login to continue.'); // Kept original alert for now
      navigate('/login');

    } catch (err) {
      let errorMessage = 'Registration failed. Please try again.';
      if (err.response?.data) {
        const errors = err.response.data;
        if (errors.username) errorMessage = `Username: ${errors.username.join(', ')}`;
        else if (errors.email) errorMessage = `Email: ${errors.email.join(', ')}`;
        else if (errors.password) errorMessage = `Password: ${errors.password.join(', ')}`;
        else if (errors.error) errorMessage = errors.error;
        else if (typeof errors === 'string') errorMessage = errors;
      }
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, x: 50 }, // Enter from right
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -50 }, // Exit to left
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
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 order-2 lg:order-1">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md space-y-7"
        >
          <div className="text-center lg:text-left">
            <Link to="/" className="lg:hidden inline-block mb-6 text-3xl font-bold text-blue-600">
              CareerSphere
            </Link>
            <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-center lg:justify-start">
              <RegisterIcon />
              <span className="ml-2">Create Account</span>
            </h2>
            <p className="mt-2 text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
                Sign in here
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

          <form onSubmit={handleRegister} className="space-y-5">
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
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow shadow-sm text-gray-900"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow shadow-sm text-gray-900"
                placeholder="Min. 8 characters"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md hover:shadow-lg 
                ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'}`}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
          <p className="text-center text-xs text-gray-500">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="underline hover:text-blue-600">Terms of Service</Link> and{' '}
            <Link to="/privacy" className="underline hover:text-blue-600">Privacy Policy</Link>.
          </p>
        </motion.div>
      </div>
      
      {/* Right Side - Branding/Illustration */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-bl from-green-500 to-teal-600 items-center justify-center p-0 relative overflow-hidden order-1 lg:order-2">
        <motion.img 
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "circOut" }}
          src="https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
          alt="Register page illustration - person planning on a board"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/25 flex flex-col items-center justify-center p-12 text-center">
            <Link to="/" className="inline-block mb-8">
                <h1 className="text-5xl font-bold tracking-tight text-white filter drop-shadow-lg">CareerSphere</h1>
            </Link>
            <p className="text-xl max-w-md leading-relaxed text-white/90 filter drop-shadow-md">
                Join us and take the first step towards a fulfilling career. Let's build your future, together.
            </p>
        </div>
      </div>
    </motion.div>
  );
}

export default RegisterPage;
