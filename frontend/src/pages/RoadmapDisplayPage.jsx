import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RoadmapDisplayPage = () => {
    const [roadmapData, setRoadmapData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRoadmap = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await axios.get('/api/career-guidance/', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 200) {
                    setRoadmapData(response.data);
                    setError(null);
                } else if (response.status === 204) {
                    setRoadmapData(null); // No roadmap found
                    setError('No career roadmap found for your profile. Please complete the assessment first.');
                }
            } catch (err) {
                console.error("Error fetching roadmap:", err);
                if (err.response && err.response.status === 401) {
                    navigate('/login');
                } else if (err.response && err.response.status === 204){
                     setRoadmapData(null); 
                     setError('No career roadmap found. Please complete the career assessment.');
                } else {
                    setError(err.response?.data?.message || err.response?.data?.error || 'Failed to load career roadmap. Please try again later.');
                }
            }
            setLoading(false);
        };

        fetchRoadmap();
    }, [navigate]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><p className="text-xl text-gray-700">Loading your roadmap...</p></div>;
    }

    // Helper function to format text that might contain newlines or bullet points
    const formatMultilineText = (text) => {
        if (!text) return null;
        return text.split('\n').map((line, index) => (
            <p key={index} className="mb-2">{line.startsWith('*') || line.startsWith('- ') ? <span className="ml-4">{line}</span> : line}</p>
        ));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 py-12 px-4 sm:px-6 lg:px-8 text-white">
            <div className="max-w-4xl mx-auto">
                <button 
                    onClick={() => navigate('/dashboard')} 
                    className="mb-8 bg-white text-purple-700 hover:bg-gray-200 font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out"
                >
                    &larr; Back to Dashboard
                </button>

                <h1 className="text-4xl font-extrabold text-center mb-10">Your Personalized Career Roadmap</h1>

                {error && !roadmapData && (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-6 rounded-md shadow-lg" role="alert">
                        <p className="font-bold text-lg">Attention</p>
                        <p>{error}</p>
                        <button 
                            onClick={() => navigate('/career-assessment')} 
                            className="mt-4 bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Start Career Assessment
                        </button>
                    </div>
                )}

                {roadmapData && (
                    <div className="bg-white/90 backdrop-blur-md text-gray-800 rounded-xl shadow-2xl p-8 space-y-8">
                        <section>
                            <h2 className="text-3xl font-bold text-purple-700 mb-4 border-b-2 border-purple-300 pb-2">Career Roadmap</h2>
                            <div className="prose prose-lg max-w-none text-gray-700">{formatMultilineText(roadmapData.roadmap)}</div>
                        </section>
                        
                        <section>
                            <h2 className="text-3xl font-bold text-purple-700 mb-4 border-b-2 border-purple-300 pb-2">Required Skills</h2>
                            {roadmapData.skills && roadmapData.skills.length > 0 ? (
                                <div className="prose prose-lg max-w-none text-gray-700">{formatMultilineText(roadmapData.skills)}</div>
                            ) : (
                                <p className="text-gray-600">No specific skills listed.</p>
                            )}
                        </section>

                        <section>
                            <h2 className="text-3xl font-bold text-purple-700 mb-4 border-b-2 border-purple-300 pb-2">Recommended Certifications</h2>
                            {roadmapData.certifications && roadmapData.certifications.length > 0 ? (
                                <div className="prose prose-lg max-w-none text-gray-700">{formatMultilineText(roadmapData.certifications)}</div>
                            ) : (
                                <p className="text-gray-600">No specific certifications listed.</p>
                            )}
                        </section>

                        {roadmapData.user_responses && (
                             <section>
                                <h3 className="text-xl font-semibold text-purple-700 mb-3">Based on your responses:</h3>
                                <div className="bg-purple-50 p-4 rounded-md text-sm text-gray-600 prose max-w-none">{formatMultilineText(roadmapData.user_responses)}</div>
                            </section>
                        )}
                        
                        <p className="text-center text-sm text-purple-700/80 mt-8">Generated on: {new Date(roadmapData.created_at).toLocaleDateString()}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoadmapDisplayPage;
