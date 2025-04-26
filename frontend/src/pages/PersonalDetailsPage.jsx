import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function PersonalDetailsPage() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [education, setEducation] = useState('');
  const [skills, setSkills] = useState('');
  const [interests, setInterests] = useState('');
  const [goals, setGoals] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    if (!token || !refreshToken) {
      alert('You are not logged in. Please log in to continue.');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No access token found. Please log in again.');
      }

      const response = await axios.post('http://127.0.0.1:8000/api/user/details/', {
        name,
        age,
        education,
        skills: skills.split(',').map(skill => skill.trim()),
        areas_of_interest: interests.split(',').map(interest => interest.trim()),
        career_goals: goals.split(',').map(goal => goal.trim()),
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert('Details submitted successfully!');
      navigate('/career-assess');
    } catch (error) {
      alert('Submission failed: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-screen bg-gradient-to-r from-yellow-500 to-orange-600">
      <div className="bg-white shadow-2xl rounded-lg py-4 px-6 sm:py-4 sm:px-8 md:py-4 md:px-10 w-full max-w-xl text-black">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-6">Personal Details</h1>
        <p className="text-center text-gray-600 mb-8">
          Please provide your personal details and preferences to help us guide you towards the best career options.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col">
            <label htmlFor="name" className="mb-2 text-sm font-medium text-gray-700">Full Name</label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition text-black"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="age" className="mb-2 text-sm font-medium text-gray-700">Age</label>
            <input
              id="age"
              type="number"
              required
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition text-black"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="education" className="mb-2 text-sm font-medium text-gray-700">Highest Level of Education</label>
            <select
              id="education"
              required
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              className="rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition text-black"
            >
              <option value="">Select</option>
              <option value="highschool">High School</option>
              <option value="bachelor">Bachelor's Degree</option>
              <option value="master">Master's Degree</option>
              <option value="phd">PhD</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="skills" className="mb-2 text-sm font-medium text-gray-700">Skills</label>
            <textarea
              id="skills"
              rows="3"
              required
              placeholder="Enter skills as a comma-separated list, e.g., Python, JavaScript"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition text-black"
            ></textarea>
          </div>
          <div className="flex flex-col">
            <label htmlFor="interests" className="mb-2 text-sm font-medium text-gray-700">Areas of Interest</label>
            <textarea
              id="interests"
              rows="3"
              required
              placeholder="Enter areas of interest as a comma-separated list, e.g., AI, Web Development"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              className="rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition text-black"
            ></textarea>
          </div>
          <div className="flex flex-col">
            <label htmlFor="goals" className="mb-2 text-sm font-medium text-gray-700">Career Goals</label>
            <textarea
              id="goals"
              rows="3"
              required
              placeholder="Enter career goals as a comma-separated list, e.g., Become a Data Scientist, Start a tech company"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              className="rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition text-black"
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition focus:ring-2 focus:ring-orange-500"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default PersonalDetailsPage;