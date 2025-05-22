const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const Chat = require('./models/Chat');

module.exports = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Store online users
  const onlineUsers = new Map();

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = {
        id: decoded.id,
        role: decoded.role
      };
      next();
    } catch (error) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id} (${socket.user.role})`);
    
    // Add user to online users
    onlineUsers.set(socket.user.id, {
      socketId: socket.id,
      role: socket.user.role
    });
    
    // Join a room specific to this user
    socket.join(socket.user.id);
    
    // Handle joining a chat
    socket.on('join-chat', async ({ chatId, otherUserId }) => {
      try {
        // Join a room for this specific chat
        socket.join(chatId);
        
        // If the other user is online, mark messages as read
        if (onlineUsers.has(otherUserId)) {
          const chat = await Chat.findById(chatId);
          if (chat) {
            let updated = false;
            
            chat.messages.forEach(message => {
              if (message.sender.toString() === otherUserId && !message.read) {
                message.read = true;
                updated = true;
              }
            });
            
            if (updated) {
              await chat.save();
              
              // Notify the other user that messages were read
              io.to(otherUserId).emit('messages-read', { chatId });
            }
          }
        }
      } catch (error) {
        console.error('Error joining chat:', error);
      }
    });
    
    // Handle new message
    socket.on('send-message', async (messageData) => {
      try {
        const { chatId, receiverId, content } = messageData;
        
        // Ensure we have a valid chatId
        const actualChatId = chatId || `${socket.user.role === 'doctor' ? socket.user.id : receiverId}_${socket.user.role === 'patient' ? socket.user.id : receiverId}`;
        
        // Use findOneAndUpdate with upsert to create if not exists
        const newMessage = {
          sender: socket.user.id,
          senderModel: socket.user.role === 'doctor' ? 'Doctor' : 'Patient',
          content,
          timestamp: new Date(),
          read: false
        };
        
        // Use findOneAndUpdate with upsert to create if not exists
        const chat = await Chat.findOneAndUpdate(
          { _id: actualChatId },  // Use _id for the query
          { 
            $push: { messages: newMessage },
            $set: { 
              lastMessage: new Date(),
              doctor: socket.user.role === 'doctor' ? socket.user.id : receiverId,
              patient: socket.user.role === 'patient' ? socket.user.id : receiverId
            }
          },
          { 
            new: true, 
            upsert: true,
            setDefaultsOnInsert: true
          }
        );
        
        // Emit message to sender for confirmation
        socket.emit('message-sent', {
          success: true,
          message: newMessage
        });
        
        // Emit message to receiver if online
        if (onlineUsers.has(receiverId)) {
          io.to(receiverId).emit('new-message', {
            chatId: actualChatId,
            message: newMessage,
            sender: {
              id: socket.user.id,
              role: socket.user.role
            }
          });
        }
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
    
    // Handle read receipts
    socket.on('mark-as-read', async ({ chatId, messageIds }) => {
      try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }
        
        let updated = false;
        let otherUserId;
        
        chat.messages.forEach(message => {
          if (messageIds.includes(message._id.toString()) && !message.read) {
            message.read = true;
            updated = true;
            
            // Determine the other user
            if (socket.user.role === 'doctor') {
              otherUserId = chat.patient.toString();
            } else {
              otherUserId = chat.doctor.toString();
            }
          }
        });
        
        if (updated) {
          await chat.save();
          
          // Notify the other user that messages were read
          if (otherUserId && onlineUsers.has(otherUserId)) {
            io.to(otherUserId).emit('messages-read', {
              chatId,
              messageIds
            });
          }
        }
      } catch (error) {
        console.error('Error marking messages as read:', error);
        socket.emit('error', { message: 'Failed to mark messages as read' });
      }
    });
    
    // Handle typing indicators
    socket.on('typing', ({ chatId, isTyping }) => {
      socket.to(chatId).emit('user-typing', {
        userId: socket.user.id,
        isTyping
      });
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id} (${socket.user.role})`);
      onlineUsers.delete(socket.user.id);
    });
  });

  return io;
};