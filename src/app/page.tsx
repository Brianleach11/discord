"use client";
import { useState } from "react";

interface Message {
  sender: string;
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "user", content: "Hello, how are you?" },
    { sender: "bot", content: "I'm good, thanks for asking!" },
  ]);
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessages([...messages, { sender: "user", content: input }]);
    setInput("");
  };

  return (
    <div>
      {messages.map((message, index) => (
        <div key={index}>
          <strong>{message.sender}:</strong>:{message.content}
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="message"
          id="message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
