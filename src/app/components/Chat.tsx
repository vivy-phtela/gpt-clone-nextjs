"use client";

import React, { useEffect, useRef, useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { db } from "../../../firebase";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { useAppContext } from "@/context/AppContext";
import OpenAI from "openai";
import LoadingIcons from "react-loading-icons"; // ローディングアイコン

type Message = {
  text: string;
  sender: string;
  createdat: Timestamp;
};

const Chat = () => {
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_APIKEY,
    dangerouslyAllowBrowser: true,
  });

  const { selectedRoom, selectRoomName } = useAppContext();
  const [inputMessage, setInputMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const scrollDiv = useRef<HTMLDivElement>(null);

  // ルームを選択したらメッセージを取得
  useEffect(() => {
    if (selectedRoom) {
      const fetchMessages = async () => {
        const roomDocRef = doc(db, "rooms", selectedRoom);
        const messageCollectionRef = collection(roomDocRef, "messages");

        const q = query(messageCollectionRef, orderBy("createdat"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const newMessages = snapshot.docs.map((doc) => doc.data() as Message);
          setMessages(newMessages);
        });
        return () => {
          unsubscribe();
        };
      };
      fetchMessages();
    }
  }, [selectedRoom]);

  // メッセージが追加されたら一番下までスクロールする
  useEffect(() => {
    if (scrollDiv.current) {
      const element = scrollDiv.current;
      element.scrollTo({
        top: element.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return; // 空文字の場合は何もしない
    const messageData = {
      createdat: serverTimestamp(),
      sender: "user",
      text: inputMessage,
    };
    // メッセージをfirebaseに保存
    const roomDocRef = doc(db, "rooms", selectedRoom!);
    const messageCollectionRef = collection(roomDocRef, "messages");
    await addDoc(messageCollectionRef, messageData);

    setInputMessage(""); // メッセージを送信したら文字を消す
    setIsLoading(true);

    // GPTからの返答を取得
    const gptResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: inputMessage },
      ],
    });

    setIsLoading(false);

    const botResponse = gptResponse.choices[0].message.content;
    await addDoc(messageCollectionRef, {
      createdat: serverTimestamp(),
      sender: "bot",
      text: botResponse,
    });
  };

  return (
    <div className="bg-gray-500 h-full p-4 flex flex-col">
      <h1 className="text-2xl text-white font-semibold mb-4">
        {selectRoomName}
      </h1>
      <div className="flex-grow overflow-y-auto mb-4" ref={scrollDiv}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={message.sender === "user" ? "text-right" : "text-left"}
          >
            <div
              className={
                message.sender === "user"
                  ? "bg-green-500 inline-block rounded px-4 py-2 mb-2"
                  : "bg-blue-500 inline-block rounded px-4 py-2 mb-2"
              }
            >
              <p className="text-white">{message.text}</p>
            </div>
          </div>
        ))}
        {isLoading && <LoadingIcons.SpinningCircles />}
      </div>

      <div className="flex-shrink-0 relative">
        <input
          type="text"
          placeholder="Send a Message"
          className="boder-2 rounded w-full pr-10 focus:outline-none p-2"
          onChange={(e) => setInputMessage(e.target.value)}
          value={inputMessage}
          onKeyDown={(e) => {
            // エンターキーでメッセージを送信
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
        />
        <button
          className="absolute inset-y-0 right-4 flex items-center"
          onClick={() => sendMessage()}
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default Chat;
