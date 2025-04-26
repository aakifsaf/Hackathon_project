import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CareerAssessmentPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssessmentQuestions = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          alert('You are not logged in. Please log in to continue.');
          window.location.href = '/login';
          return;
        }

        // Refresh token logic
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          try {
            const refreshResponse = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
              refresh: refreshToken,
            });
            localStorage.setItem('access_token', refreshResponse.data.access);
          } catch (refreshError) {
            console.error('Error refreshing token:', refreshError);
            alert('Session expired. Please log in again.');
            window.location.href = '/login';
            return;
          }
        }

        // Step 1: Fetch skills, interests, and goals from profile API
        const profileResponse = await axios.get('http://127.0.0.1:8000/api/user/details/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });

        const { skills, interests, career_goals } = profileResponse.data;

        if (!skills?.length || !interests?.length || !career_goals?.length) {
          setError('Please update your profile with skills, interests, and career goals.');
          setLoading(false);
          return;
        }

        // Step 2: Post them to the career assessment API
        const assessmentResponse = await axios.post(
          'http://127.0.0.1:8000/api/career-assess/',
          { skills, interests, career_goals },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            },
          }
        );

        // Step 3: Parse stringified JSON list in `questions`
        const rawText = assessmentResponse.data.questions;
        const extracted = rawText.match(/\[\s*("[^"]+",?\s*)+\]/s);
        const parsedQuestions = extracted ? JSON.parse(extracted[0]) : [];

        setQuestions(parsedQuestions);
      } catch (err) {
        console.error(err);
        setError('Failed to load assessment questions.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentQuestions();
  }, []);

  const handleInputChange = (event, index) => {
    setAnswers({
      ...answers,
      [index]: event.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('You are not logged in. Please log in to continue.');
        window.location.href = '/login';
        return;
      }

      // Refresh token logic
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const refreshResponse = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
            refresh: refreshToken,
          });
          localStorage.setItem('access_token', refreshResponse.data.access);
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError);
          alert('Session expired. Please log in again.');
          window.location.href = '/login';
          return;
        }
      }

      // Prepare data to send to the backend
      const payload = {
        questions,
        answers,
      };

      // Save answers to localStorage for use in the next page
      localStorage.setItem('answers', JSON.stringify(answers));

      // Post questions and answers to the backend
      await axios.post('http://127.0.0.1:8000/api/career-guidance/', payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      // Redirect to the Career Guidance page
      navigate('/career-guidance');
    } catch (error) {
      console.error('Error submitting answers:', error);
      alert('Failed to submit answers. Please try again later.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-screen bg-gradient-to-r from-green-500 to-blue-600">
        <div className="bg-white shadow-2xl rounded-lg py-4 px-6 w-full max-w-xl text-black text-center">
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-solid"></div>
          </div>
          <p className="text-gray-600">Loading career assessment questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen w-screen bg-gradient-to-r from-green-500 to-blue-600">
        <div className="bg-white shadow-2xl rounded-lg py-4 px-6 w-full max-w-xl text-black text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-screen bg-gradient-to-r from-green-500 to-blue-600">
      <div className="bg-white shadow-2xl rounded-lg py-4 px-6 sm:py-6 sm:px-10 w-full max-w-3xl text-black">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-6">Career Assessment</h1>
        <p className="text-center text-gray-600 mb-8">
          Here are questions to reflect on based on your profile.
        </p>
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
          {questions.map((question, index) => (
            <div key={index} className="flex flex-col">
              <label htmlFor={`question-${index}`} className="text-gray-800 text-lg font-semibold">
                {index + 1}. {question}
              </label>
              <textarea
                id={`question-${index}`}
                className="mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                value={answers[index] || ''}
                onChange={(event) => handleInputChange(event, index)}
                placeholder="Your answer here..."
              />
            </div>
          ))}
          <div className="text-center mt-6">
            <button type="submit" className="bg-blue-600 text-white py-2 px-6 rounded-lg">
              Submit Answers
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CareerAssessmentPage;
