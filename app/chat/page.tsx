"use client";

import { useEffect, useRef, useState } from "react";
import { useOpenClawChat, type ChatMessage } from "@/hooks/use-openclaw-chat";
import { useOpenClaw } from "@/contexts/OpenClawContext";
import { Send, Square, Bot, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ChatPage() {
  const { isConnected } = useOpenClaw();
  const { messages, isStreaming, error, sendMessage, abort, loadHistory } = useOpenClawChat();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isConnected) loadHistory();
  }, [isConnected, loadHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input.trim());
    setInput("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)]">
      <div className="px-6 py-4 border-b flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Chat</h1>
          <p className="text-xs text-muted-foreground">Talk to your Blossom AI assistant</p>
        </div>
        {!isConnected && (
          <Badge variant="destructive">Disconnected</Badge>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="h-16 w-16 mb-4 text-muted-foreground" />
            <p className="text-lg font-medium text-foreground">Start a conversation</p>
            <p className="text-sm mt-1 text-muted-foreground">Type a message below</p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {error && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="px-6 py-4 border-t shrink-0">
        <Card className="p-3">
          <div className="flex items-end gap-3">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm"
              style={{ maxHeight: "120px" }}
              disabled={!isConnected}
            />
            {isStreaming ? (
              <Button size="icon" variant="destructive" onClick={abort} title="Stop generating">
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || !isConnected}
                title="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const isStreamingMsg = message.state === "delta";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className={isUser ? "bg-primary text-primary-foreground" : "bg-muted"}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      <div
        className={`max-w-[75%] rounded-xl px-4 py-2.5 ${
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-card text-card-foreground border rounded-bl-sm"
        }`}
      >
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
          {isStreamingMsg && (
            <span className="inline-block w-1.5 h-4 ml-0.5 bg-current opacity-60 animate-pulse" />
          )}
        </div>
        {message.state === "error" && (
          <div className="text-xs mt-1 opacity-70">Error generating response</div>
        )}
      </div>
    </div>
  );
}
