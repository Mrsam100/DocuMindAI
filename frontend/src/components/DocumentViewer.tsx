"use client";

import React, { useState, useRef } from "react";
import { DocumentDetail } from "@/types";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  FileText,
  RotateCw,
} from "lucide-react";

interface DocumentViewerProps {
  document: DocumentDetail | null;
  activePage: number;
  onPageChange: (page: number) => void;
  highlightText?: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  activePage,
  onPageChange,
  highlightText,
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [viewMode, setViewMode] = useState<"canvas" | "native">("canvas");
  const [showThumbnails, setShowThumbnails] = useState<boolean>(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  const totalPages = document?.total_pages || 1;

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.min(Math.max(50, prev + delta), 200));
  };

  const handlePrevPage = () => {
    if (activePage > 1) onPageChange(activePage - 1);
  };

  const handleNextPage = () => {
    if (activePage < totalPages) onPageChange(activePage + 1);
  };

  if (!document) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-zinc-950 text-zinc-600">
        <FileText className="w-8 h-8 stroke-[1.25] mb-2 text-zinc-700" />
        <p className="text-xs font-mono uppercase text-zinc-500">No Document Selected</p>
        <p className="text-xs text-zinc-600 mt-1">Select a document from the header or upload a file.</p>
      </div>
    );
  }

  const pageImageUrl = `${API_BASE}/documents/${document.doc_id}/pages/${activePage}/image`;
  const pdfUrl = `${API_BASE}/documents/${document.doc_id}/pdf`;

  return (
    <div className="h-full flex flex-col bg-zinc-950 overflow-hidden relative">
      {/* Top Document Toolbar */}
      <div className="h-10 border-b border-zinc-800 bg-zinc-900/80 px-3 flex items-center justify-between shrink-0 select-none">
        {/* Left: Rail toggle & Page Pagination */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowThumbnails(!showThumbnails)}
            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title={showThumbnails ? "Hide Thumbnails" : "Show Thumbnails"}
          >
            {showThumbnails ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeft className="w-4 h-4" />
            )}
          </button>

          <div className="h-3 w-px bg-zinc-800" />

          <div className="flex items-center gap-1 text-xs text-zinc-300">
            <button
              onClick={handlePrevPage}
              disabled={activePage <= 1}
              className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-300">
              {activePage} / {totalPages}
            </span>

            <button
              onClick={handleNextPage}
              disabled={activePage >= totalPages}
              className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center: View mode */}
        <div className="flex items-center bg-zinc-950 p-0.5 rounded border border-zinc-800 text-[11px] font-medium">
          <button
            onClick={() => setViewMode("canvas")}
            className={`px-2 py-0.5 rounded transition-colors ${
              viewMode === "canvas"
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Canvas
          </button>
          <button
            onClick={() => setViewMode("native")}
            className={`px-2 py-0.5 rounded transition-colors ${
              viewMode === "native"
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Native PDF
          </button>
        </div>

        {/* Right: Zoom controls */}
        <div className="flex items-center gap-1">
          {viewMode === "canvas" && (
            <>
              <button
                onClick={() => handleZoom(-10)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono text-zinc-400 w-9 text-center">
                {zoom}%
              </span>
              <button
                onClick={() => handleZoom(10)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom(100)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors text-[11px] font-mono px-1.5"
                title="Reset Zoom (100%)"
              >
                100%
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Thumbnails Sidebar */}
        {showThumbnails && (
          <aside className="w-24 md:w-28 bg-zinc-950 border-r border-zinc-800 p-2 overflow-y-auto space-y-2 shrink-0 select-none">
            {document.pages.map((p) => {
              const isActive = p.page_number === activePage;
              return (
                <div
                  key={p.page_number}
                  onClick={() => onPageChange(p.page_number)}
                  className={`cursor-pointer rounded p-1 transition-all ${
                    isActive
                      ? "bg-zinc-800 ring-1 ring-zinc-500"
                      : "hover:bg-zinc-900 border border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <div className="relative rounded bg-zinc-900 border border-zinc-800 overflow-hidden aspect-[1/1.414]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${API_BASE}/documents/${document.doc_id}/pages/${p.page_number}/image`}
                      alt={`Page ${p.page_number}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-zinc-950/90 py-0.5 text-[9px] font-mono text-zinc-400 text-center">
                      Pg {p.page_number}
                    </div>
                  </div>
                </div>
              );
            })}
          </aside>
        )}

        {/* Viewport Canvas */}
        <div
          ref={scrollContainerRef}
          className="flex-1 bg-zinc-900/40 overflow-auto p-4 flex items-start justify-center relative"
        >
          {viewMode === "native" ? (
            <iframe
              src={`${pdfUrl}#page=${activePage}`}
              className="w-full h-full rounded border border-zinc-800 bg-white"
              title="Native Document PDF"
            />
          ) : (
            <div
              className="relative shadow-lg transition-all duration-100 origin-top bg-white rounded border border-zinc-700/60"
              style={{
                width: `${zoom}%`,
                maxWidth: "1000px",
                minWidth: "320px",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pageImageUrl}
                alt={`Page ${activePage}`}
                className="w-full h-auto block select-none pointer-events-none"
              />

              {highlightText && (
                <div className="absolute top-3 right-3 bg-zinc-900 border border-zinc-700 text-zinc-200 text-[11px] font-mono px-2 py-1 rounded shadow">
                  Focus: Page {activePage}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
