"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { MdOutlineLogout, MdDelete } from "react-icons/md";
import { auth, db } from "../../../firebase";
import { useAppContext } from "@/context/AppContext";

type Room = {
  id: string;
  name: string;
  createdat: Timestamp;
};

const Sidebar = () => {
  const { user, userid, setSelectedRoom, setSelectRoomName } = useAppContext();

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

  const selectRoom = (roomId: string, roomName: string) => {
    setSelectedRoom(roomId);
    setSelectRoomName(roomName);
  };

  const addNewRoom = async () => {
    const roomName = prompt("部屋名を入力");
    if (roomName) {
      const newRoomRef = collection(db, "rooms");
      await addDoc(newRoomRef, {
        name: roomName,
        userid: userid,
        createdat: serverTimestamp(),
      });
    }
  };

  const handleLogout = () => {
    auth.signOut(); // ログアウト
    setSelectedRoom(null); // ログアウト時に選択しているルームを初期化
  };

  // ルームの削除
  const deleteRoom = async (roomId: string) => {
    const confirmDelete = confirm("このルームを削除しますか？");
    if (confirmDelete) {
      const roomDocRef = doc(db, "rooms", roomId);
      await deleteDoc(roomDocRef);
    }
  };

  return (
    <div className="bg-blue-700 h-full overflow-y-auto px-5 flex flex-col">
      <div className="flex-grow">
        <div
          onClick={addNewRoom}
          className="cursor-pointer flex justify-evenly items-center border mt-2 rounded-md hover:bg-blue-500 duration-150"
        >
          <span className="text-white p-4 text-2xl">＋</span>
          <h1 className="text-white text-xl font-semibold p-4">New Chat</h1>
        </div>
        <ul>
          {rooms.map((room) => (
            <li
              key={room.id}
              className="flex justify-between items-center cursor-pointer border-b p-4 text-slate-100 hover:bg-blue-500 duration-150"
            >
              <span onClick={() => selectRoom(room.id, room.name)}>
                {room.name}
              </span>
              <MdDelete
                // ルーム削除のアイコン
                onClick={() => deleteRoom(room.id)}
                className="text-red-400 hover:text-red-600 duration-150 cursor-pointer size-5"
              />
            </li>
          ))}
        </ul>
      </div>
      {user && (
        <div className="mb-2 text-black text-lg font-medium flex justify-center">
          {user.email}
        </div>
      )}
      <div
        onClick={handleLogout}
        className="flex items-center justify-evenly text-lg mb-2 cursor-pointer p-4 text-slate-100 hover:bg-slate-700 duration-150"
      >
        <MdOutlineLogout />
        <span>ログアウト</span>
      </div>
    </div>
  );
};

export default Sidebar;
