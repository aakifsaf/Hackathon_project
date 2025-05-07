import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Placeholder for an icon
const ProfileIcon = () => (
  <svg className="w-8 h-8 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
);

function PersonalDetailsPage() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [education, setEducation] = useState('');
  const [skills, setSkills] = useState('');
  const [interests, setInterests] = useState('');
  const [goals, setGoals] = useState('');
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      // Using a more integrated error display rather than alert
      setError('You are not logged in. Please log in to submit details.');
      // Optionally, redirect to login after a delay or provide a login link
      // navigate('/login'); // This would be too abrupt
    }
    // Initial data fetch can be added here if needed
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Authentication error. Please log in again.');
      setIsSubmitting(false);
      return;
    }

    try {
      const profileData = {
        full_name: name,
        age: parseInt(age, 10), // Ensure age is an integer
        highest_education: education,
        skills: skills.split(',').map(skill => skill.trim()).filter(s => s!==''),
        interests: interests.split(',').map(interest => interest.trim()).filter(i => i!==''),
        career_goals: goals.split(',').map(goal => goal.trim()).filter(g => g!==''),
      };

      // Validate that arrays are not empty after splitting and filtering
      if (profileData.skills.length === 0 || profileData.interests.length === 0 || profileData.career_goals.length === 0) {
        setError('Please provide at least one entry for Skills, Interests, and Career Goals.');
        setIsSubmitting(false);
        return;
      }

      const profileResponse = await axios.post('http://127.0.0.1:8000/api/user/details/', profileData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Using data from initial submission for career assessment, as profileResponse might transform it
      // Or, if API guarantees these fields in response and they are preferred, use profileResponse.data
      const assessmentData = {
        skills: profileData.skills, // Use skills from form
        interests: profileData.interests, // Use interests from form
        career_goals: profileData.career_goals, // Use goals from form
      };

      // The check for skills2, interests2, goals2 existing in profileResponse.data might be redundant
      // if we trust the input data or if the `/api/career-assess/` endpoint can handle potentially empty arrays (filtered above).
      // Retaining a similar check but on assessmentData directly:
      if (!assessmentData.skills?.length || !assessmentData.interests?.length || !assessmentData.career_goals?.length) {
        setError('Profile data seems incomplete for career assessment. Ensure Skills, Interests, and Goals are filled.');
        setIsSubmitting(false);
        return;
      }

      await axios.post('http://127.0.0.1:8000/api/career-assess/', assessmentData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Consider a success message component instead of alert
      alert('Personal details submitted successfully! Proceeding to career assessment.'); // Original alert
      navigate('/career-assess');

    } catch (err) {
      let errorMessage = 'Submission failed. Please try again.';
      if (err.response?.data) {
        const errors = err.response.data;
        if (typeof errors === 'string') {
          errorMessage = errors;
        } else if (errors.error) {
          errorMessage = errors.error;
        } else {
          // Handle more structured errors, e.g., field-specific errors
          const fieldErrors = Object.values(errors).flat().join(' ');
          if (fieldErrors) errorMessage = fieldErrors;
        }
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 50 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -50 },
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.6,
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 py-8 px-4 sm:px-6 lg:px-8 font-sans"
    >
      <div className="max-w-2xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
          className="text-center mb-10"
        >
          <Link to="/" className="inline-block mb-4 text-4xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
            CareerSphere
          </Link>
          <h2 className="text-3xl font-semibold text-gray-800 flex items-center justify-center">
            <ProfileIcon />
            <span className="ml-3">Tell Us About Yourself</span>
          </h2>
          <p className="mt-3 text-gray-600">
            Your information helps us tailor career suggestions for you.
          </p>
        </motion.div>

        {error && (
            <motion.div 
              initial={{opacity: 0, y: -10}}
              animate={{opacity:1, y:0}}
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm text-sm"
              role="alert"
            >
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </motion.div>
          )}

        <motion.form 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          onSubmit={handleSubmit} 
          className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl space-y-6"
        >
          {/* Form Section Title */}
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h3 className="text-xl font-semibold leading-7 text-gray-900">Personal Information</h3>
            <p className="mt-1 text-sm leading-6 text-gray-500">Use a permanent address where you can receive mail.</p>
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-800 mb-1">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow shadow-sm text-gray-900 placeholder-gray-400"
              placeholder="e.g., Jane Doe"
            />
          </div>

          {/* Age */}
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-800 mb-1">
              Age
            </label>
            <input
              id="age"
              type="number"
              required
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow shadow-sm text-gray-900 placeholder-gray-400"
              placeholder="e.g., 25"
            />
          </div>

          {/* Education Level */}
          <div>
            <label htmlFor="education" className="block text-sm font-medium text-gray-800 mb-1">
              Highest Level of Education
            </label>
            <select
              id="education"
              required
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow shadow-sm text-gray-900"
            >
              <option value="">Select Education Level</option>
              <option value="highschool">High School Diploma or GED</option>
              <option value="associate">Associate's Degree</option>
              <option value="bachelor">Bachelor's Degree</option>
              <option value="master">Master's Degree</option>
              <option value="phd">Doctorate (PhD)</option>
              <option value="vocational">Vocational/Technical Training</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Skills */}
          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-800 mb-1">
              Skills
            </label>
            <textarea
              id="skills"
              rows="3"
              required
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow shadow-sm text-gray-900 placeholder-gray-400"
              placeholder="e.g., Python, JavaScript, Project Management (comma-separated)"
            ></textarea>
            <p className="mt-1 text-xs text-gray-500">Enter skills separated by commas.</p>
          </div>

          {/* Interests */}
          <div>
            <label htmlFor="interests" className="block text-sm font-medium text-gray-800 mb-1">
              Areas of Interest
            </label>
            <textarea
              id="interests"
              rows="3"
              required
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow shadow-sm text-gray-900 placeholder-gray-400"
              placeholder="e.g., Artificial Intelligence, Web Development, Graphic Design (comma-separated)"
            ></textarea>
            <p className="mt-1 text-xs text-gray-500">Enter interests separated by commas.</p>
          </div>

          {/* Career Goals */}
          <div>
            <label htmlFor="goals" className="block text-sm font-medium text-gray-800 mb-1">
              Career Goals
            </label>
            <textarea
              id="goals"
              rows="3"
              required
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow shadow-sm text-gray-900 placeholder-gray-400"
              placeholder="e.g., Become a Senior Software Engineer, Start a tech company (comma-separated)"
            ></textarea>
            <p className="mt-1 text-xs text-gray-500">Enter career goals separated by commas.</p>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !!error} // Disable if submitting or if there's an unresolved auth error
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md hover:shadow-lg 
                ${(isSubmitting || error) ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'}`}
            >
              {isSubmitting ? 'Submitting Details...' : 'Save and Continue'}
            </button>
          </div>
        </motion.form>

        <motion.div 
            initial={{ opacity: 0}}
            animate={{ opacity: 1}}
            transition={{delay: 0.3, duration: 0.5}}
            className="mt-8 text-center text-sm text-gray-500"
        >
            <p>&copy; {new Date().getFullYear()} CareerSphere. All rights reserved.</p>
            <p>
                <Link to="/privacy" className="hover:underline">Privacy Policy</Link> |
                <Link to="/terms" className="hover:underline ml-1">Terms of Service</Link>
            </p>
        </motion.div>

      </div>
    </motion.div>
  );
}

export default PersonalDetailsPage;