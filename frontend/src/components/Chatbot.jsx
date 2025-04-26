import React, { useState, useEffect } from 'react';

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (input.trim()) {
            const userMessage = { sender: 'user', text: input };
            setMessages((prevMessages) => [...prevMessages, userMessage]);
            setInput('');
            setLoading(true);

            try {
                const response = await fetch('https://api.deepseek.ai/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer YOUR_DEEPSEEK_API_KEY', // Replace with your actual API key
                    },
                    body: JSON.stringify({
                        message: input,
                    }),
                });

                const data = await response.json();
                const botMessage = { sender: 'bot', text: data.reply || 'Sorry, I could not process that.' };
                setMessages((prevMessages) => [...prevMessages, botMessage]);
            } catch (error) {
                const errorMessage = { sender: 'bot', text: 'Error: Unable to connect to the chatbot service.' };
                setMessages((prevMessages) => [...prevMessages, errorMessage]);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="chatbot">
            <div className="chat-window">
                {messages.map((msg, index) => (
                    <div key={index} className={msg.sender === 'user' ? 'user-message' : 'bot-message'}>
                        {msg.text}
                    </div>
                ))}
                {loading && <div className="loading">Bot is typing...</div>}
            </div>
            <div className="chat-input">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                />
                <button onClick={sendMessage} disabled={loading}>Send</button>
            </div>
        </div>
    );
};

export default Chatbot;