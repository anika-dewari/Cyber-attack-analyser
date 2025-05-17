import React, { useState } from 'react';

export default function Signup() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your signup logic here
    alert('Signup submitted!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0B14] px-6">
      <div className="max-w-md w-full bg-[#1A1D24] p-8 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold text-cyan-400 mb-6 text-center">Create Account</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-gray-300 mb-2 font-medium">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-xl bg-[#0f121a] text-white shadow-inner shadow-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
              placeholder="Your username"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-300 mb-2 font-medium">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-xl bg-[#0f121a] text-white shadow-inner shadow-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-300 mb-2 font-medium">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-xl bg-[#0f121a] text-white shadow-inner shadow-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
              placeholder="********"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-gray-300 mb-2 font-medium">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-xl bg-[#0f121a] text-white shadow-inner shadow-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-cyan-400 to-teal-700 font-extrabold rounded-2xl text-[#0f1117] shadow-lg shadow-cyan-500/70 hover:from-cyan-300 hover:to-teal-600 hover:scale-105 transition-transform duration-300"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-gray-400 text-center">
          Already have an account?{' '}
          <a href="/login" className="text-cyan-400 hover:underline">
            Log In
          </a>
        </p>
      </div>
    </div>
  );
}
