import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Send, User, MessageCircle, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Message } from "../types";

export default function ChatPage({ user }: { user: any }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [roomId, setRoomId] = useState("general");
  const [connected, setConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setConnected(true);
      newSocket.emit("join_room", roomId);
    });

    newSocket.on("receive_message", (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket || !user) return;

    const messageData: Message = {
      roomId,
      sender: user.name,
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    socket.emit("send_message", messageData);
    setInput("");
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-orange-50 p-6 rounded-full mb-6">
          <MessageCircle className="w-12 h-12 text-orange-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Sign In to Chat</h2>
        <p className="text-gray-500 mb-8 max-w-md">Connect with other pet owners and community members in real-time.</p>
        <button
          onClick={() => window.location.href = "/auth"}
          className="bg-orange-500 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition-all shadow-lg"
        >
          Sign In / Sign Up
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 h-[calc(100vh-64px)] flex flex-col">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight uppercase">Community Chat</h1>
          <p className="text-gray-500 font-medium flex items-center gap-2">
            {connected ? (
              <span className="flex items-center gap-1 text-green-500 text-xs font-bold uppercase tracking-widest">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Online
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-500 text-xs font-bold uppercase tracking-widest">
                <span className="w-2 h-2 bg-red-500 rounded-full" /> Connecting...
              </span>
            )}
            • Room: <span className="text-orange-500 font-bold">#{roomId}</span>
          </p>
        </div>
        <div className="flex gap-2">
          {["general", "lost", "found"].map((room) => (
            <button
              key={room}
              onClick={() => {
                setRoomId(room);
                setMessages([]);
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                roomId === room ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              }`}
            >
              #{room}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col">
        {/* Messages Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence initial={false}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-300">
                <MessageCircle className="w-16 h-16 mb-4 opacity-20" />
                <p className="font-bold uppercase tracking-widest text-sm">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex flex-col ${msg.sender === user.name ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{msg.sender}</span>
                    <span className="text-[10px] font-medium text-gray-300">{msg.timestamp}</span>
                  </div>
                  <div className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm font-medium shadow-sm ${
                    msg.sender === user.name
                      ? "bg-orange-500 text-white rounded-tr-none"
                      : "bg-gray-100 text-gray-700 rounded-tl-none"
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <form onSubmit={handleSendMessage} className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-6 py-4 bg-white border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-medium shadow-sm"
            />
            <button
              type="submit"
              disabled={!input.trim() || !connected}
              className="bg-orange-500 text-white p-4 rounded-2xl hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-500/20 disabled:opacity-50 group"
            >
              <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3 p-4 bg-orange-50 rounded-2xl border border-orange-100">
        <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
        <p className="text-[10px] font-medium text-gray-600 leading-relaxed">
          Messages are not persisted and will be cleared on page refresh. This is a real-time community chat for immediate assistance.
        </p>
      </div>
    </div>
  );
}
