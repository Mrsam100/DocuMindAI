"use client";

import React, { useState, useRef } from "react";
import { DocumentDetail } from "@/types";
import { uploadDocument } from "@/lib/api";
import {
  Upload,
  FileText,
  X,
  Loader2,
  AlertCircle,
  FileCode,
} from "lucide-react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (doc: DocumentDetail) => void;
  sampleDocuments: DocumentDetail[];
  onSelectSample: (doc: DocumentDetail) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  sampleDocuments,
  onSelectSample,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are supported.");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const doc = await uploadDocument(file);
      onUploadSuccess(doc);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to process PDF.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-lg shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">Import Document</h3>
            <p className="text-[11px] font-mono text-zinc-500">PDF documents, reports, invoices, and legal contracts</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dropzone */}
        <div className="p-5">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border border-dashed rounded p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
              isDragging
                ? "border-zinc-400 bg-zinc-800/40"
                : "border-zinc-700 hover:border-zinc-500 bg-zinc-950/60 hover:bg-zinc-950"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileProcess(e.target.files[0]);
                }
              }}
            />

            {isUploading ? (
              <div className="space-y-2 flex flex-col items-center">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                <div className="text-xs text-zinc-300 font-mono">
                  Rendering 150 DPI page layers and parsing text...
                </div>
              </div>
            ) : (
              <>
                <FileText className="w-8 h-8 text-zinc-600 mb-2 stroke-[1.25]" />
                <div className="text-xs font-medium text-zinc-200">
                  Click to select or drag and drop PDF file
                </div>
                <div className="text-[11px] text-zinc-500 font-mono mt-1">
                  Indexed for exact page citations and schema extraction
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="mt-3 p-2.5 rounded bg-red-950/20 border border-red-900/40 text-red-400 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Sample Documents */}
          {sampleDocuments.length > 0 && (
            <div className="mt-5 pt-3 border-t border-zinc-800">
              <div className="text-[10px] font-mono uppercase text-zinc-500 mb-2">
                Sample Documents
              </div>
              <div className="space-y-1.5">
                {sampleDocuments.map((doc) => (
                  <button
                    key={doc.doc_id}
                    onClick={() => {
                      onSelectSample(doc);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="text-xs font-mono text-zinc-300 truncate">{doc.filename}</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 shrink-0 ml-2">
                      {doc.total_pages} {doc.total_pages === 1 ? "page" : "pages"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
