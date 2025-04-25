import React from 'react';

function PersonalDetailsPage() {
  return (
    <div className="flex items-center justify-center min-h-screen w-screen bg-gradient-to-r from-yellow-500 to-orange-600">
      <div className="bg-white shadow-2xl rounded-lg py-4 px-6 sm:py-4 sm:px-8 md:py-4 md:px-10 w-full max-w-xl">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-6">Personal Details</h1>
        <p className="text-center text-gray-600 mb-8">
          Please provide your personal details and preferences to help us guide you towards the best career options.
        </p>
        <form className="space-y-6">
          <div className="flex flex-col">
            <label htmlFor="name" className="mb-2 text-sm font-medium text-gray-700">Full Name</label>
            <input
              id="name"
              type="text"
              required
              className="rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="age" className="mb-2 text-sm font-medium text-gray-700">Age</label>
            <input
              id="age"
              type="number"
              required
              className="rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="education" className="mb-2 text-sm font-medium text-gray-700">Highest Level of Education</label>
            <select
              id="education"
              required
              className="rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
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
              placeholder="List your skills separated by commas"
              className="rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
            ></textarea>
          </div>
          <div className="flex flex-col">
            <label htmlFor="interests" className="mb-2 text-sm font-medium text-gray-700">Areas of Interest</label>
            <textarea
              id="interests"
              rows="3"
              required
              placeholder="List your interests separated by commas"
              className="rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
            ></textarea>
          </div>
          <div className="flex flex-col">
            <label htmlFor="goals" className="mb-2 text-sm font-medium text-gray-700">Career Goals</label>
            <textarea
              id="goals"
              rows="3"
              required
              placeholder="Describe your career goals"
              className="rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
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