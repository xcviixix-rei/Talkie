// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

// Import firebase (initializes the Firestore instance)
import "./firebase.js";

// Import routes
import userRoutes from "./routes/users.js";
// Import other routes as needed, for example:
// import conversationRoutes from "./routes/conversations.js";
// import messageRoutes from "./routes/messages.js";
// import notificationRoutes from "./routes/notifications.js";
// import typingIndicatorRoutes from "./routes/typingIndicators.js";
// import readReceiptRoutes from "./routes/readReceipts.js";
// import callRoutes from "./routes/calls.js";

const app = express();

app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// API routes
app.use("/api/users", userRoutes);
// app.use("/api/conversations", conversationRoutes);
// app.use("/api/messages", messageRoutes);
// app.use("/api/notifications", notificationRoutes);
// app.use("/api/typingIndicators", typingIndicatorRoutes);
// app.use("/api/readReceipts", readReceiptRoutes);
// app.use("/api/calls", callRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
