"use client";

import { onAuthStateChanged, User } from "firebase/auth";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { auth } from "../../firebase";
import { useRouter } from "next/navigation";

type AppProviderProps = {
  children: ReactNode;
};

type AppContextType = {
  user: User | null;
  userid: string | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  selectedRoom: string | null;
  setSelectedRoom: React.Dispatch<React.SetStateAction<string | null>>;
  selectRoomName: string | null;
  setSelectRoomName: React.Dispatch<React.SetStateAction<string | null>>;
};

const defaultContextData = {
  user: null,
  userid: null,
  setUser: () => {},
  selectedRoom: null,
  setSelectedRoom: () => {},
  selectRoomName: null,
  setSelectRoomName: () => {},
};

const AppContext = createContext<AppContextType>(defaultContextData);

export function AppProvider({ children }: AppProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userid, setUserId] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectRoomName, setSelectRoomName] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (newUser) => {
      setUser(newUser);
      setUserId(newUser ? newUser.uid : null);
      if (!newUser) {
        router.push("/auth/login");
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        userid,
        setUser,
        selectedRoom,
        setSelectedRoom,
        selectRoomName,
        setSelectRoomName,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
