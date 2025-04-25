import React from 'react';

function LoginPage() {
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
        <div className="md:w-1/2 p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Sign in</h2>
          <form className="space-y-6">
            <div className="flex flex-col">
              <label htmlFor="email" className="mb-2 text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                type="email"
                required
                className="rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="password" className="mb-2 text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                type="password"
                required
                className="rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
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
