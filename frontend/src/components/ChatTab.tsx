"use client";

import React, { useState, useRef, useEffect } from "react";
import { DocumentDetail, ChatMessage } from "@/types";
import { chatWithDocument } from "@/lib/api";
import {
  Send,
  FileSearch,
  Bookmark,
  Loader2,
  CornerDownLeft,
  Terminal,
} from "lucide-react";

interface ChatTabProps {
  document: DocumentDetail | null;
  onJumpToPage: (page: number, quote?: string) => void;
}

export const ChatTab: React.FC<ChatTabProps> = ({ document, onJumpToPage }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const queryPresets = [
    "What are the total financial figures, taxes, and amounts due?",
    "List all binding obligations and liabilities.",
    "Identify any termination or penalty clauses.",
    "List all named parties and counterparties.",
  ];

  useEffect(() => {
    if (document) {
      setMessages([
        {
          id: "sys-init",
          role: "assistant",
          content: `Document indexed: ${document.filename} (${document.total_pages} pages, ${document.total_words} words). Enter a query or select a preset below to verify facts.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } else {
      setMessages([]);
    }
  }, [document?.doc_id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || !document || isLoading) return;

    setError(null);
    const userMsg: ChatMessage = {
      id: `query-${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== "sys-init")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await chatWithDocument(document.doc_id, textToSend, history);

      const assistantMsg: ChatMessage = {
        id: `res-${Date.now()}`,
        role: "assistant",
        content: res.answer,
        citations: res.citations,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setError(err.message || "Query failed. Check your API configuration.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderContentWithCitations = (content: string) => {
    const parts = content.split(/(\[Page\s*\d+\])/g);
    return parts.map((part, idx) => {
      const match = part.match(/\[Page\s*(\d+)\]/);
      if (match) {
        const pageNum = parseInt(match[1], 10);
        return (
          <button
            key={idx}
            onClick={() => onJumpToPage(pageNum)}
            className="inline-flex items-center gap-1 mx-1 px-1.5 py-0.2 rounded text-[11px] font-mono bg-zinc-800 border border-zinc-700 text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer"
            title={`View Page ${pageNum}`}
          >
            <Bookmark className="w-2.5 h-2.5 text-zinc-400" />
            p.{pageNum}
          </button>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  if (!document) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-zinc-950 text-zinc-600">
        <FileSearch className="w-8 h-8 text-zinc-700 mb-2 stroke-[1.25]" />
        <p className="text-xs font-mono uppercase text-zinc-500">Query Engine Inactive</p>
        <p className="text-xs text-zinc-600 mt-1">Select a document to begin cross-referencing facts.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-zinc-950 overflow-hidden">
      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans">
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 mb-1">
              <span className="font-semibold text-zinc-400 uppercase">
                {msg.role === "user" ? "> QUERY" : "FINDING"}
              </span>
              <span>{msg.timestamp}</span>
            </div>

            <div
              className={`p-3.5 rounded text-xs leading-relaxed border ${
                msg.role === "user"
                  ? "bg-zinc-900 border-zinc-800 text-zinc-200 font-mono"
                  : "bg-zinc-950 border-zinc-800/80 text-zinc-300"
              }`}
            >
              <div className="whitespace-pre-wrap">
                {msg.role === "assistant"
                  ? renderContentWithCitations(msg.content)
                  : msg.content}
              </div>

              {/* Citations Footer */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-zinc-800/80">
                  <div className="text-[10px] font-mono uppercase text-zinc-500 mb-1.5 flex items-center gap-1">
                    <Bookmark className="w-3 h-3 text-zinc-400" /> Verified Page Citations
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.citations.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => onJumpToPage(c.page_number, c.quote)}
                        className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
                      >
                        <span className="font-semibold text-zinc-200">Page {c.page_number}</span>
                        {c.quote && (
                          <span className="truncate max-w-[140px] text-zinc-500">
                            &quot;{c.quote}&quot;
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="p-3 rounded bg-zinc-900/60 border border-zinc-800 flex items-center gap-2 text-xs text-zinc-400 font-mono">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
            <span>Cross-referencing document text and compiling citations...</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded bg-red-950/20 border border-red-900/40 text-red-400 text-xs font-mono">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Query Presets */}
      {messages.length <= 1 && (
        <div className="px-3 py-2 border-t border-zinc-800 bg-zinc-900/40 shrink-0">
          <div className="text-[10px] font-mono uppercase text-zinc-500 mb-1.5">
            Quick Queries
          </div>
          <div className="flex flex-wrap gap-1.5">
            {queryPresets.map((preset, i) => (
              <button
                key={i}
                onClick={() => handleSend(preset)}
                className="text-[11px] text-zinc-400 bg-zinc-900 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800 rounded px-2.5 py-1 text-left transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Console */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-900/60 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search or ask document questions..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-600 rounded px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 outline-none transition-colors disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-3 py-2 bg-zinc-100 hover:bg-white disabled:opacity-30 disabled:hover:bg-zinc-100 text-zinc-950 rounded text-xs font-medium transition-colors flex items-center gap-1.5"
            title="Execute Query"
          >
            <span>Query</span>
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
