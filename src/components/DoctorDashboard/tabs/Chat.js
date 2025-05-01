import React, { useState } from 'react';
import "../DoctorDashboard.scss"
const Chat = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [message, setMessage] = useState('');

  // Mock data for chat
  const patients = [
    { id: 1, name: "John Doe", unread: 2 },
    { id: 2, name: "Jane Smith", unread: 0 },
    // Add more patients
  ];

  const mockMessages = [
    { id: 1, sender: "patient", text: "Hello Doctor, I have a question", time: "10:30 AM" },
    { id: 2, sender: "doctor", text: "Yes, how can I help you?", time: "10:31 AM" },
    // Add more messages
  ];

  const handleSend = (e) => {
    e.preventDefault();
    // Handle sending message
    setMessage('');
  };

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="chat-patients">
          {patients.map(patient => (
            <div 
              key={patient.id}
              className={`chat-patient ${selectedPatient?.id === patient.id ? 'active' : ''}`}
              onClick={() => setSelectedPatient(patient)}
            >
              <div className="patient-avatar">
                {patient.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="patient-chat-info">
                <span className="patient-name">{patient.name}</span>
                {patient.unread > 0 && (
                  <span className="unread-count">{patient.unread}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-main">
        {selectedPatient ? (
          <>
            <div className="chat-header">
              <h3>{selectedPatient.name}</h3>
            </div>
            <div className="messages">
              {mockMessages.map(msg => (
                <div 
                  key={msg.id}
                  className={`message ${msg.sender === 'doctor' ? 'sent' : 'received'}`}
                >
                  <div className="message-content">{msg.text}</div>
                  <div className="message-time">{msg.time}</div>
                </div>
              ))}
            </div>
            <form className="message-form" onSubmit={handleSend}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <button type="submit">Send</button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            Select a patient to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;