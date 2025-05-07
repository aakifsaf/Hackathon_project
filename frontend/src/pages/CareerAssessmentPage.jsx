import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Placeholder for an icon
const AssessmentIcon = () => (
  <svg className="w-8 h-8 text-teal-500" fill="currentColor" viewBox="0 0 20 20"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828zM5 12V7a2 2 0 012-2h2.586l-4.707 4.707A1 1 0 015 12z"></path><path d="M3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"></path></svg>
);

function CareerAssessmentPage() {
  const [questions, setQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const fetchQuestions = useCallback(async () => {
    setIsLoadingQuestions(true);
    setPageError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setPageError('Authentication required. Please log in.');
        // navigate('/login'); // Consider delaying or making this a button
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get('http://127.0.0.1:8000/api/assess-questions/', { headers });

      if (response.data.questions && Array.isArray(response.data.questions) && response.data.questions.length > 0) {
        setQuestions(response.data.questions);
        // Initialize answers state for each question
        const initialAnswers = {};
        response.data.questions.forEach(q => {
            initialAnswers[q.id] = '';
        });
        setAnswers(initialAnswers);
      } else {
        setPageError('No assessment questions are currently available. Please try again later.');
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      let msg = 'An error occurred while loading assessment questions.';
      if (err.response?.status === 401) {
        msg = 'Your session has expired. Please log in again.';
        // navigate('/login'); // Consider delayed navigation
      }
      setPageError(msg);
    } finally {
      setIsLoadingQuestions(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleInputChange = (questionId, value) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setPageError(null);

    const token = localStorage.getItem('access_token');
    if (!token) {
      setPageError('Authentication required. Please log in to submit.');
      setIsSubmitting(false);
      return;
    }

    const unansweredQuestions = questions.filter(q => !answers[q.id]?.trim());
    if (unansweredQuestions.length > 0) {
      setPageError(`Please answer all ${questions.length} questions before submitting. You have ${unansweredQuestions.length} remaining.`);
      setIsSubmitting(false);
      return;
    }

    try {
      const formattedAnswersArray = Object.entries(answers).map(([question_id, answer]) => ({
        question_id: parseInt(question_id),
        answer: answer.trim(),
      }));
      
      const payloadForAssessAnswers = { answers: formattedAnswersArray };
      // For career-guidance, the API expects an object respostas: { q_id: answer_text, ... }
      // Based on original code: const payload2 = { answers }; (this implies answers is { q_id: answer_text })
      const payloadForCareerGuidance = { answers }; 

      const headers = { Authorization: `Bearer ${token}` };

      // Step 1: Submit answers to /api/assess-answers/
      await axios.post('http://127.0.0.1:8000/api/assess-answers/', payloadForAssessAnswers, { headers });
      
      // Step 2: Submit answers to /api/career-guidance/
      // Note: Using a potentially different payload structure as per original code.
      await axios.post('http://127.0.0.1:8000/api/career-guidance/', payloadForCareerGuidance, { headers });
      
      alert('Assessment submitted successfully! Generating your career guidance...'); // Original Alert
      navigate('/career-guidance');

    } catch (error) {
      console.error('Submission error:', error.response?.data || error.message);
      let submitError = 'Failed to submit assessment.';
      if (error.response?.data?.error) {
        submitError = error.response.data.error;
      } else if (typeof error.response?.data === 'string') {
        submitError = error.response.data;
      } else if (error.message) {
        submitError = error.message;
      }
      setPageError(`${submitError} Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const pageVariants = {
    initial: { opacity: 0, scale: 0.95 },
    in: { opacity: 1, scale: 1 },
    out: { opacity: 0, scale: 0.95 },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
  };

  if (isLoadingQuestions) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-blue-100 p-4">
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-lg font-semibold text-gray-700">Loading Assessment Questions...</p>
          <p className="text-sm text-gray-500">Please wait a moment.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 py-8 px-4 sm:px-6 lg:px-8 font-sans"
    >
      <div className="max-w-3xl mx-auto">
        <motion.div 
          variants={itemVariants}
          transition={{delay:0.1, duration:0.5}}
          className="text-center mb-10"
        >
          <Link to="/" className="inline-block mb-4 text-4xl font-bold text-teal-600 hover:text-teal-700 transition-colors">
            CareerSphere
          </Link>
          <h2 className="text-3xl font-semibold text-gray-800 flex items-center justify-center">
            <AssessmentIcon />
            <span className="ml-3">Career Assessment</span>
          </h2>
          <p className="mt-3 text-gray-600">
            Answer these questions to help us understand your preferences and goals.
          </p>
        </motion.div>

        {pageError && (
          <motion.div 
            initial={{opacity: 0, y: -10}}
            animate={{opacity:1, y:0}}
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8 rounded-md shadow-sm text-sm"
            role="alert"
          >
            <p className="font-semibold">Error</p>
            <p>{pageError}</p>
            {pageError.includes("log in") && 
                <Link to="/login" className="mt-2 inline-block text-sm text-red-700 hover:text-red-900 underline">
                    Go to Login
                </Link>
            }
          </motion.div>
        )}

        {questions.length > 0 && !pageError && (
          <motion.form 
            variants={itemVariants}
            transition={{delay:0.2, duration:0.5}}
            onSubmit={handleSubmit} 
            className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl space-y-8"
          >
            {questions.map((q, index) => (
              <motion.div 
                key={q.id} 
                variants={itemVariants} 
                transition={{delay: index * 0.1, duration: 0.5}}
                className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
              >
                <label htmlFor={`question-${q.id}`} className="block text-lg font-medium text-gray-800 mb-2">
                  <span className="text-teal-500 font-semibold">Question {index + 1}:</span> {q.question_text || q.question} {/* Adjusted for potential field name variations */}
                </label>
                <textarea
                  id={`question-${q.id}`}
                  rows="4"
                  value={answers[q.id] || ''}
                  onChange={(e) => handleInputChange(q.id, e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow shadow-sm text-gray-900 placeholder-gray-400"
                  placeholder="Share your thoughts here..."
                />
              </motion.div>
            ))}

            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting || isLoadingQuestions || !!pageError}
                className={`w-full py-3.5 px-4 rounded-lg font-semibold text-white transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-md hover:shadow-lg 
                  ${(isSubmitting || isLoadingQuestions || pageError) ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700'}`}
              >
                {isSubmitting ? 'Submitting Answers...' : 'Submit & Get Guidance'}
              </button>
            </div>
          </motion.form>
        )}
        
        {/* Fallback if no questions and no error after loading */}
        {!isLoadingQuestions && questions.length === 0 && !pageError && (
             <motion.div 
                initial={{opacity: 0, y: 10}}
                animate={{opacity:1, y:0}}
                className="text-center bg-white p-8 rounded-xl shadow-xl"
            >
                <h3 className="text-xl font-semibold text-gray-700">No Questions Available</h3>
                <p className="text-gray-500 mt-2">We couldn't find any assessment questions at the moment. Please check back later or contact support.</p>
                <button 
                    onClick={fetchQuestions} 
                    className="mt-6 px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                >
                    Retry Loading Questions
                </button>
            </motion.div>
        )}

        <motion.div 
            variants={itemVariants}
            transition={{delay:0.3, duration:0.5}}
            className="mt-10 text-center text-sm text-gray-500"
        >
            <p>&copy; {new Date().getFullYear()} CareerSphere. All rights reserved.</p>
        </motion.div>

      </div>
    </motion.div>
  );
}

export default CareerAssessmentPage;
