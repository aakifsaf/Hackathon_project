import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/register/', {
        username,
        email,
        password,
      });
      alert('Registration successful! Redirecting to login page.');
      navigate('/login');
    } catch (error) {
      alert('Registration failed: ' + error.response.data.error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-gradient-to-r from-green-500 to-blue-600 overflow-hidden">
      <div className="flex flex-col md:flex-row bg-white shadow-2xl rounded-2xl overflow-hidden max-w-5xl w-full">
        {/* Left Section */}
        <div className="md:w-1/2 flex flex-col justify-between p-10 bg-gradient-to-b from-green-700 to-blue-700 text-white">
          <div>
            <h1 className="text-4xl font-extrabold mb-4">Join Us Today!</h1>
            <p className="text-base mb-8 leading-relaxed">
              Create an account to explore amazing features and opportunities tailored just for you.
            </p>
            <button className="bg-white text-green-700 font-bold py-2 px-6 rounded-full hover:bg-gray-200 transition">
              Learn More
            </button>
          </div>
          <div className="flex space-x-6 mt-8 text-sm font-medium">
            <a href="#" className="hover:underline">Facebook</a>
            <a href="#" className="hover:underline">Twitter</a>
            <a href="#" className="hover:underline">LinkedIn</a>
          </div>
        </div>

        {/* Right Section */}
        <div className="md:w-1/2 p-10 flex flex-col justify-center text-black">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Sign Up</h2>
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="flex flex-col">
              <label htmlFor="username" className="mb-2 text-sm font-medium text-gray-700">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-black"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="email" className="mb-2 text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-black"
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
                className="rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-black"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition focus:ring-2 focus:ring-blue-500"
            >
              Register
            </button>
          </form>

          <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
            <p>
              Already have an account?{' '}
              <a href="/login" className="text-blue-600 hover:underline">
                Login here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
