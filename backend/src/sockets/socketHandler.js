import Message from "../models/Message.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";

const onlineUsers = new Map();

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.user.name);

    // Register authenticated user
    const userId = socket.user._id.toString();

    onlineUsers.set(userId, socket.id);

    // Notify everyone that this user is online
    io.emit("userOnline", {
      userId,
    });

    // Send current online users to newly connected client
    socket.emit("onlineUsers", [...onlineUsers.keys()]);

    // Join booking room
    socket.on("joinConversation", (bookingId) => {
      socket.join(bookingId);

      console.log(`${socket.user.name} joined room ${bookingId}`);
    });

    // User started typing
    socket.on("typingStart", (bookingId) => {
      socket.to(bookingId).emit("userTyping", {
        bookingId,
        userId: socket.user._id,
        name: socket.user.name,
      });
    });

    // User stopped typing
    socket.on("typingStop", (bookingId) => {
      socket.to(bookingId).emit("userStoppedTyping", {
        bookingId,
        userId: socket.user._id,
      });
    });

    // Send message
    socket.on("sendMessage", async (data) => {
      try {
        const { receiverId, bookingId, message } = data;

        const senderId = socket.user._id;

        // Verify booking exists
        const booking = await Booking.findById(bookingId);

        if (!booking) {
          socket.emit("errorMessage", "Booking not found");
          return;
        }

        // Verify sender belongs to booking
        const isCustomer = booking.customer.toString() === senderId.toString();

        const isProvider = booking.provider.toString() === senderId.toString();

        if (!isCustomer && !isProvider) {
          socket.emit("errorMessage", "Unauthorized");
          return;
        }

        // Determine expected receiver
        const expectedReceiver = isCustomer
          ? booking.provider.toString()
          : booking.customer.toString();

        if (receiverId !== expectedReceiver) {
          socket.emit("errorMessage", "Invalid receiver");
          return;
        }

        // Save message
        const newMessage = await Message.create({
          sender: senderId,
          receiver: receiverId,
          booking: bookingId,
          message,
        });

        await newMessage.populate("sender", "name email");
        await newMessage.populate("receiver", "name email");

        // Emit to everyone in the room
        io.to(bookingId).emit("newMessage", newMessage);
      } catch (error) {
        console.error(error);

        socket.emit("errorMessage", "Failed to send message");
      }
    });

    // Mark messages as read
    socket.on("markAsRead", async (bookingId) => {
      try {
        const userId = socket.user._id;

        // Verify booking exists
        const booking = await Booking.findById(bookingId);

        if (!booking) {
          socket.emit("errorMessage", "Booking not found");
          return;
        }

        // Verify user belongs to booking
        const isParticipant =
          booking.customer.toString() === userId.toString() ||
          booking.provider.toString() === userId.toString();

        if (!isParticipant) {
          socket.emit("errorMessage", "Unauthorized");
          return;
        }

        // Update unread messages addressed to this user
        await Message.updateMany(
          {
            booking: bookingId,
            receiver: userId,
            isRead: false,
          },
          {
            isRead: true,
          },
        );

        // Notify both participants
        io.to(bookingId).emit("messagesRead", {
          bookingId,
          userId,
        });
      } catch (error) {
        console.error(error);

        socket.emit("errorMessage", "Failed to mark messages as read");
      }
    });

    socket.on("disconnect", async () => {
      try {
        const userId = socket.user._id.toString();

        onlineUsers.delete(userId);

        await User.findByIdAndUpdate(userId, {
          lastseen: new Date(),
        });

        io.emit("userOffline", {
          userId,
          lastseen: new Date(),
        });

        console.log("User disconnected:", socket.user.name);
      } catch (error) {
        console.error(error);
      }
    });
  });
};

export default socketHandler;
