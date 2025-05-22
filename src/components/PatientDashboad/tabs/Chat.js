import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Fetch doctors the patient has appointments with
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);
        
        
        // Get user data from localStorage
        const userString = localStorage.getItem('user');
        if (!userString) {
          throw new Error('User data not found in local storage');
        }
        
        const userData = JSON.parse(userString);
        const token = localStorage.getItem('token');

        
        
        const response = await fetch(`http://localhost:5000/api/patient/chat/doctors`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch doctors: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Doctors API response:', data); // Add this log to debug
        
        if (data.success) {
          setDoctors(data.doctors);
        } else {
          throw new Error(data.message || 'Failed to fetch doctors');
        }
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDoctors();
    
    // Clean up socket connection on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Connect to socket and fetch chat history when a doctor is selected
  useEffect(() => {
    if (!selectedDoctor) return;
    
    const userString = localStorage.getItem('user');
    if (!userString) return;
    
    const userData = JSON.parse(userString);
    const token = localStorage.getItem('token');
    
    // Fetch chat history
    const fetchChatHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`http://localhost:5000/api/patient/chat/history/${selectedDoctor._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch chat history: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          // Make sure messages is always an array
          setMessages(data.chat?.messages || []);
        } else {
          throw new Error(data.message || 'Failed to fetch chat history');
        }
      } catch (err) {
        console.error('Error fetching chat history:', err);
        setError(err.message);
        // Initialize messages as empty array on error
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChatHistory();
    
    // Connect to socket.io server
    socketRef.current = io('http://localhost:5000', {
      auth: {
        token: token
      },
      query: {
        userId: userData.id,
        role: 'patient',
        receiverId: selectedDoctor._id
      }
    });
    
    // Listen for incoming messages
    socketRef.current.on('message', (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    });
    
    // Listen for connection errors
    socketRef.current.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError(`Failed to connect to chat server: ${err.message}. Please try again later.`);
    });
    
    // Add a reconnection event handler
    socketRef.current.on('reconnect', (attemptNumber) => {
      console.log(`Reconnected to server after ${attemptNumber} attempts`);
      setError(null);
    });
    
    // Add a disconnect handler
    socketRef.current.on('disconnect', (reason) => {
      console.log(`Disconnected from server: ${reason}`);
      if (reason === 'io server disconnect') {
        // the disconnection was initiated by the server, reconnect manually
        socketRef.current.connect();
      }
    });
    return () => {
      // Disconnect socket when component unmounts or doctor changes
      socketRef.current.disconnect();
    };
  }, [selectedDoctor]);

const handleSendMessage = async (e) => {
  e.preventDefault();
  if (newMessage.trim() === '' || !selectedDoctor || !socketRef.current) return;
  
  const userString = localStorage.getItem('user');
  if (!userString) return;
  
  const userData = JSON.parse(userString);
  // Create message object
  const messageData = {
    senderId: userData.id,
    senderName: `${userData.firstName} ${userData.lastName}`.trim(),
    receiverId: selectedDoctor._id,
    content: newMessage,
    timestamp: new Date().toISOString(),
    senderModel: 'Patient' // Add this line to explicitly set sender type
  };
  
  // Emit message to server
  socketRef.current.emit('sendMessage', messageData);
  
  // Add message to local state (optimistic update)
  const formattedMessage = {
    _id: Date.now().toString(), // Temporary ID until server assigns one
    sender: 'patient',
    name: 'You',
    content: newMessage,
    time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    timestamp: new Date().toISOString(),
    senderModel: 'Patient' // Add this line to explicitly set sender type
  };

  console.log("formattedMessage: ", formattedMessage)
  console.log("messagesdata: ", messageData)
  
  // Also send message via REST API as a fallback to ensure it's saved
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/api/patient/chat/send/${selectedDoctor._id}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        content: newMessage,
        senderModel: 'Patient' // Add this to ensure backend knows it's from patient
      })
    });
    
    if (!response.ok) {
      console.error('Failed to send message via API');
    }
  } catch (err) {
    console.error('Error sending message via API:', err);
  }
  
  setMessages(prevMessages => [...prevMessages, formattedMessage]);
  setNewMessage('');
};

  const handleSelectDoctor = (doctor) => {
    // Only update if different doctor is selected
    if (!selectedDoctor || selectedDoctor._id !== doctor._id) {
      setSelectedDoctor(doctor);
    }
  };
  useEffect(() => {
    if (selectedDoctor) {
      console.log("Selected doctor changed:", selectedDoctor.name);
    }
  }, [selectedDoctor]);
  return (
    <div className="chat-page-container">
    <h2 className="chat-page-title">Communication Support</h2>

    <div className="chat-interface">
      <div className="contacts-list">
        <div className="contacts-header">Your Doctors</div>
        {loading && !selectedDoctor && <div className="loading">Loading doctors...</div>}
        
        {doctors.length === 0 && !loading ? (
          <div className="no-contacts">
            <p>No doctors found. Book an appointment first to chat with a doctor.</p>
          </div>
        ) : (
          <ul className="contacts">
            {doctors.map(doctor => (
              <li 
                key={doctor._id} 
                className={`contact-item ${selectedDoctor?._id === doctor._id ? 'selected' : ''}`}
                onClick={() => handleSelectDoctor(doctor)}
              >
                <div className="contact-avatar">
                  {doctor.name ? doctor.name.charAt(0).toUpperCase() : 'D'}
                </div>
                <div className="contact-info">
                  <span className="contact-name">{doctor.name}</span>
                  <span className="contact-subtitle">{doctor.specialization}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="chat-container">
        {!selectedDoctor ? (
          <div className="select-contact-prompt">
            <p>Select a doctor to start chatting</p>
          </div>
        ) : (
          <>
            <div className="chat-header">
              <h3>{selectedDoctor.name}</h3>
              <span className="contact-subtitle">{selectedDoctor.specialization}</span>
            </div>
            
            <div className="chat-messages">
              {loading ? (
                <div className="loading">Loading messages...</div>
              ) : (
                <>
                  {!messages || messages.length === 0 ? (
                    <div className="no-messages">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map(message => (
                      <div 
                        key={message._id} 
                        className={`message ${message.senderModel === 'Patient' || message.sender === 'patient' ? 'user-message' : 'doctor-message'}`}
                      >
                        <div className="message-header">
                          <span className="sender-name">
                            {message.senderModel === 'Patient' || message.sender === 'patient' ? 'You' : selectedDoctor.name}
                          </span>
                          <span className="message-time">{message.time}</span>
                        </div>
                        <div className="message-content">{message.content}</div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
            
            <form onSubmit={handleSendMessage} className="message-form">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={loading}
              />
              <button type="submit" className="send-button" disabled={loading || newMessage.trim() === ''}>
                Send
              </button>
            </form>
          </>
        )}
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}
      </div>
    </div>
  </div>
);
};

export default Chat;