"use client";

import React, { useState, useEffect } from "react";
import { DocumentDetail } from "@/types";
import {
  FileText,
  Sliders,
  Upload,
  ChevronDown,
  Check,
  FolderOpen,
  Settings,
  ExternalLink,
  HardDrive,
} from "lucide-react";

interface NavbarProps {
  documents: DocumentDetail[];
  activeDoc: DocumentDetail | null;
  onSelectDoc: (doc: DocumentDetail) => void;
  onOpenUpload: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  documents,
  activeDoc,
  onSelectDoc,
  onOpenUpload,
}) => {
  const [apiKey, setApiKey] = useState<string>("");
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [isDocDropdownOpen, setIsDocDropdownOpen] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem("documind_api_key") || "";
    setApiKey(key);
    setHasKey(Boolean(key));
  }, []);

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem("documind_api_key", apiKey.trim());
      setHasKey(true);
    } else {
      localStorage.removeItem("documind_api_key");
      setHasKey(false);
    }
    setIsKeyModalOpen(false);
  };

  return (
    <>
      <header className="h-14 border-b border-zinc-800 bg-zinc-950 px-4 flex items-center justify-between sticky top-0 z-40 select-none">
        {/* Left: Brand & Breadcrumb */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono font-bold text-xs text-zinc-100">
              DM
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-sm tracking-tight text-zinc-100">
                DocuMind
              </span>
              <span className="text-[11px] font-mono text-zinc-500 uppercase">
                Workstation v1.0
              </span>
            </div>
          </div>

          <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

          {/* Document Selector / Breadcrumb */}
          <div className="relative">
            <button
              onClick={() => setIsDocDropdownOpen(!isDocDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-900 text-xs text-zinc-200 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="truncate max-w-[200px] md:max-w-[280px] font-medium">
                {activeDoc ? activeDoc.filename : "Select Document..."}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0 ml-1" />
            </button>

            {isDocDropdownOpen && (
              <div
                className="absolute left-0 mt-1.5 w-80 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-1.5 z-50 animate-in fade-in duration-100"
                onMouseLeave={() => setIsDocDropdownOpen(false)}
              >
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
                  Indexed Files ({documents.length})
                </div>
                <div className="max-h-64 overflow-y-auto space-y-0.5">
                  {documents.map((doc) => {
                    const isSelected = activeDoc?.doc_id === doc.doc_id;
                    return (
                      <button
                        key={doc.doc_id}
                        onClick={() => {
                          onSelectDoc(doc);
                          setIsDocDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? "bg-zinc-800 text-zinc-100 font-medium"
                            : "text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-200"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="truncate">{doc.filename}</span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 shrink-0 ml-2">
                          {doc.total_pages} {doc.total_pages === 1 ? "pg" : "pgs"}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="border-t border-zinc-800 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setIsDocDropdownOpen(false);
                      onOpenUpload();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload File
                  </button>
                </div>
              </div>
            )}
          </div>

          {activeDoc && (
            <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-zinc-500">
              <span>•</span>
              <span>{activeDoc.total_pages} Pages</span>
              <span>•</span>
              <span>{(activeDoc.file_size / 1024).toFixed(1)} KB</span>
              <span>•</span>
              <span className="text-zinc-400">{activeDoc.total_words} Words</span>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </button>

          <button
            onClick={() => setIsKeyModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-zinc-200 text-xs transition-colors"
            title="System Configuration"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Settings</span>
            {hasKey && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            )}
          </button>
        </div>
      </header>

      {/* Settings Modal */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 w-full max-w-md shadow-2xl relative">
            <div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm mb-1">
              <Settings className="w-4 h-4 text-zinc-400" /> API & Model Configuration
            </div>
            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              Configure Google Gemini credentials for document processing. You can also define
              <code className="mx-1 px-1 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[11px]">GEMINI_API_KEY</code>
              in <code className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[11px]">backend/.env</code>.
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded px-3 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                  Default Engine
                </label>
                <div className="px-3 py-2 rounded bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-400">
                  gemini-3.8-flash (Multimodal 1M Context)
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 underline underline-offset-2"
              >
                Google AI Studio <ExternalLink className="w-3 h-3" />
              </a>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsKeyModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveKey}
                  className="px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium rounded transition-colors"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
