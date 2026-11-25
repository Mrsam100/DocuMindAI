"use client";

import React, { useState, useEffect } from "react";
import { DocumentDetail } from "@/types";
import { listDocuments } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { DocumentViewer } from "@/components/DocumentViewer";
import { ChatTab } from "@/components/ChatTab";
import { ExtractionTab } from "@/components/ExtractionTab";
import { SummaryTab } from "@/components/SummaryTab";
import { CompareTab } from "@/components/CompareTab";
import { UploadModal } from "@/components/UploadModal";
import {
  FileSearch,
  Table,
  FileCheck,
  GitCompare,
} from "lucide-react";

export default function Home() {
  const [documents, setDocuments] = useState<DocumentDetail[]>([]);
  const [activeDoc, setActiveDoc] = useState<DocumentDetail | null>(null);
  const [activePage, setActivePage] = useState<number>(1);
  const [highlightText, setHighlightText] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<"chat" | "extract" | "summary" | "compare">("chat");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);

  const fetchDocs = async () => {
    try {
      setIsLoadingDocs(true);
      const docs = await listDocuments();
      setDocuments(docs);
      if (docs.length > 0 && !activeDoc) {
        setActiveDoc(docs[0]);
        setActivePage(1);
      }
    } catch (e) {
      console.error("Failed to load documents", e);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleSelectDoc = (doc: DocumentDetail) => {
    setActiveDoc(doc);
    setActivePage(1);
    setHighlightText(undefined);
  };

  const handleJumpToPage = (pageNum: number, quote?: string) => {
    setActivePage(pageNum);
    if (quote) {
      setHighlightText(quote);
      setTimeout(() => setHighlightText(undefined), 3000);
    }
  };

  const handleUploadSuccess = (newDoc: DocumentDetail) => {
    setDocuments((prev) => [newDoc, ...prev]);
    setActiveDoc(newDoc);
    setActivePage(1);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden font-sans antialiased">
      {/* Top Workstation Header */}
      <Navbar
        documents={documents}
        activeDoc={activeDoc}
        onSelectDoc={handleSelectDoc}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* Main Split-Screen Workspace */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Pane: Document Canvas */}
        <section className="h-1/2 md:h-full md:w-1/2 flex flex-col border-b md:border-b-0 md:border-r border-zinc-800">
          <DocumentViewer
            document={activeDoc}
            activePage={activePage}
            onPageChange={(p) => setActivePage(p)}
            highlightText={highlightText}
          />
        </section>

        {/* Right Pane: Analysis & Inspector Studio */}
        <section className="h-1/2 md:h-full md:w-1/2 flex flex-col bg-zinc-950">
          {/* Studio Tab Strip */}
          <div className="h-10 border-b border-zinc-800 bg-zinc-900/60 px-2 flex items-center justify-between shrink-0 select-none">
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  activeTab === "chat"
                    ? "bg-zinc-800 text-zinc-100 border border-zinc-700/80"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                }`}
              >
                <FileSearch className="w-3.5 h-3.5" />
                <span>Query & Citations</span>
              </button>

              <button
                onClick={() => setActiveTab("extract")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  activeTab === "extract"
                    ? "bg-zinc-800 text-zinc-100 border border-zinc-700/80"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Field Extraction</span>
              </button>

              <button
                onClick={() => setActiveTab("summary")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  activeTab === "summary"
                    ? "bg-zinc-800 text-zinc-100 border border-zinc-700/80"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Document Audit</span>
              </button>

              <button
                onClick={() => setActiveTab("compare")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  activeTab === "compare"
                    ? "bg-zinc-800 text-zinc-100 border border-zinc-700/80"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                }`}
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>Revision Diff</span>
              </button>
            </div>
          </div>

          {/* Active Tab Panel */}
          <div className="flex-1 overflow-hidden relative">
            {activeTab === "chat" && (
              <ChatTab document={activeDoc} onJumpToPage={handleJumpToPage} />
            )}
            {activeTab === "extract" && (
              <ExtractionTab document={activeDoc} />
            )}
            {activeTab === "summary" && (
              <SummaryTab document={activeDoc} />
            )}
            {activeTab === "compare" && (
              <CompareTab currentDocument={activeDoc} allDocuments={documents} />
            )}
          </div>
        </section>
      </main>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        sampleDocuments={documents}
        onSelectSample={handleSelectDoc}
      />
    </div>
  );
}
