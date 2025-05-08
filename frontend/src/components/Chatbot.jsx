import React, { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon, XMarkIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/solid';
import axios from 'axios';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm your Career Assistant. Ask me anything!", sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleSendMessage = async () => {
        if (inputValue.trim() === '') return;

        const originalInputValue = inputValue; // Store before clearing
        const newUserMessage = { id: Date.now(), text: originalInputValue, sender: 'user' };
        setMessages(prevMessages => [...prevMessages, newUserMessage]);
        setInputValue('');

        try {
            // const token = localStorage.getItem('accessToken'); // Assuming token is in localStorage
            // if (!token) {
            //     throw new Error('Authentication token not found.');
            // }

            const response = await axios.post(
                '/api/chatbot/',
                { question: originalInputValue }, // Data payload
                { // Config object
                    headers: {
                        'Content-Type': 'application/json',
                        // 'Authorization': `Bearer ${token}`,
                    }
                }
            );

            if (!response.data) {
                throw new Error('Failed to get response from bot.');
            }

            const data = response.data;

            let botResponseText;
            if (data.answer) {
                botResponseText = data.answer;
            } else if (data.error) {
                botResponseText = `Error: ${data.error}`;
            } else {
                botResponseText = "Sorry, I received an unexpected response.";
            }
            const botResponse = { id: Date.now() + 1, text: botResponseText, sender: 'bot' };
            setMessages(prevMessages => [...prevMessages, botResponse]);

        } catch (error) {
            console.error("Chatbot API error:", error);
            const errorBotResponse = { id: Date.now() + 1, text: `Sorry, I couldn't connect: ${error.message}`, sender: 'bot' };
            setMessages(prevMessages => [...prevMessages, errorBotResponse]);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={toggleChat}
                className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ring-offset-gray-50 transition-transform duration-150 ease-in-out transform hover:scale-110 z-40"
                aria-label="Open chat"
            >
                <ChatBubbleLeftEllipsisIcon className="h-8 w-8" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-full max-w-sm h-[70vh] max-h-[480px] bg-white rounded-xl shadow-xl flex flex-col z-50 border border-purple-300">
            <header className="bg-purple-600 text-white p-4 flex justify-between items-center rounded-t-xl">
                <h3 className="font-semibold text-lg">Career Assistant</h3>
                <button onClick={toggleChat} className="text-purple-100 hover:text-white focus:outline-none" aria-label="Close chat">
                    <XMarkIcon className="h-6 w-6" />
                </button>
            </header>
            <main className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50 custom-scrollbar">
                {messages.map(message => (
                    <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div 
                            className={`max-w-[80%] py-2 px-3 rounded-2xl shadow-sm ${message.sender === 'user' ? 'bg-purple-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}
                        >
                            {message.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </main>
            <footer className="p-3 border-t border-gray-200 bg-white rounded-b-xl">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about your career..."
                        className="flex-1 py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-shadow duration-150 text-gray-900"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim()}
                        className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                        aria-label="Send message"
                    >
                        <PaperAirplaneIcon className="h-5 w-5" />
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default Chatbot;