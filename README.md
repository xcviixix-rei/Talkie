# Talkie

A smart messaging platform that revolutionizes communication through advanced real-time features, AI integration, and collaborative tools. Talkie combines the power of modern technology with intuitive design to deliver a seamless messaging experience across all devices.

Developed as a group project for mobile app development credits
Contributors:  
[22028195 - TRAN THE MANH](https://github.com/tranmanh2004)  
[22028267 - LE MINH DUC](https://github.com/kuduck192)  
[22028026 - DAM QUANG DAT](https://github.com/quangdatltw)  
[22028307 - NGUYEN NHAT PHONG](https://github.com/xcviixix-rei)  
[22028313 - LE VAN THANG](https://github.com/thnglee)

## Features

### 💬 Real-time Messaging
- Instant message delivery with typing indicators
- Read receipts and message status tracking
- Rich media support (images, videos, documents)
- Message reactions and emoji support
- Thread-based conversations
- Message editing and deletion
- File sharing up to 100MB

### 📞 Voice and Video Calls
- HD voice and video calls
- Group calls supporting up to 8 participants
- Screen sharing capabilities
- Background noise suppression
- Picture-in-picture mode
- Call recording (with participant consent)
- Bandwidth optimization for stable connections

### 🤖 AI-powered Smart Replies
- Context-aware response suggestions
- Sentiment analysis for appropriate replies
- Custom response learning based on user patterns
- Quick action suggestions
- Smart command recognition
- Meeting scheduling assistance
- Auto-categorization of messages

### 📝 Message Summarization
- TL;DR generation for long conversations
- Meeting minutes generation
- Topic-based conversation clustering
- Key points extraction
- Action items identification
- Custom summary length options
- Export summaries in multiple formats

### 🌐 Multi-language Translation
- Real-time message translation in 50+ languages
- Automatic language detection
- Preserve original message formatting
- Cultural context awareness
- Idiom and slang handling
- Custom dictionary support
- Translation memory for consistency

### 🎨 Collaborative Whiteboard
- Real-time drawing and sketching
- Multiple tools (pen, shapes, text, etc.)
- Image import and annotation
- Infinite canvas with zoom capabilities
- Template library
- Session recording
- Export to multiple formats (PNG, PDF, SVG)

### 👥 Shared Workspaces
- Customizable workspace layouts
- Role-based access control
- Document collaboration
- Task management integration
- Calendar synchronization
- Activity tracking
- Workspace analytics

### 📱 Cross-platform Support
- Native Android and iOS apps
- Consistent experience across devices
- Offline functionality
- Data synchronization
- Push notifications

## Tech Stack

- **Frontend**: React Native/Expo
  - Tailwind CSS for styling
  - Custom UI components
  - Optimized performance
  - Responsive design

- **Backend**: Node.js
  - RESTful API architecture
  - WebSocket integration
  - Microservices architecture
  - Scalable infrastructure

- **Real-time**: Firebase
  - Real-time database
  - Cloud Functions
  - Authentication
  - Cloud Storage

## Mobile Development Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- Expo CLI
- Firebase account

### Android Setup

1. Install Android Studio and set up an Android Virtual Device (AVD)
2. Set up environment variables:
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

3. Start the Android emulator:
   ```bash
   npm run emu
   ```

4. Run the app on Android:
   ```bash
   npm run android
   ```


## Project Structure

```
Talkie/
├── frontend/              # React Native/Expo application
│   ├── app/              # Main application code
│   ├── components/       # Reusable components
│   ├── services/         # API and service integrations
│   └── assets/          # Images, fonts, etc.
├── backend/              # Node.js server
│   ├── controllers/      # Request handlers
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   └── services/        # Business logic
├── android/             # Android-specific code
└── talkie-appium-tests/ # Automated testing suite
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (see .env.example)
4. Start the development server:
   ```bash
   npm run dev
   ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

