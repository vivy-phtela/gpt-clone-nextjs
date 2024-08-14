"use client";

import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { MdOutlineLogout } from "react-icons/md";
import { db } from "../../../firebase";
import { useAppContext } from "@/context/AppContext";

type Room = {
  id: string;
  name: string;
  createdat: Timestamp;
};

const Sidebar = () => {
  const { user, userid, setSelectedRoom } = useAppContext();

  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    if (user) {
      const fetchRooms = async () => {
        const roomCollectionRef = collection(db, "rooms");
        const q = query(
          roomCollectionRef,
          where("userid", "==", userid),
          orderBy("createdat")
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const newRooms: Room[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name,
            createdat: doc.data().createdat,
          }));
          setRooms(newRooms);
        });
        return () => {
          unsubscribe();
        };
      };
      fetchRooms();
    }
  }, [userid]);

  const selectRoom = (roomId: string) => {
    setSelectedRoom(roomId);
  };

  return (
    <div className="bg-blue-700 h-full overflow-y-auto px-5 flex flex-col">
      <div className="flex-grow">
        <div className="cursor-pointer flex justify-evenly items-center border mt-2 rounded-md hover:bg-blue-500 duration-150">
          <span className="text-white p-4 text-2xl">＋</span>
          <h1 className="text-white text-xl font-semibold p-4">New Chat</h1>
        </div>
        <ul>
          {rooms.map((room) => (
            <li
              key={room.id}
              className="cursor-pointer border-b p-4 text-slate-100 hover:bg-blue-500 duration-150"
              onClick={() => selectRoom(room.id)}
            >
              {room.name}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-center justify-evenly text-lg mb-2 cursor-pointer p-4 text-slate-100 hover:bg-slate-700 duration-150">
        <MdOutlineLogout />
        <span>ログアウト</span>
      </div>
    </div>
  );
};

export default Sidebar;
