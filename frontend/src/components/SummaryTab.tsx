"use client";

import React, { useState } from "react";
import { DocumentDetail, SummaryData } from "@/types";
import { summarizeDocument } from "@/lib/api";
import {
  FileText,
  Loader2,
  Copy,
  Check,
  ShieldAlert,
  ListOrdered,
  Users,
  Play,
  FileCheck,
} from "lucide-react";

interface SummaryTabProps {
  document: DocumentDetail | null;
}

export const SummaryTab: React.FC<SummaryTabProps> = ({ document }) => {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSummarize = async () => {
    if (!document || isLoading) return;
    setError(null);
    setIsLoading(true);

    try {
      const res = await summarizeDocument(document.doc_id);
      setSummary(res);
    } catch (err: any) {
      setError(err.message || "Audit synthesis failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summary) return;
    const text = `DOCUMENT AUDIT REPORT: ${document?.filename}\n\nSUMMARY:\n${summary.executive_summary}\n\nKEY PROVISIONS:\n${summary.key_points.map((p) => `- ${p}`).join("\n")}\n\nOBLIGATIONS & DEADLINES:\n${summary.action_items.map((a) => `- ${a}`).join("\n")}\n\nRISKS & LIABILITIES:\n${summary.risks_and_obligations.map((r) => `- ${r}`).join("\n")}\n\nPARTIES & ENTITIES:\n${summary.stakeholders_entities.map((s) => `- ${s}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!document) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-zinc-950 text-zinc-600">
        <FileText className="w-8 h-8 text-zinc-700 mb-2 stroke-[1.25]" />
        <p className="text-xs font-mono uppercase text-zinc-500">Audit Engine Inactive</p>
        <p className="text-xs text-zinc-600 mt-1">Select a document to generate a structured audit digest.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-zinc-950 overflow-hidden">
      {/* Top Action Bar */}
      <div className="p-3 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between shrink-0">
        <div>
          <div className="text-xs font-semibold text-zinc-200">Document Audit & Digest</div>
          <div className="text-[11px] font-mono text-zinc-500">Provisions, terms, liability exposure & entities</div>
        </div>

        <div className="flex items-center gap-2">
          {summary && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded text-xs text-zinc-300 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy Report"}</span>
            </button>
          )}

          <button
            onClick={handleSummarize}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded text-xs font-medium disabled:opacity-40 transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Auditing...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Audit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="p-3 rounded bg-red-950/20 border border-red-900/40 text-red-400 text-xs font-mono">
            {error}
          </div>
        )}

        {summary ? (
          <div className="space-y-4">
            {/* Executive Overview */}
            <div className="p-3.5 rounded bg-zinc-900/60 border border-zinc-800 space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5" /> Scope & Executive Overview
              </div>
              <p className="text-xs md:text-sm text-zinc-200 leading-relaxed">
                {summary.executive_summary}
              </p>
            </div>

            {/* Key Provisions */}
            {summary.key_points.length > 0 && (
              <div className="p-3.5 rounded bg-zinc-900/40 border border-zinc-800 space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <ListOrdered className="w-3.5 h-3.5" /> Key Provisions & Findings
                </div>
                <ul className="space-y-1.5">
                  {summary.key_points.map((point, i) => (
                    <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                      <span className="font-mono text-zinc-500 text-[10px] mt-0.5">{String(i + 1).padStart(2, "0")}.</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Items / Obligations */}
            {summary.action_items.length > 0 && (
              <div className="p-3.5 rounded bg-zinc-900/40 border border-zinc-800 space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Operational Obligations & Deadlines
                </div>
                <ul className="space-y-1.5">
                  {summary.action_items.map((item, i) => (
                    <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                      <span className="text-zinc-500 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risks & Liabilities */}
            {summary.risks_and_obligations.length > 0 && (
              <div className="p-3.5 rounded bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-zinc-400" /> Risk Flags & Liability Exposure
                </div>
                <ul className="space-y-1.5">
                  {summary.risks_and_obligations.map((risk, i) => (
                    <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                      <span className="font-mono text-zinc-500 text-[10px] mt-0.5">!</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Stakeholders & Entities */}
            {summary.stakeholders_entities.length > 0 && (
              <div className="p-3.5 rounded bg-zinc-900/40 border border-zinc-800 space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Identified Counterparties & Signatories
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {summary.stakeholders_entities.map((entity, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300"
                    >
                      {entity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center text-zinc-600 border border-dashed border-zinc-800 rounded p-6">
            <FileText className="w-8 h-8 text-zinc-700 mb-2 stroke-[1.25]" />
            <p className="text-xs font-mono uppercase text-zinc-500">Audit Not Yet Run</p>
            <p className="text-xs text-zinc-600 mt-1 max-w-xs">
              Click &quot;Run Audit&quot; above to parse provisions, terms, and liabilities.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
