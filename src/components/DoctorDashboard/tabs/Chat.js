import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import config from '../../../config/config';
import './Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Fetch patients the doctor has appointments with
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError(null);

        const userString = localStorage.getItem('user');
        if (!userString) {
          throw new Error('User data not found in local storage');
        }

        const userData = JSON.parse(userString);
        const token = localStorage.getItem('token');

        const response = await fetch(`${config.API_URL}/api/doctor/chat/patients`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch patients: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched patients:', data);

        if (data.success) {
          setPatients(data.patients);
        } else {
          throw new Error(data.message || 'Failed to fetch patients');
        }
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Initialize socket connection once when component mounts
  useEffect(() => {
    const userString = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userString || !token) return;

    const userData = JSON.parse(userString);

    // Connect to socket.io server
    socketRef.current = io(config.API_URL, {
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
        name: data.message.senderModel === 'Patient' ? data.sender?.name || 'Patient' : 'You',
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
      setError('Failed to connect to chat server. Please try again later.');
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Scroll to bottom only when new messages are added
  useEffect(() => {
    // Only scroll if the new message is from the current conversation
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && Date.now() - new Date(lastMessage.timestamp) < 1000) {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      }
    }
  }, [messages]);

  // Fetch chat history when a patient is selected
  useEffect(() => {
    if (!selectedPatient) return;

    const fetchChatHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        console.log('Fetching chat history for patient:', selectedPatient);

        const response = await fetch(`${config.API_URL}/api/doctor/chat/history/${selectedPatient._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Failed to fetch chat history: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Received chat history:', data);

        if (data.success) {
          // Transform the messages to match the expected format
          const formattedMessages = data.chat.messages.map(msg => ({
            _id: msg._id,
            content: msg.content,
            sender: msg.senderModel === 'Patient' ? 'patient' : 'doctor',
            name: msg.senderModel === 'Patient' ? selectedPatient.name : 'You',
            time: new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
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
      } finally {
        setLoading(false);
      }
    };

    fetchChatHistory();

    // Join the chat room for this patient
    if (socketRef.current && socketRef.current.connected) {
      const userData = JSON.parse(localStorage.getItem('user'));
      const chatId = `${userData.id}_${selectedPatient._id}`;
      
      socketRef.current.emit('join-chat', {
        chatId: chatId,
        otherUserId: selectedPatient._id
      });
    }
  }, [selectedPatient]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !selectedPatient || !socketRef.current) return;

    const userString = localStorage.getItem('user');
    if (!userString) return;

    const userData = JSON.parse(userString);

    // Create message object
    const messageData = {
      chatId: `${userData.id}_${selectedPatient._id}`,
      receiverId: selectedPatient._id,
      content: newMessage,
      timestamp: new Date().toISOString()
    };
    
    // Emit message to server
    socketRef.current.emit('send-message', messageData);
    
    // Add message to local state (optimistic update)
    const formattedMessage = {
      _id: Date.now().toString(),
      content: newMessage,
      sender: 'doctor',
      name: 'You',
      time: new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      }),
      timestamp: new Date().toISOString(),
      senderModel: 'Doctor'
    };
    
    setMessages(prevMessages => [...prevMessages, formattedMessage]);
    setNewMessage('');
  };

  const handleSelectPatient = (patient) => {
    setMessages([]); // Clear messages before loading new ones
    setSelectedPatient(patient);
  };

  const handleBackToList = () => {
    setSelectedPatient(null);
    setMessages([]);
  };

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="chat-page-container">
      <div className="chat-interface">
        {/* Contacts List */}
        <div className={`contacts-list ${selectedPatient ? 'hide-on-mobile' : ''}`}>
          <div className="contacts-header">
            <div className="header-content">
              <h2>Chats</h2>
            </div>
            <div className="search-box">
              <input
                type="text"
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {loading && !selectedPatient && (
            <div className="loading">Loading patients...</div>
          )}

          {patients.length === 0 && !loading ? (
            <div className="no-contacts">
              <p>No patients found. Patients who have booked appointments will appear here.</p>
            </div>
          ) : (
            <ul className="contacts">
              {filteredPatients.map(patient => (
                <li
                  key={patient._id}
                  className={`contact-item ${selectedPatient?._id === patient._id ? 'selected' : ''}`}
                  onClick={() => handleSelectPatient(patient)}
                >
                  <div className="contact-avatar">
                    {patient.name ? patient.name.charAt(0).toUpperCase() : 'P'}
                  </div>
                  <div className="contact-info">
                    <div className="contact-header">
                      <span className="contact-name">{patient.name}</span>
                      <span className="last-message-time">
                        {/* Add last message time if available */}
                      </span>
                    </div>
                    <span className="contact-subtitle">{patient.email}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Chat Container */}
        <div className={`chat-container ${!selectedPatient ? 'hide-on-mobile' : ''}`}>
          {selectedPatient && (
            <>
              <div className="chat-header">
                <div className="back-button" onClick={handleBackToList}>
                  <span className="back-arrow">‹</span>
                </div>
                <div className="selected-patient-info">
                  <h3>{selectedPatient.name}</h3>
                  <span className="contact-subtitle">{selectedPatient.email}</span>
                </div>
              </div>

              <div className="chat-messages">
                {loading ? (
                  <div className="loading">Loading messages...</div>
                ) : (
                  <>
                    {messages.length === 0 ? (
                      <div className="no-messages">
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map(message => (
                        <div
                          key={message._id}
                          className={`message-wrapper ${message.sender === 'doctor' || message.senderModel === 'Doctor' ? 'user-message' : 'patient-message'}`}
                        >
                          <div className="message">
                            <div className="message-content">{message.content}</div>
                            <div className="message-meta">
                              <span className="message-time">{message.time}</span>
                            </div>
                          </div>
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
                <button 
                  type="submit" 
                  className="send-button" 
                  disabled={loading || newMessage.trim() === ''}
                >
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}
    </div>
  );
};

export default Chat;