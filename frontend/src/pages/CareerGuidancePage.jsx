import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CareerGuidancePage() {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          alert('You are not logged in. Please log in to continue.');
          window.location.href = '/login';
          return;
        }

        // Retrieve answers from localStorage (expecting an object)
        const answers = JSON.parse(localStorage.getItem('answers') || '{}');
        if (!Object.keys(answers).length) {
          alert('No answers found. Please complete the assessment first.');
          navigate('/career-assess');
          return;
        }

        // Send answers to the backend for AI analysis
        const response = await axios.post(
          'http://127.0.0.1:8000/api/career-guidance/',
          { answers },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setRecommendations(response.data);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError(err.response?.data?.error || 'Failed to fetch recommendations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [navigate]);

  if (loading) {
    return <div className="text-white text-center mt-10 text-xl">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center mt-10 text-lg">{error}</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-screen bg-gradient-to-r from-purple-500 to-indigo-600">
      <div className="bg-white shadow-2xl rounded-lg py-4 px-6 sm:py-4 sm:px-8 md:py-4 md:px-10 w-full max-w-2xl text-black">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-6">Career Guidance</h1>
        <p className="text-center text-gray-600 mb-8">
          Based on your answers, here are some recommended career paths, roadmaps, and resources to help you achieve your goals.
        </p>
        {recommendations && (
          <div className="space-y-6">
            {recommendations.careerPaths && recommendations.careerPaths.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Recommended Career Paths</h2>
                <ul className="list-disc pl-5 space-y-2">
                  {recommendations.careerPaths.map((path, index) => (
                    <li key={index} className="text-gray-800 text-lg">{path}</li>
                  ))}
                </ul>
              </div>
            )}
            {recommendations.roadmaps && recommendations.roadmaps.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Specific Roadmaps</h2>
                <ul className="list-disc pl-5 space-y-2">
                  {recommendations.roadmaps.map((roadmap, index) => (
                    <li key={index} className="text-gray-800 text-lg">{roadmap}</li>
                  ))}
                </ul>
              </div>
            )}
            {recommendations.skills && recommendations.skills.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Recommended Skills</h2>
                <ul className="list-disc pl-5 space-y-2">
                  {recommendations.skills.map((skill, index) => (
                    <li key={index} className="text-gray-800 text-lg">{skill}</li>
                  ))}
                </ul>
              </div>
            )}
            {recommendations.resources && recommendations.resources.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Resources</h2>
                <ul className="list-disc pl-5 space-y-2">
                  {recommendations.resources.map((resource, index) => (
                    <li key={index} className="text-gray-800 text-lg">
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {resource.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CareerGuidancePage;
