"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Package, Plus, Trash2 } from "lucide-react";

const ALLERGEN_OPTIONS = ["gluten", "dairy", "egg", "fish", "shellfish", "soy", "nut", "sesame"];

interface Ingredient {
  id: string;
  name: string;
  allergens: string[];
  substitutes: string[];
  notes: string;
}

const empty: Ingredient = {
  id: "",
  name: "",
  allergens: [],
  substitutes: [],
  notes: "",
};

export default function IngredientsPage() {
  const [items, setItems] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Ingredient | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await fetch("/api/admin/ingredients");
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!editing || !editing.id || !editing.name) return;
    setSaving(true);
    await fetch("/api/admin/ingredients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    setSaving(false);
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this ingredient? It will be unlinked from all food items.")) return;
    await fetch(`/api/admin/ingredients?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    load();
  };

  const toggleAllergen = (a: string) => {
    if (!editing) return;
    setEditing({
      ...editing,
      allergens: editing.allergens.includes(a)
        ? editing.allergens.filter((x) => x !== a)
        : [...editing.allergens, a],
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/menu" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-ditch-orange" /> Ingredient Library
            </h1>
            <p className="text-gray-500 mt-1">Update an ingredient here → every linked dish inherits the change.</p>
          </div>
        </div>
        <Button onClick={() => setEditing({ ...empty, id: `ing-${Date.now()}` })} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Ingredient
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ditch-orange" />
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((ing) => (
            <Card key={ing.id} className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-gray-900">{ing.name}</h3>
                  {ing.allergens.map((a) => (
                    <span key={a} className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-xs font-medium capitalize">
                      {a}
                    </span>
                  ))}
                </div>
                {ing.substitutes.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">Subs: {ing.substitutes.join(", ")}</p>
                )}
                {ing.notes && <p className="text-xs text-gray-500 mt-1">{ing.notes}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="ghost" size="sm" onClick={() => setEditing(ing)}>Edit</Button>
                <button onClick={() => remove(ing.id)} className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-900">
              {items.some((i) => i.id === editing.id) ? "Edit Ingredient" : "New Ingredient"}
            </h2>

            <Input
              label="Name"
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              placeholder="Soy Sauce (Kikkoman)"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Allergens</label>
              <div className="flex flex-wrap gap-2">
                {ALLERGEN_OPTIONS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAllergen(a)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full border capitalize transition-colors ${
                      editing.allergens.includes(a)
                        ? "bg-red-500 text-white border-red-500"
                        : "bg-white text-gray-600 border-gray-200 hover:border-red-300"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Substitutes (comma-separated)"
              value={editing.substitutes.join(", ")}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  substitutes: e.target.value.split(/,\s*/).map((s) => s.trim()).filter(Boolean),
                })
              }
              placeholder="Tamari, Coconut Aminos"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={editing.notes}
                onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-ditch-orange focus:ring-0 focus:outline-none"
                placeholder="Contains wheat. Sub tamari for GF on request."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={save} disabled={saving || !editing.name}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
