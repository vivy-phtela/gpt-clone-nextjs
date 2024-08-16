"use client";

import Chat from "./components/Chat";
import Sidebar from "./components/Sidebar";

export default function Home() {
  return (
    <div className="flex h-screen justify-center items-center">
      <div className="h-full flex w-full">
        <div className="w-1/6 h-full border-r">
          <Sidebar />
        </div>
        <div className="w-5/6 h-full">
          <Chat />
        </div>
      </div>
    </div>
  );
}
