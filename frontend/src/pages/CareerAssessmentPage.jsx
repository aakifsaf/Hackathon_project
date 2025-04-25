import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CareerAssessmentPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          alert('You are not logged in. Please log in to continue.');
          window.location.href = '/login';
          return;
        }

        const response = await axios.post('http://127.0.0.1:8000/api/career-assess/', {
          skills: localStorage.getItem('skills'),
          interests: localStorage.getItem('interests'),
          career_goals: localStorage.getItem('career_goals'),
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setQuestions(response.data.questions);
      } catch (err) {
        setError('Failed to fetch questions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-screen bg-gradient-to-r from-green-500 to-blue-600">
      <div className="bg-white shadow-2xl rounded-lg py-4 px-6 sm:py-4 sm:px-8 md:py-4 md:px-10 w-full max-w-xl text-black">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-6">Career Assessment</h1>
        <p className="text-center text-gray-600 mb-8">
          Based on your skills, interests, and career goals, here are some questions to guide your career planning.
        </p>
        <ul className="space-y-4">
          {questions.map((question, index) => (
            <li key={index} className="text-gray-800 text-lg">
              {index + 1}. {question}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default CareerAssessmentPage;