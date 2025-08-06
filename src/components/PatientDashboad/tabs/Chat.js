import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import config from '../../../config/config';

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
        
        const userString = localStorage.getItem('user');
        if (!userString) {
          throw new Error('User data not found in local storage');
        }
        
        const userData = JSON.parse(userString);
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${config.API_URL}/api/patient/chat/doctors`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch doctors: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Doctors API response:', data);
        
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
  }, []);

  // Initialize socket connection once when component mounts
  useEffect(() => {
    const userString = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userString || !token) return;

    const userData = JSON.parse(userString);

    // Connect to socket.io server
    socketRef.current = io(`${config.API_URL}`, {
      auth: {
        token: token
      }
    });

    // Listen for connection confirmation
    socketRef.current.on('connect', () => {
      console.log('Connected to socket server');
    });

    // Listen for incoming messages
    socketRef.current.on('new-message', (data) => {
      console.log('Received new message:', data);
      
      // Format the incoming message to match your expected format
      const formattedMessage = {
        _id: data.message._id || Date.now().toString(),
        content: data.message.content,
        sender: data.message.senderModel === 'Patient' ? 'patient' : 'doctor',
        name: data.message.senderModel === 'Doctor' ? data.sender?.name || 'Doctor' : 'You',
        time: new Date(data.message.timestamp).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        }),
        timestamp: data.message.timestamp,
        senderModel: data.message.senderModel
      };
      
      setMessages(prevMessages => [...prevMessages, formattedMessage]);
    });

    // Listen for message sent confirmation
    socketRef.current.on('message-sent', (data) => {
      console.log('Message sent confirmation:', data);
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
        socketRef.current.connect();
      }
    });

    // Cleanup on unmount
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

  // Fetch chat history when a doctor is selected
  useEffect(() => {
    if (!selectedDoctor) return;
    
    const fetchChatHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${config.API_URL}/api/patient/chat/history/${selectedDoctor._id}`, {
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
          // Transform messages to match expected format
          const formattedMessages = (data.chat?.messages || []).map(msg => ({
            _id: msg._id,
            content: msg.content,
            sender: msg.senderModel === 'Patient' ? 'patient' : 'doctor',
            name: msg.senderModel === 'Patient' ? 'You' : selectedDoctor.name,
            time: new Date(msg.timestamp).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit', 
              hour12: true 
            }),
            timestamp: msg.timestamp,
            senderModel: msg.senderModel
          }));
          
          setMessages(formattedMessages);
        } else {
          throw new Error(data.message || 'Failed to fetch chat history');
        }
      } catch (err) {
        console.error('Error fetching chat history:', err);
        setError(err.message);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChatHistory();

    // Join the chat room for this doctor
    if (socketRef.current && socketRef.current.connected) {
      const userData = JSON.parse(localStorage.getItem('user'));
      const chatId = `${selectedDoctor._id}_${userData.id}`;
      
      socketRef.current.emit('join-chat', {
        chatId: chatId,
        otherUserId: selectedDoctor._id
      });
    }
  }, [selectedDoctor]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !selectedDoctor || !socketRef.current) return;
    
    const userString = localStorage.getItem('user');
    if (!userString) return;
    
    const userData = JSON.parse(userString);
    
    // Create message object
    const messageData = {
      chatId: `${selectedDoctor._id}_${userData.id}`,
      receiverId: selectedDoctor._id,
      content: newMessage,
      timestamp: new Date().toISOString()
    };
    
    // Emit message to server
    socketRef.current.emit('send-message', messageData);
    
    // Add message to local state (optimistic update)
    const formattedMessage = {
      _id: Date.now().toString(),
      sender: 'patient',
      name: 'You',
      content: newMessage,
      time: new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      }),
      timestamp: new Date().toISOString(),
      senderModel: 'Patient'
    };

    setMessages(prevMessages => [...prevMessages, formattedMessage]);
    setNewMessage('');
  };

  const handleSelectDoctor = (doctor) => {
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