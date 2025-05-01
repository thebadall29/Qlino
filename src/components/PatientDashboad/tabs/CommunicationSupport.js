import React, { useState } from 'react';

const CommunicationSupport = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'doctor', name: 'Dr. Johnson', content: 'Hello! How are you feeling today?', time: '09:30 AM' },
    { id: 2, sender: 'patient', name: 'You', content: 'Hi Dr. Johnson, I\'m feeling better than yesterday, but still have some discomfort.', time: '09:32 AM' },
    { id: 3, sender: 'doctor', name: 'Dr. Johnson', content: 'That\'s good to hear. Are you taking the medications as prescribed?', time: '09:35 AM' },
    { id: 4, sender: 'patient', name: 'You', content: 'Yes, I\'ve been taking them regularly as you advised.', time: '09:36 AM' },
  ]);

  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    const message = {
      id: messages.length + 1,
      sender: 'patient',
      name: 'You',
      content: newMessage,
      time: timeString
    };

    setMessages([...messages, message]);
    setNewMessage('');

    setTimeout(() => {
      const doctorResponse = {
        id: messages.length + 2,
        sender: 'doctor',
        name: 'Dr. Johnson',
        content: 'Thank you for the update. Please continue with the treatment plan and let me know if symptoms persist.',
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      };
      setMessages(prev => [...prev, doctorResponse]);
    }, 1500);
  };

  return (
    <div className="section-container">
      <h2>Communication Support</h2>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.map(message => (
            <div key={message.id} className={`message ${message.sender === 'patient' ? 'user-message' : 'doctor-message'}`}>
              <div className="message-header">
                <span className="sender-name">{message.name}</span>
                <span className="message-time">{message.time}</span>
              </div>
              <div className="message-content">{message.content}</div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="message-form">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
          />
          <button type="submit" className="send-button">Send</button>
        </form>
      </div>
    </div>
  );
};

export default CommunicationSupport;
