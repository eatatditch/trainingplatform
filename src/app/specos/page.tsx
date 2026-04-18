"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Loader2, X, Zap, LogOut, Mic, MicOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SurfingLoader } from "@/components/surfing-loader";
import { LoginScreen } from "./_login-screen";
import {
  RecipeCard,
  FoodItemCard,
  FoodListCard,
  type Recipe,
  type FoodItem,
  type FoodList,
} from "./_result-cards";
import {
  AIAnswerCard,
  ModuleAnswerCard,
  ModuleResultsList,
  AllergenKeyCard,
  type AIAnswer,
  type Answer,
  type SearchResult,
  type Definition,
} from "./_ai-extras";
import { useVoiceInput } from "./_use-voice";

export default function SpecOSPage() {
  const [user, setUser] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [query, setQuery] = useState("");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [foodItem, setFoodItem] = useState<FoodItem | null>(null);
  const [foodList, setFoodList] = useState<FoodList | null>(null);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [aiAnswer, setAiAnswer] = useState<AIAnswer | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [definitions, setDefinitions] = useState<Definition[]>([]);
  const [expandedDef, setExpandedDef] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setChecking(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch("/api/dietary-definitions")
      .then((r) => r.json())
      .then((data) => setDefinitions(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [user]);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setRecipe(null); setFoodItem(null); setFoodList(null);
      setAnswer(null); setAiAnswer(null); setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    const start = Date.now();
    try {
      const res = await fetch(`/api/search/answer?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setRecipe(data.recipe); setFoodItem(data.foodItem); setFoodList(data.foodList);
        setAnswer(data.answer); setAiAnswer(data.aiAnswer); setResults(data.results || []);
      }
    } catch { /* silent */ }
    finally {
      const elapsed = Date.now() - start;
      if (elapsed < 5000) await new Promise((r) => setTimeout(r, 5000 - elapsed));
      setLoading(false);
    }
  }, []);

  const runSearch = (q: string) => { setQuery(q); doSearch(q); };

  const voice = useVoiceInput(
    (final) => { setQuery(final); doSearch(final); },
    (display) => setQuery(display)
  );

  useEffect(() => {
    if (user) inputRef.current?.focus();
    if (user && "serviceWorker" in navigator) navigator.serviceWorker.register("/specos-sw.js").catch(() => {});
  }, [user]);

  const clearSearch = () => {
    setQuery(""); setRecipe(null); setFoodItem(null); setFoodList(null);
    setAnswer(null); setAiAnswer(null); setResults([]); setSearched(false);
    inputRef.current?.focus();
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  };

  if (checking) return <div className="min-h-screen bg-gray-50" />;
  if (!user) return <LoginScreen />;

  const chips = [
    { label: "Baja Fish Taco", icon: "🌮" }, { label: "Poké Bowl", icon: "🍣" },
    { label: "Lobster Roll", icon: "🦞" }, { label: "Big Al Burger", icon: "🍔" },
    { label: "Gluten-free items", icon: "🌾" }, { label: "Vegan options", icon: "🥬" },
    { label: "Chips + Guac", icon: "🥑" }, { label: "Korean Chicken Sammy", icon: "🍗" },
    { label: "Sirloin Steak", icon: "🥩" }, { label: "Churros", icon: "🍩" },
    { label: "Kids menu", icon: "🧒" },
  ];

  const showEmpty = searched && !loading && !recipe && !foodItem && !foodList && !aiAnswer && !answer && results.length === 0;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="border-b border-gray-200 bg-white/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={clearSearch} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-ditch-orange rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-gray-900 font-bold text-lg leading-none">SpecOS</h1>
              <p className="text-gray-500 text-[10px] uppercase tracking-widest">by Ditch</p>
            </div>
          </button>
          <button onClick={handleSignOut} className="text-xs text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1">
            <LogOut className="w-3 h-3" /> Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4">
        <div className={`transition-all duration-300 ${!searched ? "flex-1 flex flex-col justify-center -mt-16" : "pt-6"}`}>
          {!searched && (
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">What do you need?</h2>
              <p className="text-gray-500 text-sm">Cocktail specs, recipes, procedures — instant answers.</p>
            </div>
          )}
          <form onSubmit={(e) => { e.preventDefault(); doSearch(query); inputRef.current?.blur(); }} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="search"
              enterKeyHint="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={voice.listening ? "Listening... speak your question" : "Search or ask a question..."}
              className={`w-full pl-12 py-4 rounded-2xl bg-white border text-gray-900 placeholder-gray-400 focus:ring-0 focus:outline-none text-base transition-colors shadow-sm ${voice.listening ? "border-ditch-orange pr-24 placeholder-ditch-orange/80" : "border-gray-300 focus:border-ditch-orange pr-24"}`}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {voice.supported && (
                <button type="button" onClick={voice.toggle} aria-label={voice.listening ? "Stop listening" : "Ask by voice"} className={`p-2 rounded-full transition-colors ${voice.listening ? "bg-ditch-orange text-white animate-pulse" : "text-gray-400 hover:text-ditch-orange hover:bg-gray-100"}`}>
                  {voice.listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}
              {loading && <Loader2 className="w-5 h-5 text-ditch-orange animate-spin mr-2" />}
              {!loading && !voice.listening && query && (
                <button type="button" onClick={clearSearch} aria-label="Clear" className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X className="w-4 h-4" /></button>
              )}
            </div>
          </form>
          {voice.listening && (
            <p className="mt-2 text-center text-xs text-ditch-orange animate-pulse">
              Listening — pause for a moment when you're done and I'll search.
            </p>
          )}
        </div>

        {!searched && (
          <div className="mt-6 mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {chips.map((q) => (
                <button key={q.label} onClick={() => runSearch(q.label)} className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-ditch-orange hover:text-ditch-orange transition-colors flex items-center gap-1.5 shadow-sm">
                  <span>{q.icon}</span>{q.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {searched && loading && (<div className="mt-6 mb-8"><SurfingLoader /></div>)}
        {searched && !loading && recipe && (<div className="mt-6 mb-8"><RecipeCard recipe={recipe} /></div>)}
        {searched && !loading && !recipe && foodItem && (<div className="mt-6 mb-8"><FoodItemCard foodItem={foodItem} /></div>)}
        {searched && !loading && !recipe && !foodItem && foodList && foodList.items.length > 0 && (
          <div className="mt-6 mb-8"><FoodListCard foodList={foodList} onItemClick={runSearch} /></div>
        )}
        {searched && !loading && !recipe && !foodItem && !foodList && aiAnswer && (
          <div className="mt-6 mb-8"><AIAnswerCard aiAnswer={aiAnswer} onItemClick={runSearch} /></div>
        )}
        {searched && !loading && !recipe && !foodItem && !foodList && !aiAnswer && answer && (
          <div className="mt-6 mb-8"><ModuleAnswerCard answer={answer} /></div>
        )}
        {searched && !loading && !recipe && !foodItem && !foodList && !aiAnswer && results.length > 0 && (
          <div className="mt-4 mb-8"><ModuleResultsList results={results} /></div>
        )}
        {showEmpty && (<div className="mt-6 text-center"><p className="text-gray-500">No results found. Try a different search.</p></div>)}

        <div className="mt-6 mb-8">
          <AllergenKeyCard definitions={definitions} expandedDef={expandedDef} onToggle={(key) => setExpandedDef(expandedDef === key ? null : key)} />
        </div>
      </main>

      <footer className="border-t border-gray-200 py-4 bg-white">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">SpecOS by Ditch Hospitality</p>
          <p className="text-[10px] text-gray-400">Internal Use Only</p>
        </div>
      </footer>
    </div>
  );
}
