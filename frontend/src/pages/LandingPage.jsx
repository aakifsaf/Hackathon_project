import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Placeholder icons - replace with actual SVGs or an icon library like react-icons
const FeatureIcon1 = () => <svg className="w-12 h-12 text-blue-500 mb-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm9 4H6v2h8V7zm0 4H6v2h8v-2z"></path></svg>;
const FeatureIcon2 = () => <svg className="w-12 h-12 text-green-500 mb-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path></svg>;
const FeatureIcon3 = () => <svg className="w-12 h-12 text-purple-500 mb-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path></svg>;

const LandingPage = () => {
  const fadeIn = (delay = 0) => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut", delay }
    }
  });

  const staggerContainer = {
    hidden: {}, // No initial state needed for the container itself if children handle their own delays
    visible: {
      transition: { staggerChildren: 0.2 } // Stagger delay for child animations
    }
  };

  const featureCards = [
    {
      icon: <FeatureIcon1 />,
      title: 'Personalized Roadmaps',
      description: 'Get AI-driven career paths tailored to your skills and aspirations. Navigate your journey with clarity.',
    },
    {
      icon: <FeatureIcon2 />,
      title: 'Expert Guidance & Insights',
      description: 'Access curated resources, industry trends, and expert advice to make informed decisions.',
    },
    {
      icon: <FeatureIcon3 />,
      title: 'Skill Development Hub',
      description: 'Discover courses and tools to build in-demand skills and stay ahead in your chosen field.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col items-center font-sans">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "circOut" }}
        className="w-full py-5 px-6 md:px-10 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md shadow-sm z-50"
      >
        <Link to="/" className="text-3xl font-bold text-blue-600">
          CareerSphere
        </Link>
        <div className="space-x-3 md:space-x-4">
          <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-300">
            Login
          </Link>
          <Link
            to="/register"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            Sign Up
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex-grow w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between text-center md:text-left py-16 md:py-24 px-6"
      >
        <motion.div 
          variants={fadeIn()}
          className="md:w-1/2 md:pr-10 lg:pr-16 mb-10 md:mb-0"
        >
          <motion.h1
            // variants attribute inherited from parent if not overridden
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight"
          >
            Unlock Your <span className="text-blue-600">Career Potential</span>
          </motion.h1>
          <motion.p
            // variants attribute inherited from parent if not overridden, but delay handled by stagger
            className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto md:mx-0 mb-10"
          >
            CareerSphere is your all-in-one platform for personalized career guidance, skill enhancement, and discovering opportunities that align with your unique talents.
          </motion.p>
          <motion.div // variants attribute inherited
          >
            <Link
              to="/register"
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-10 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 text-lg transform hover:scale-105 inline-block"
            >
              Start Your Journey Today
            </Link>
          </motion.div>
        </motion.div>
        <motion.div 
          variants={fadeIn(0.2)} // Slight delay for the image after text
          className="md:w-1/2 mt-10 md:mt-0 flex justify-center md:justify-end"
        >
          <img 
            src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
            alt="Team collaborating on a project"
            className="rounded-xl shadow-2xl w-full max-w-md md:max-w-lg lg:max-w-xl object-cover h-auto md:h-[400px] lg:h-[450px]"
          />
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section className="w-full bg-white py-16 md:py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once: true, amount: 0.5}} transition={{ duration: 0.6}}
            className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12 md:mb-16"
          >
            Why Choose CareerSphere?
          </motion.h2>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }} // Trigger animation when 20% of the section is in view
            className="grid md:grid-cols-3 gap-8 md:gap-10"
          >
            {featureCards.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeIn(index * 0.1)} // Staggered fade-in for cards
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col items-center text-center border border-gray-100"
              >
                {feature.icon}
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonial Section (Placeholder) */}
      <section className="w-full py-16 md:py-24 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once: true, amount: 0.5}} transition={{ duration: 0.6}}>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Thousands of Successful Individuals</h2>
            <p className="text-gray-600 text-lg mb-8 italic">
              "CareerSphere helped me find a path I'm truly passionate about. The guidance was invaluable!" - Alex P.
            </p>
            <Link
              to="/register"
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-300"
            >
              Read More Success Stories &rarr;
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full text-center py-10 px-6 bg-gray-100 border-t border-gray-200">
        <p className="text-gray-600 text-sm">
          &copy; {new Date().getFullYear()} CareerSphere. All Rights Reserved.
        </p>
        <div className="mt-2">
          <Link to="/privacy" className="text-xs text-gray-500 hover:text-blue-600 mx-2 transition-colors">Privacy Policy</Link>
          <span className="text-xs text-gray-400">|</span>
          <Link to="/terms" className="text-xs text-gray-500 hover:text-blue-600 mx-2 transition-colors">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
