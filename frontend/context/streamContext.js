import { createContext, useContext, useEffect, useState } from "react";
import { StreamVideoClient } from "@stream-io/video-react-native-sdk";
import { useAuth } from "./authContext";
import { GETSTREAM_API_KEY } from "@env";

export const StreamContext = createContext();

export const StreamContextProvider = ({ children }) => {
  const { user, streamToken } = useAuth();
  const [client, setClient] = useState(null);

  useEffect(() => {
    if (user && streamToken) {
      const streamClient = new StreamVideoClient({
        apiKey: GETSTREAM_API_KEY,
        token: streamToken,
        user: { id: user.id },
      });
      setClient(streamClient);
    } else {
      setClient(null);
    }
  }, [user, streamToken]);

  return (
    <StreamContext.Provider value={{ client }}>
      {children}
    </StreamContext.Provider>
  );
};