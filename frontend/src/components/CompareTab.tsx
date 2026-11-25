"use client";

import React, { useState } from "react";
import { DocumentDetail, CompareResult } from "@/types";
import { compareDocuments } from "@/lib/api";
import {
  GitCompare,
  Plus,
  Minus,
  AlertCircle,
  Shield,
  Loader2,
  ArrowRight,
  Play,
} from "lucide-react";

interface CompareTabProps {
  currentDocument: DocumentDetail | null;
  allDocuments: DocumentDetail[];
}

export const CompareTab: React.FC<CompareTabProps> = ({
  currentDocument,
  allDocuments,
}) => {
  const [targetDocId, setTargetDocId] = useState<string>("");
  const [result, setResult] = useState<CompareResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const otherDocs = allDocuments.filter((d) => d.doc_id !== currentDocument?.doc_id);

  const handleCompare = async () => {
    if (!currentDocument || !targetDocId || isLoading) return;
    setError(null);
    setIsLoading(true);

    try {
      const res = await compareDocuments(currentDocument.doc_id, targetDocId);
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Document comparison failed.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentDocument) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-zinc-950 text-zinc-600">
        <GitCompare className="w-8 h-8 text-zinc-700 mb-2 stroke-[1.25]" />
        <p className="text-xs font-mono uppercase text-zinc-500">Diff Engine Inactive</p>
        <p className="text-xs text-zinc-600 mt-1">Select a base document to compare revision differences.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-zinc-950 overflow-hidden">
      {/* Top Controls */}
      <div className="p-3 border-b border-zinc-800 bg-zinc-900/60 space-y-2.5 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase text-zinc-400">Target File:</span>
            <select
              value={targetDocId}
              onChange={(e) => setTargetDocId(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded px-2.5 py-1.5 focus:border-zinc-600 outline-none max-w-[220px]"
            >
              <option value="">-- Select Target --</option>
              {otherDocs.map((doc) => (
                <option key={doc.doc_id} value={doc.doc_id}>
                  {doc.filename}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleCompare}
            disabled={!targetDocId || isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded text-xs font-medium disabled:opacity-40 transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Computing Diff...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Compare Revisions</span>
              </>
            )}
          </button>
        </div>

        <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-2">
          <span className="text-zinc-300 truncate">{currentDocument.filename}</span>
          <ArrowRight className="w-3 h-3 text-zinc-500 shrink-0" />
          <span className="text-zinc-400 truncate">
            {otherDocs.find((d) => d.doc_id === targetDocId)?.filename || "Select target file"}
          </span>
        </div>
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="p-3 rounded bg-red-950/20 border border-red-900/40 text-red-400 text-xs font-mono">
            {error}
          </div>
        )}

        {result ? (
          <div className="space-y-4">
            {/* Match Metric */}
            <div className="p-3 rounded bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-500">
                  Semantic Alignment
                </span>
                <div className="text-zinc-100 font-mono font-medium text-xs mt-0.5">
                  {result.semantic_similarity}
                </div>
              </div>
              <GitCompare className="w-4 h-4 text-zinc-400" />
            </div>

            {/* Added Clauses */}
            {result.added_clauses.length > 0 && (
              <div className="p-3.5 rounded bg-zinc-950 border border-emerald-950 space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Plus className="w-3 h-3" /> Added Provisions (Target)
                </div>
                <ul className="space-y-1.5">
                  {result.added_clauses.map((clause, i) => (
                    <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                      <span className="font-mono text-emerald-500 text-xs">+</span>
                      <span>{clause}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Removed Clauses */}
            {result.removed_clauses.length > 0 && (
              <div className="p-3.5 rounded bg-zinc-950 border border-rose-950 space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <Minus className="w-3 h-3" /> Removed Provisions (Base)
                </div>
                <ul className="space-y-1.5">
                  {result.removed_clauses.map((clause, i) => (
                    <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                      <span className="font-mono text-rose-500 text-xs">-</span>
                      <span>{clause}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Modified Clauses */}
            {result.modified_clauses && result.modified_clauses.length > 0 && (
              <div className="p-3.5 rounded bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3 h-3" /> Modified Terms & Alterations
                </div>
                <div className="space-y-2">
                  {result.modified_clauses.map((mod, i) => (
                    <div key={i} className="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-xs">
                      {Object.entries(mod).map(([k, v]) => (
                        <div key={k} className="text-zinc-300">
                          <span className="font-mono font-medium text-zinc-400">{k}:</span> {v}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Impact */}
            <div className="p-3.5 rounded bg-zinc-900/60 border border-zinc-800 space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-zinc-400" /> Commercial & Legal Impact
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {result.risk_evaluation}
              </p>
            </div>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center text-zinc-600 border border-dashed border-zinc-800 rounded p-6">
            <GitCompare className="w-8 h-8 text-zinc-700 mb-2 stroke-[1.25]" />
            <p className="text-xs font-mono uppercase text-zinc-500">No Diff Computed</p>
            <p className="text-xs text-zinc-600 mt-1 max-w-xs">
              Select another document revision above to compute an itemized semantic diff.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
