import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Login API call
      const response = await axios.post('http://127.0.0.1:8000/api/login/', {
        username,
        password,
      });

      const { access_token, refresh_token } = response.data;
      if (!access_token || !refresh_token) {
        throw new Error('Tokens not received.');
      }

      // Save tokens
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      // Get user profile
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
      console.log('Profile data:', profileResponse.data);

      // Check if all personal details are filled
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
    } catch (error) {
      alert('Login failed: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden">
      <div className="flex flex-col md:flex-row bg-white shadow-2xl rounded-2xl overflow-hidden max-w-5xl w-full">
        
        {/* Left Section */}
        <div className="md:w-1/2 flex flex-col justify-between p-10 bg-gradient-to-b from-blue-700 to-purple-700 text-white">
          <div>
            <h1 className="text-4xl font-extrabold mb-4">Welcome to website!</h1>
            <p className="text-base mb-8 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.
            </p>
            <button className="bg-white text-blue-700 font-bold py-2 px-6 rounded-full hover:bg-gray-200 transition">
              Read more
            </button>
          </div>
          <div className="flex space-x-6 mt-8 text-sm font-medium">
            <a href="#" className="hover:underline">Facebook</a>
            <a href="#" className="hover:underline">Twitter</a>
            <a href="#" className="hover:underline">Gmail</a>
          </div>
        </div>

        {/* Right Section */}
        <div className="md:w-1/2 p-10 flex flex-col justify-center text-black">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Sign in</h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="flex flex-col">
              <label htmlFor="username" className="mb-2 text-sm font-medium text-gray-700">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition text-black"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="password" className="mb-2 text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition text-black"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition focus:ring-2 focus:ring-purple-500"
            >
              Login
            </button>
          </form>

          <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
            <a href="#" className="hover:underline">Forgot Password?</a>
            <p>
              Need an account?{' '}
              <a href="/register" className="text-purple-600 hover:underline">
                Signup here
              </a>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default LoginPage;
