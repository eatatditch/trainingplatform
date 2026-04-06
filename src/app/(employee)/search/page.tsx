"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Search, BookOpen, FileText, ClipboardCheck, Loader2, MessageSquare, ArrowRight, Sparkles } from "lucide-react";

interface SearchResult {
  id: string;
  type: "module" | "section" | "quiz";
  title: string;
  description: string;
  sectionTitle: string;
  sectionSlug: string;
  moduleSlug: string;
  tags: string[];
}

interface Answer {
  text: string;
  source: {
    title: string;
    section: string;
    sectionSlug: string;
    moduleSlug: string;
  };
  confidence: "high" | "medium" | "low";
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setAnswer(null);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search/answer?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setAnswer(data.answer);
        setResults(data.results || []);
      }
    } catch {
      // handle silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 400);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Search & Knowledge Center</h1>
        <p className="text-gray-500 mt-1">Ask anything about Ditch operations, recipes, or procedures</p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Try "what goes in a Hang 10 Marg?" or "is the poke bowl gluten free?"...'
          className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-ditch-orange focus:ring-0 focus:outline-none text-base"
          autoFocus
        />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
        )}
      </div>

      {/* Quick Questions */}
      {!searched && (
        <div>
          <p className="text-sm font-medium text-gray-500 mb-3">Common questions:</p>
          <div className="flex flex-wrap gap-2">
            {[
              "What's in the Hang 10 Marg?",
              "How do I make a Smoke on the Bay?",
              "Is the poke bowl gluten free?",
              "What's in an Espresso Martini?",
              "Mocktail recipes",
              "How do I close the bar?",
              "Margarita mix recipe",
              "What's on the Big Al Burger?",
              "Allergy protocol",
              "What are the core values?",
              "Server checkout procedure",
              "Temperature danger zone",
            ].map((q) => (
              <button
                key={q}
                onClick={() => setQuery(q)}
                className="px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-ditch-orange/10 hover:text-ditch-orange transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Direct Answer */}
      {searched && !loading && answer && (
        <Card className="border-l-4 border-l-ditch-orange bg-ditch-orange/5">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-ditch-orange/10 rounded-lg shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5 text-ditch-orange" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ditch-orange mb-2">Answer from Ditch Training</p>
              <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">{answer.text}</p>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-ditch-orange/20">
                <FileText className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">Source: {answer.source.section} → {answer.source.title}</span>
                <Link
                  href={`/training/${answer.source.sectionSlug}/${answer.source.moduleSlug}`}
                  className="text-xs text-ditch-orange hover:underline ml-auto flex items-center gap-1"
                >
                  View full module <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Results */}
      {searched && !loading && (
        <div>
          <p className="text-sm text-gray-500 mb-3">
            {results.length} result{results.length !== 1 ? "s" : ""} found
          </p>
          {results.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No Results Found"
              description="Try different keywords or check the spelling. You can also browse the Training Library directly."
              action={
                <Link href="/training" className="text-ditch-orange hover:underline text-sm">
                  Browse Training Library
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {results.map((result) => (
                <Link
                  key={`${result.type}-${result.id}`}
                  href={
                    result.type === "section"
                      ? `/training/${result.sectionSlug}`
                      : result.type === "quiz"
                      ? `/quizzes/${result.id}`
                      : `/training/${result.sectionSlug}/${result.moduleSlug}`
                  }
                >
                  <Card hover className="flex items-start gap-4">
                    <div className="p-2 bg-gray-50 rounded-lg shrink-0">
                      <BookOpen className="w-5 h-5 text-ditch-orange" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{result.title}</h3>
                        <Badge>{result.type}</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{result.description}</p>
                      {result.sectionTitle && (
                        <p className="text-xs text-ditch-orange mt-1">{result.sectionTitle}</p>
                      )}
                      {result.tags && result.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {result.tags.slice(0, 4).map((tag) => (
                            <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
