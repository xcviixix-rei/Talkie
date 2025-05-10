# Talkie

A smart messaging platform with real-time chat, voice/video calls, AI-powered replies, message summarization, translation, and collaborative features like whiteboard and workspaces.

## Features

- 💬 Real-time messaging
- 📞 Voice and video calls
- 🤖 AI-powered smart replies
- 📝 Message summarization
- 🌐 Multi-language translation
- 🎨 Collaborative whiteboard
- 👥 Shared workspaces
- 📱 Cross-platform support (Android & iOS)

## Tech Stack

- **Frontend**: React Native/Expo
- **Backend**: Node.js
- **Real-time**: Firebase
- **Styling**: Tailwind CSS
- **Testing**: Appium (Automation Testing)

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

### iOS Setup (macOS only)

1. Install Xcode from the Mac App Store
2. Install CocoaPods:
   ```bash
   sudo gem install cocoapods
   ```

3. Run the app on iOS:
   ```bash
   npm run ios
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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the repository or contact the development team.
