// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

// Import firebase (initializes the Firestore instance)
import "./firebase.js";

// Import routes
import userRoutes from "./controllers/users.js";
import conversationRoutes from "./controllers/conversations.js";
import messageRoutes from "./controllers/messages.js";
import notificationRoutes from "./controllers/notifications.js";
import typingIndicatorRoutes from "./controllers/typingIndicators.js";
import readReceiptRoutes from "./controllers/readReceipts.js";
import callRoutes from "./controllers/calls.js";
import searchRoutes from "./controllers/search.js";
import aiRoutes from './controllers/aiRoutes.js';
import collectionRoutes from "./controllers/collections.js";


const app = express();

app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// API routes
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/typingIndicators", typingIndicatorRoutes);
app.use("/api/readReceipts", readReceiptRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/search", searchRoutes);
app.use('/api/ai', aiRoutes);
app.use("/api/collections", collectionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
