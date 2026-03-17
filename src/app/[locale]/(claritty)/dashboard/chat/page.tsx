"use client";

import { ChatPage } from "@/app/_components/chat/ChatPage";

export default function DashboardChatPage() {
  return (
    <div className="h-full min-h-[calc(100vh-56px)] from-main to-main/90">
      <ChatPage />
    </div>
  );
}
