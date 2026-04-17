"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Brain, Info, Sparkles, BookOpen } from "lucide-react";

export interface AIAnswer {
  verdict: "safe" | "warning" | "info";
  title: string;
  answer: string;
  items?: string[];
}

export interface Answer {
  text: string;
  source: { title: string; section: string; sectionSlug: string; moduleSlug: string };
  confidence: string;
}

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  description: string;
  sectionTitle: string;
  sectionSlug: string;
  moduleSlug: string;
  tags: string[];
}

export interface Definition {
  key: string;
  label: string;
  short_description: string;
  full_description: string;
  safe_for_celiac: boolean | null;
  icon: string | null;
}

export function AIAnswerCard({ aiAnswer, onItemClick }: { aiAnswer: AIAnswer; onItemClick: (q: string) => void }) {
  const verdictColors = aiAnswer.verdict === "safe"
    ? "bg-green-50 border-green-200"
    : aiAnswer.verdict === "warning"
    ? "bg-red-50 border-red-200"
    : "bg-orange-50 border-orange-200";
  const verdictText = aiAnswer.verdict === "safe" ? "text-green-700" : aiAnswer.verdict === "warning" ? "text-red-700" : "text-orange-700";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-6 py-3 bg-purple-50 border-b border-purple-100">
        <Brain className="w-4 h-4 text-purple-600" />
        <span className="text-xs font-semibold text-purple-700 uppercase tracking-widest">AI Assist</span>
      </div>
      <div className={`px-6 py-3 flex items-start gap-2 border-b ${verdictColors}`}>
        {aiAnswer.verdict === "safe" ? <CheckCircle2 className="w-4 h-4 text-ditch-green shrink-0 mt-0.5" /> : aiAnswer.verdict === "warning" ? <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" /> : <Info className="w-4 h-4 text-ditch-orange shrink-0 mt-0.5" />}
        <span className={`text-sm font-semibold ${verdictText}`}>{aiAnswer.title}</span>
      </div>
      <div className="p-6 space-y-4">
        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{aiAnswer.answer}</p>
        {aiAnswer.items && aiAnswer.items.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
            {aiAnswer.items.map((item) => (
              <button key={item} onClick={() => onItemClick(item)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full text-xs font-medium transition-colors">{item}</button>
            ))}
          </div>
        )}
        <p className="text-[10px] text-gray-500 pt-2 border-t border-gray-100">AI-generated · Always confirm allergen info with the kitchen.</p>
      </div>
    </div>
  );
}

export function ModuleAnswerCard({ answer }: { answer: Answer }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-ditch-orange/10 rounded-lg shrink-0">
          <Sparkles className="w-5 h-5 text-ditch-orange" />
        </div>
        <div>
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{answer.text}</p>
          <p className="text-xs text-gray-400 mt-3">Source: {answer.source.section} → {answer.source.title}</p>
        </div>
      </div>
    </div>
  );
}

export function ModuleResultsList({ results }: { results: SearchResult[] }) {
  return (
    <div className="space-y-2">
      {results.map((result) => (
        <Link key={`${result.type}-${result.id}`} href={`/training/${result.sectionSlug}/${result.moduleSlug}`} className="block p-4 bg-white border border-gray-200 rounded-xl hover:border-ditch-orange transition-colors shadow-sm">
          <h3 className="font-medium text-gray-900 text-sm">{result.title}</h3>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{result.description}</p>
          <p className="text-xs text-ditch-orange mt-1">{result.sectionTitle}</p>
        </Link>
      ))}
    </div>
  );
}

export function AllergenKeyCard({
  definitions,
  expandedDef,
  onToggle,
}: {
  definitions: Definition[];
  expandedDef: string | null;
  onToggle: (key: string) => void;
}) {
  if (definitions.length === 0) return null;
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-5 py-3 border-b border-gray-200 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-ditch-orange" />
        <span className="text-xs font-semibold text-gray-700 uppercase tracking-widest">Allergen Key</span>
      </div>
      <div className="divide-y divide-gray-100">
        {definitions.map((d) => {
          const isExpanded = expandedDef === d.key;
          return (
            <button key={d.key} onClick={() => onToggle(d.key)} className="w-full px-5 py-2.5 flex items-start gap-3 text-left hover:bg-gray-50">
              {d.icon && <span className="text-lg leading-none mt-0.5">{d.icon}</span>}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900 text-sm">{d.label}</span>
                  {d.safe_for_celiac === true && (<span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-semibold uppercase">Celiac-Safe</span>)}
                  {d.safe_for_celiac === false && (<span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-semibold uppercase">NOT Celiac-Safe</span>)}
                </div>
                <p className="text-xs text-gray-600 mt-0.5">{d.short_description}</p>
                {isExpanded && (<p className="text-xs text-gray-700 mt-2 leading-relaxed whitespace-pre-line">{d.full_description}</p>)}
              </div>
            </button>
          );
        })}
      </div>
      <p className="px-5 py-2 text-[10px] text-gray-400 border-t border-gray-100">Tap any term for the full explanation.</p>
    </div>
  );
}
