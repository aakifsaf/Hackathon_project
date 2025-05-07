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
                console.log("Full API Response:", response); // DEBUG LOG

                if (response.status === 200) {
                    console.log("API Response Data (response.data):", response.data); // DEBUG LOG
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

    // DEBUG LOGS before render
    console.log("Current roadmapData state before render:", roadmapData);
    console.log("Current error state before render:", error);
    console.log("Current loading state before render:", loading);

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><p className="text-xl text-gray-700">Loading your roadmap...</p></div>;
    }

    // Helper function to apply bolding to text
    const applyBold = (text) => {
        if (!text) return '';
        // Bolds text surrounded by **, ensuring it doesn't greedily match or create empty strong tags.
        // Matches ** followed by any character that is not an asterisk, then any sequence of characters 
        // (including single asterisks not part of a closing pair), ending with a non-asterisk character before the closing **.
        return text.replace(/\*\*([^*](?:[^*]|\*(?!\*))*[^*]?)\*\*/g, '<strong>$1</strong>');
    };

    // Helper function to render structured content
    const renderFormattedSection = (text, sectionType) => {
        if (!text) return null;

        const lines = text.split('\n').filter(line => line.trim() !== '' || sectionType === 'roadmap');

        if (sectionType === 'roadmap') {
            const roadmapItems = [];
            let currentStepContent = [];
            let currentStepTitle = null;
            let isParsingNumberedSteps = lines.some(line => /^\d+\.\s+/.test(line.trim()));

            if (!isParsingNumberedSteps) {
                 // Fallback for roadmap if no numbered list is detected: treat as paragraphs with bolding
                return lines.map((line, index) => (
                    <p key={index} className="text-gray-700 mb-2" dangerouslySetInnerHTML={{ __html: applyBold(line) }} />
                ));
            }

            lines.forEach((line, idx) => {
                const stepMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
                if (stepMatch) {
                    if (currentStepTitle) { // Push previous step
                        roadmapItems.push({
                            title: currentStepTitle,
                            content: [...currentStepContent]
                        });
                    }
                    currentStepTitle = applyBold(stepMatch[2]); // Title part, bolded
                    currentStepContent = [];
                } else if (currentStepTitle) {
                    let processedLine = line.trim();
                    if (processedLine.startsWith('- ')) {
                        processedLine = processedLine.substring(2);
                        if (processedLine.toLowerCase().startsWith('actionable step:')) {
                            processedLine = `<strong>Actionable Step:</strong> ${applyBold(processedLine.substring(16).trim())}`;
                        } else if (processedLine.toLowerCase().startsWith('project suggestion:')) {
                            processedLine = `<strong>Project Suggestion:</strong> ${applyBold(processedLine.substring(19).trim())}`;
                        } else {
                            processedLine = applyBold(processedLine);
                        }
                        // Check if last item in currentStepContent is already a list
                        let lastContentItem = currentStepContent.length > 0 ? currentStepContent[currentStepContent.length -1] : null;
                        if (lastContentItem && lastContentItem.type === 'ul') {
                            lastContentItem.items.push(processedLine);
                        } else {
                            currentStepContent.push({ type: 'ul', items: [processedLine] });
                        }
                    } else if (processedLine !== '') { // Regular paragraph line
                        currentStepContent.push({ type: 'p', item: applyBold(processedLine) });
                    } else if (processedLine === '' && currentStepContent.length > 0) {
                        // Add a visual break for empty lines between paragraphs, but not after a list
                        let lastContentItem = currentStepContent[currentStepContent.length -1];
                        if (lastContentItem && lastContentItem.type === 'p') {
                             currentStepContent.push({ type: 'br' }); // Represents a line break
                        }
                    }
                }
            });

            if (currentStepTitle) { // Push the last step
                roadmapItems.push({
                    title: currentStepTitle,
                    content: [...currentStepContent]
                });
            }

            return (
                <ol className="list-none space-y-6">
                    {roadmapItems.map((step, index) => (
                        <li key={index} className="pl-2">
                            <h3 className="text-xl font-semibold text-purple-800 mb-3" dangerouslySetInnerHTML={{ __html: step.title }} />
                            <div className="space-y-2 ml-4">
                                {step.content.map((item, itemIdx) => {
                                    if (item.type === 'ul') {
                                        return <ul key={itemIdx} className="list-disc list-outside pl-5 text-gray-700 space-y-1">{item.items.map((li, liIdx) => <li key={liIdx} dangerouslySetInnerHTML={{ __html: li }} />)}</ul>;
                                    } else if (item.type === 'br') {
                                        return <div key={itemIdx} className="h-2" />; // Visual break
                                    }
                                    return <p key={itemIdx} className="text-gray-700" dangerouslySetInnerHTML={{ __html: item.item }} />;
                                })}
                            </div>
                        </li>
                    ))}
                </ol>
            );

        } else if (sectionType === 'skills' || sectionType === 'certifications') {
            const allItems = [];
            lines.forEach(line => {
                // Split items that might be on the same line separated by " - "
                const subItems = line.split(/\s+-\s+/);
                subItems.forEach(subItem => {
                    let cleanedItem = subItem.replace(/^- |^\* /, '').trim();
                    if (cleanedItem) {
                        allItems.push(applyBold(cleanedItem));
                    }
                });
            });
            return (
                <ul className="list-disc list-outside pl-5 space-y-2 text-gray-700">
                    {allItems.map((item, index) => (
                        <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
                    ))}
                </ul>
            );

        } else if (sectionType === 'user_responses') {
            return (
                <ul className="list-none space-y-1">
                    {lines.map((line, index) => {
                        const parts = line.split(/:(.+)/); // Split on the first colon
                        if (parts.length > 1) {
                            return (
                                <li key={index} className="mb-1">
                                    <strong className="text-purple-600">{parts[0]}:</strong>
                                    <span className="text-gray-700 ml-2" dangerouslySetInnerHTML={{ __html: applyBold(parts[1].trim()) }} />
                                </li>
                            );
                        }
                        return <li key={index} className="text-gray-700" dangerouslySetInnerHTML={{ __html: applyBold(line) }} />;
                    })}
                </ul>
            );
        }

        // Fallback for unknown section type or unparseable content
        return lines.map((line, index) => (
            <p key={index} className="text-gray-700 mb-1" dangerouslySetInnerHTML={{ __html: applyBold(line) }} />
        ));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 py-12 px-4 sm:px-6 lg:px-8 text-white">
            <div className="max-w-4xl mx-auto">
                <button 
                    onClick={() => navigate('/career-assess')} 
                    className="mb-8 bg-white text-purple-700 hover:bg-gray-200 font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out"
                >
                    &larr; Back to Career Assessment
                </button>

                <h1 className="text-4xl font-extrabold text-center mb-10">Your Personalized Career Roadmap</h1>

                {error && !roadmapData && (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-6 rounded-md shadow-lg" role="alert">
                        <p className="font-bold text-lg">Attention</p>
                        <p>{error}</p>
                        <button 
                            onClick={() => navigate('/career-assess')} 
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
                            <div className="text-gray-700">{renderFormattedSection(roadmapData.roadmap, 'roadmap')}</div>
                        </section>
                        
                        <section>
                            <h2 className="text-3xl font-bold text-purple-700 mb-4 border-b-2 border-purple-300 pb-2">Required Skills</h2>
                            {roadmapData.skills && roadmapData.skills.length > 0 ? (
                                <div className="text-gray-700">{renderFormattedSection(roadmapData.skills, 'skills')}</div>
                            ) : (
                                <p className="text-gray-600">No specific skills listed.</p>
                            )}
                        </section>

                        <section>
                            <h2 className="text-3xl font-bold text-purple-700 mb-4 border-b-2 border-purple-300 pb-2">Recommended Certifications</h2>
                            {roadmapData.certifications && roadmapData.certifications.length > 0 ? (
                                <div className="text-gray-700">{renderFormattedSection(roadmapData.certifications, 'certifications')}</div>
                            ) : (
                                <p className="text-gray-600">No specific certifications listed.</p>
                            )}
                        </section>

                        {roadmapData.user_responses && (
                             <section>
                                <h3 className="text-xl font-semibold text-purple-700 mb-3">Based on your responses:</h3>
                                <div className="bg-purple-50 p-4 rounded-md text-sm text-gray-600">{renderFormattedSection(roadmapData.user_responses, 'user_responses')}</div>
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
