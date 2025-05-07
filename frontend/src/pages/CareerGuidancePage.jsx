import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Placeholder icons (replace with actual icons if available, e.g., from react-icons)
const PathIcon = () => <svg className="w-6 h-6 text-teal-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>;
const RoadmapIcon = () => <svg className="w-6 h-6 text-indigo-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13V7m0 13a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path></svg>;
const SkillIcon = () => <svg className="w-6 h-6 text-sky-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>;
const ResourceIcon = () => <svg className="w-6 h-6 text-amber-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>;
const GuidanceIcon = () => <svg className="w-10 h-10 text-teal-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>;


function CareerGuidancePage() {
  const [recommendations, setRecommendations] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const navigate = useNavigate();

  const fetchGuidance = useCallback(async () => {
    setIsLoading(true);
    setPageError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setPageError('Authentication required. Please log in to view guidance.');
        // Consider adding a button to navigate to login, or delayed redirect.
        // navigate('/login'); 
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get('http://127.0.0.1:8000/api/career-guidance/', { headers });
      
      if (response.data && typeof response.data === 'object') {
        setRecommendations(response.data);
      } else {
        setPageError('Guidance data is not in the expected format or is empty.');
      }

    } catch (err) {
      console.error('Error fetching career guidance:', err);
      let errorMsg = 'Failed to fetch career guidance. Please try again later.';
      if (err.response?.status === 401) {
        errorMsg = 'Your session has expired. Please log in again.';
        // navigate('/login'); // Optional: redirect or show login button
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (typeof err.response?.data === 'string' && err.response.data.length < 100) {
        errorMsg = err.response.data;
      }
      setPageError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]); // navigate is in dependency array if we add navigation calls here

  useEffect(() => {
    fetchGuidance();
  }, [fetchGuidance]);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  const cardVariants = {
    initial: { opacity: 0, scale: 0.95 },
    in: { opacity: 1, scale: 1 },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-blue-100 p-4">
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-lg font-semibold text-gray-700">Loading Your Career Guidance...</p>
          <p className="text-sm text-gray-500">Hang tight, we're preparing your personalized recommendations.</p>
        </motion.div>
      </div>
    );
  }

  const renderSection = (title, data, icon, itemRenderFn) => {
    if (!data || data.length === 0) return null;
    return (
      <motion.div 
        variants={cardVariants}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
      >
        <h3 className="text-2xl font-semibold text-gray-800 mb-5 flex items-center">
          {icon} {title}
        </h3>
        <ul className="space-y-3">
          {data.map(itemRenderFn)}
        </ul>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 py-10 px-4 sm:px-6 lg:px-8 font-sans"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{opacity:0, y: -20}}
          animate={{opacity:1, y:0}}
          transition={{delay:0.1, duration:0.5}}
          className="text-center mb-12"
        >
          <Link to="/" className="inline-block mb-3 text-4xl font-bold text-teal-600 hover:text-teal-700 transition-colors">
            CareerSphere
          </Link>
          <h1 className="text-4xl font-bold text-gray-800 flex items-center justify-center">
            <GuidanceIcon />
            <span className="ml-3">Your Personalized Career Guidance</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Based on your assessment, here are tailored recommendations to help you navigate your career path.
          </p>
        </motion.div>

        {pageError && (
          <motion.div 
            initial={{opacity: 0, y: -10}}
            animate={{opacity:1, y:0}}
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8 rounded-md shadow-md text-sm" 
            role="alert"
          >
            <h4 className="font-bold">Error Retrieving Guidance</h4>
            <p>{pageError}</p>
            {pageError.includes("log in") && 
                <Link to="/login" className="mt-2 inline-block text-sm text-red-700 hover:text-red-900 underline">
                    Go to Login
                </Link>
            }
            <button 
                onClick={fetchGuidance} 
                className="mt-3 px-4 py-1.5 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition-colors"
            >
                Retry
            </button>
          </motion.div>
        )}

        {!isLoading && !pageError && !recommendations && (
          <motion.div 
            variants={cardVariants}
            className="bg-white p-8 rounded-xl shadow-lg text-center"
          >
            <h3 className="text-xl font-semibold text-gray-700">No Guidance Available</h3>
            <p className="text-gray-500 mt-2 mb-4">We couldn't retrieve any career guidance for you at this moment. This might be due to incomplete profile information or a temporary issue.</p>
            <Link to="/personal-details" className="text-teal-600 hover:underline font-medium mr-4">
              Update Profile
            </Link>
            <button 
                onClick={fetchGuidance} 
                className="px-5 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm"
            >
                Retry Loading Guidance
            </button>
          </motion.div>
        )}

        {recommendations && (
          <div className="space-y-8">
            {renderSection("Recommended Career Paths", recommendations.careerPaths, <PathIcon />, (path, index) => (
              <li key={`path-${index}`} className="text-gray-700 p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors text-md">
                {path}
              </li>
            ))}

            {renderSection("Specific Roadmaps", recommendations.roadmaps, <RoadmapIcon />, (roadmap, index) => (
              <li key={`roadmap-${index}`} className="text-gray-700 p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors text-md">
                {roadmap} {/* Assuming roadmaps are strings. Adjust if they are objects. */}
              </li>
            ))}

            {renderSection("Skills to Develop", recommendations.skills, <SkillIcon />, (skill, index) => (
              <li key={`skill-${index}`} className="inline-block bg-sky-100 text-sky-700 text-sm font-medium mr-2 mb-2 px-3 py-1 rounded-full">
                {skill}
              </li>
            ))}

            {renderSection("Helpful Resources", recommendations.resources, <ResourceIcon />, (resource, index) => (
              <li key={`resource-${index}`} className="text-gray-700 p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                <a 
                  href={resource.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="font-medium text-teal-600 hover:text-teal-700 hover:underline flex items-center"
                >
                  {resource.title}
                  <svg className="w-4 h-4 ml-1.5 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </a>
                {resource.description && <p className="text-xs text-gray-500 mt-1">{resource.description}</p>}
              </li>
            ))}
          </div>
        )}
        
        <motion.div 
            initial={{opacity:0}}
            animate={{opacity:1}}
            transition={{delay:0.5, duration:0.5}}
            className="mt-12 text-center"
        >
            <Link 
                to="/dashboard" // Or any other relevant page
                className="px-8 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-md hover:shadow-lg transform hover:scale-105"
            >
                Back to Dashboard
            </Link>
        </motion.div>

        <motion.div 
            initial={{opacity:0}}
            animate={{opacity:1}}
            transition={{delay:0.6, duration:0.5}}
            className="mt-16 text-center text-sm text-gray-500"
        >
          <p>&copy; {new Date().getFullYear()} CareerSphere. All rights reserved.</p>
        </motion.div>

      </div>
    </motion.div>
  );
}

export default CareerGuidancePage;
