"use client";

import React, { useState } from "react";
import { DocumentDetail, ExtractionResult } from "@/types";
import { extractStructuredData } from "@/lib/api";
import {
  FileSpreadsheet,
  Download,
  Loader2,
  Table as TableIcon,
  FileCode,
  Copy,
  Check,
  Play,
} from "lucide-react";

interface ExtractionTabProps {
  document: DocumentDetail | null;
}

export const ExtractionTab: React.FC<ExtractionTabProps> = ({ document }) => {
  const [schemaType, setSchemaType] = useState<string>("auto");
  const [customInstructions, setCustomInstructions] = useState<string>("");
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleExtract = async () => {
    if (!document || isLoading) return;
    setError(null);
    setIsLoading(true);

    try {
      const data = await extractStructuredData(
        document.doc_id,
        schemaType,
        customInstructions.trim() || undefined
      );
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Data extraction failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadJSON = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result.data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = `${document?.filename || "data"}_schema.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = () => {
    if (!result) return;
    const data = result.data;
    let csvContent = "data:text/csv;charset=utf-8,";

    if (Array.isArray(data.items) && data.items.length > 0) {
      const headers = Object.keys(data.items[0]);
      csvContent += headers.join(",") + "\r\n";
      data.items.forEach((item: any) => {
        const row = headers.map((h) => `"${item[h] ?? ""}"`);
        csvContent += row.join(",") + "\r\n";
      });
    } else {
      csvContent += "Field,Value\r\n";
      Object.entries(data).forEach(([key, val]) => {
        if (typeof val === "object") {
          csvContent += `"${key}","${JSON.stringify(val).replace(/"/g, '""')}"\r\n`;
        } else {
          csvContent += `"${key}","${val ?? ""}"\r\n`;
        }
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = window.document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${document?.filename || "data"}_export.csv`);
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const handleCopyJSON = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!document) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-zinc-950 text-zinc-600">
        <FileSpreadsheet className="w-8 h-8 text-zinc-700 mb-2 stroke-[1.25]" />
        <p className="text-xs font-mono uppercase text-zinc-500">Schema Inspector Inactive</p>
        <p className="text-xs text-zinc-600 mt-1">Select a document to extract structured entities and tables.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-zinc-950 overflow-hidden">
      {/* Control Strip */}
      <div className="p-3 border-b border-zinc-800 bg-zinc-900/60 space-y-2.5 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase text-zinc-400">Schema:</span>
            <select
              value={schemaType}
              onChange={(e) => setSchemaType(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded px-2.5 py-1.5 focus:border-zinc-600 outline-none"
            >
              <option value="auto">Auto-Detect Schema</option>
              <option value="invoice">Invoice / Accounts Payable</option>
              <option value="contract">Commercial Agreement / MSA</option>
              <option value="resume">Personnel / Resume</option>
              <option value="generic">Generic Key-Values</option>
            </select>
          </div>

          <button
            onClick={handleExtract}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded text-xs font-medium disabled:opacity-40 transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Extract Schema</span>
              </>
            )}
          </button>
        </div>

        <input
          type="text"
          placeholder="Optional: Extraction parameters (e.g. 'Extract currency, discounts, and payment terms')"
          value={customInstructions}
          onChange={(e) => setCustomInstructions(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-zinc-600 font-sans"
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="p-3 rounded bg-red-950/20 border border-red-900/40 text-red-400 text-xs font-mono">
            {error}
          </div>
        )}

        {result ? (
          <div className="space-y-4">
            {/* Action Bar */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono uppercase text-zinc-300">
                  Target: {result.schema_type}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopyJSON}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-[11px] font-mono transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
                <button
                  onClick={handleDownloadCSV}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-[11px] font-mono transition-colors"
                >
                  <Download className="w-3 h-3" /> CSV
                </button>
                <button
                  onClick={handleDownloadJSON}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-[11px] font-mono transition-colors"
                >
                  <FileCode className="w-3 h-3" /> JSON
                </button>
              </div>
            </div>

            {/* Structured Invoice Display */}
            {result.schema_type === "invoice" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800">
                    <div className="text-zinc-500 text-[10px] font-mono uppercase">Vendor</div>
                    <div className="text-zinc-200 font-medium mt-0.5">{result.data.vendor_name || "—"}</div>
                  </div>
                  <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800">
                    <div className="text-zinc-500 text-[10px] font-mono uppercase">Invoice Ref #</div>
                    <div className="text-zinc-200 font-mono mt-0.5">{result.data.invoice_number || "—"}</div>
                  </div>
                  <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800">
                    <div className="text-zinc-500 text-[10px] font-mono uppercase">Total Due</div>
                    <div className="text-zinc-100 font-mono font-semibold text-sm mt-0.5">
                      {result.data.currency || "$"} {result.data.total_amount?.toLocaleString() || "0"}
                    </div>
                  </div>
                  <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800">
                    <div className="text-zinc-500 text-[10px] font-mono uppercase">Issue Date</div>
                    <div className="text-zinc-300 font-mono mt-0.5">{result.data.invoice_date || "—"}</div>
                  </div>
                  <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800">
                    <div className="text-zinc-500 text-[10px] font-mono uppercase">Payment Terms</div>
                    <div className="text-zinc-300 font-mono mt-0.5">{result.data.payment_terms || result.data.due_date || "—"}</div>
                  </div>
                  <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800">
                    <div className="text-zinc-500 text-[10px] font-mono uppercase">Client / Counterparty</div>
                    <div className="text-zinc-300 mt-0.5 truncate">{result.data.client_name || "—"}</div>
                  </div>
                </div>

                {/* Line Items Grid */}
                {Array.isArray(result.data.items) && result.data.items.length > 0 && (
                  <div className="rounded border border-zinc-800 overflow-hidden bg-zinc-950">
                    <div className="px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[11px] font-mono uppercase text-zinc-400 flex items-center gap-1.5">
                      <TableIcon className="w-3.5 h-3.5" /> Itemized Line Entries ({result.data.items.length})
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-zinc-900/80 text-zinc-400 border-b border-zinc-800 font-mono text-[11px]">
                          <tr>
                            <th className="px-3 py-2">Description</th>
                            <th className="px-3 py-2 text-center">Qty</th>
                            <th className="px-3 py-2 text-right">Unit Rate</th>
                            <th className="px-3 py-2 text-right">Line Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/80">
                          {result.data.items.map((item: any, idx: number) => (
                            <tr key={idx} className="hover:bg-zinc-900/40">
                              <td className="px-3 py-2 text-zinc-200">{item.description}</td>
                              <td className="px-3 py-2 text-center text-zinc-400 font-mono">{item.quantity}</td>
                              <td className="px-3 py-2 text-right text-zinc-300 font-mono">${item.unit_price}</td>
                              <td className="px-3 py-2 text-right text-zinc-100 font-mono font-medium">${item.total_price}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Raw JSON Data Block */}
            <div className="rounded border border-zinc-800 bg-zinc-950 overflow-hidden">
              <div className="px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[10px] font-mono uppercase text-zinc-400">
                JSON Schema Payload
              </div>
              <pre className="p-3 text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-96">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center text-zinc-600 border border-dashed border-zinc-800 rounded p-6">
            <TableIcon className="w-8 h-8 text-zinc-700 mb-2 stroke-[1.25]" />
            <p className="text-xs font-mono uppercase text-zinc-500">No Data Extracted</p>
            <p className="text-xs text-zinc-600 mt-1 max-w-xs">
              Select a schema and click &quot;Extract Schema&quot; to parse records into data tables and JSON.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
