import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Fetch patients the doctor has appointments with
  useEffect(() => {
    const fetchPatients = async () => {
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

        const response = await fetch(`http://localhost:5000/api/doctor/chat/patients`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch patients: ${response.status}`);
        }

        const data = await response.json();

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

  // Connect to socket and fetch chat history when a patient is selected
  useEffect(() => {
    if (!selectedPatient) return;

    const userString = localStorage.getItem('user');
    if (!userString) return;

    const userData = JSON.parse(userString);
    const token = localStorage.getItem('token');

    // Fetch chat history
    const fetchChatHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching chat history for patient:', selectedPatient);

        const response = await fetch(`http://localhost:5000/api/doctor/chat/history/${selectedPatient._id}`, {
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
            name: msg.senderModel === 'Patient' ? selectedPatient.firstName + ' ' + selectedPatient.lastName : 'You',
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

    // Connect to socket.io server
    socketRef.current = io('http://localhost:5000', {
      auth: {
        token: token
      },
      query: {
        userId: userData.id,
        role: 'doctor',
        receiverId: selectedPatient._id
      }
    });

    // Listen for incoming messages
    socketRef.current.on('message', (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    });

    // Listen for connection errors
    socketRef.current.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError('Failed to connect to chat server. Please try again later.');
    });

    return () => {
      // Disconnect socket when component unmounts or patient changes
      socketRef.current.disconnect();
    };
  }, [selectedPatient]);


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !selectedPatient || !socketRef.current) return;

    const userString = localStorage.getItem('user');
    if (!userString) return;

    const userData = JSON.parse(userString);

    // Create message object
    const messageData = {
      chatId: `${userData.id}_${selectedPatient._id}`, // Add this line to explicitly set chatId
      senderId: userData.id,
      senderName: `Dr. ${userData.firstName} ${userData.lastName}`.trim(),
      receiverId: selectedPatient._id,
      content: newMessage,
      timestamp: new Date().toISOString(),
      senderModel: 'Doctor'
    };
    
    // Emit message to server - use the correct event name
    socketRef.current.emit('send-message', messageData); // Change from 'sendMessage' to 'send-message'
    
    // ... existing code ...
    
    // Listen for incoming messages - use the correct event name
    socketRef.current.on('new-message', (data) => { // Change from 'message' to 'new-message'
      console.log('Received new message:', data);
      
      // Format the incoming message to match your expected format
      const formattedMessage = {
        _id: data.message._id || Date.now().toString(),
        content: data.message.content,
        sender: data.message.senderModel === 'Patient' ? 'patient' : 'doctor',
        name: data.message.senderModel === 'Patient' ? selectedPatient.firstName + ' ' + selectedPatient.lastName : 'You',
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
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
  };
  console.log('Selected Patient:', selectedPatient);

  return (
    <div className="chat-page-container">
      <h2 className="chat-page-title">Patient Communication</h2>

      <div className="chat-interface">
        <div className="contacts-list">
          <div className="contacts-header">Your Patients</div>
          {loading && !selectedPatient && <div className="loading">Loading patients...</div>}

          {patients.length === 0 && !loading ? (
            <div className="no-contacts">
              <p>No patients found. Patients who have booked appointments will appear here.</p>
            </div>
          ) : (
            <ul className="contacts">
              {patients.map(patient => (
                <li
                  key={patient._id}
                  className={`contact-item ${selectedPatient?._id === patient._id ? 'selected' : ''}`}
                  onClick={() => handleSelectPatient(patient)}
                >
                  <div className="contact-avatar">
                    {patient.name ? patient.name.charAt(0).toUpperCase() : 'P'}
                  </div>
                  <div className="contact-info">
                    <span className="contact-name">{patient.name}</span>
                    <span className="contact-subtitle">{patient.email}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="chat-container">
          {!selectedPatient ? (
            <div className="select-contact-prompt">
              <p>Select a patient to start chatting</p>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <h3>{selectedPatient.name}</h3>
                <span className="contact-subtitle">{selectedPatient.email}</span>
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
                          className={`message ${message.sender === 'doctor' || message.senderModel === 'Doctor' ? 'user-message' : 'patient-message'}`}
                        >
                          <div className="message-header">
                            <span className="sender-name">
                              {message.sender === 'doctor' || message.senderModel === 'Doctor' ? 'You' : selectedPatient.name}
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
