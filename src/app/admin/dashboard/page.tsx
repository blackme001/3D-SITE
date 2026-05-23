"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, Unlock, Eye, Trash2, RefreshCw, LogOut,
  Database, Mail, Phone, Save, X, Layers, DollarSign,
} from "lucide-react";
import AddOnModal from "@/components/AddOnModal";
import RequireAuth from "@/components/RequireAuth";
import { supabaseClient, isSupabaseSetup } from "@/lib/supabaseClient";
import type { MaterialRow } from "@/lib/supabaseClient";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Lead captured from the 3‑D configurator – includes a joined base_models row */
interface CapturedLead {
  id: string;
  builder_id: string;
  model_id: string | null;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  selected_materials: Record<string, string> | string | null;
  total_price: number;
  created_at: string;
  /** Joined from base_models */
  base_models?: { name: string } | null;
}

interface AddOn {
  id: string;
  name: string;
  type: string;
  dimensions: string;
}

// ─── Fallback seed data (used when Supabase is not configured) ────────────────

const FALLBACK_MATERIALS: MaterialRow[] = [
  { id: "55555555-5555-5555-5555-555555555555", builder_id: "11111111-1111-1111-1111-111111111111", category: "exterior_walls", name: "Concrete", price_modifier: 0, hex_color: "#5C5D60", texture_url: null, created_at: "" },
  { id: "66666666-6666-6666-6666-666666666666", builder_id: "11111111-1111-1111-1111-111111111111", category: "exterior_walls", name: "Cedar Wood", price_modifier: 45000, hex_color: "#95663B", texture_url: "/textures/wood_pattern.jpg", created_at: "" },
  { id: "77777777-7777-7777-7777-777777777777", builder_id: "11111111-1111-1111-1111-111111111111", category: "exterior_walls", name: "White Stucco", price_modifier: -15000, hex_color: "#F3F2EE", texture_url: null, created_at: "" },
  { id: "88888888-8888-8888-8888-888888888888", builder_id: "11111111-1111-1111-1111-111111111111", category: "flooring", name: "Polished Marble", price_modifier: 85000, hex_color: "#F9F9FB", texture_url: "/textures/marble_pattern.jpg", created_at: "" },
  { id: "99999999-9999-9999-9999-999999999999", builder_id: "11111111-1111-1111-1111-111111111111", category: "flooring", name: "Dark Oak", price_modifier: 35000, hex_color: "#21160D", texture_url: "/textures/oak_pattern.jpg", created_at: "" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseMaterials(raw: CapturedLead["selected_materials"]): Record<string, string> {
  if (!raw) return {};
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return {}; }
  }
  return raw;
}

function resolveMaterialNames(raw: CapturedLead["selected_materials"], materials: MaterialRow[]): string {
  const parsed = parseMaterials(raw);
  return Object.values(parsed)
    .map((id) => materials.find((m) => m.id === id)?.name ?? "—")
    .filter(Boolean)
    .join(", ") || "No materials";
}

// ─── DesignInspector overlay ──────────────────────────────────────────────────

interface DesignInspectorProps {
  lead: CapturedLead;
  materials: MaterialRow[];
  onClose: () => void;
}

function DesignInspector({ lead, materials, onClose }: DesignInspectorProps) {
  const parsed = parseMaterials(lead.selected_materials);
  const selectedMats = Object.entries(parsed).map(([category, id]) => ({
    category,
    material: materials.find((m) => m.id === id),
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 20 }}
        className="bg-[#111113] border border-neutral-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#C5A880]/10 border border-[#C5A880]/30 flex items-center justify-center">
              <Layers className="w-4 h-4 text-[#C5A880]" />
            </div>
            <div>
              <h2 className="text-xs font-black text-neutral-100 uppercase tracking-[0.2em]">Design Inspector</h2>
              <p className="text-[9px] text-neutral-500 uppercase tracking-wider mt-0.5">Configuration Readout · {lead.id.slice(0, 8)}…</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* Client card */}
          <div className="p-4 bg-neutral-950/50 border border-neutral-800 rounded-xl space-y-2">
            <span className="text-[8px] font-bold tracking-[0.2em] text-neutral-500 uppercase block">Client Identification</span>
            <div className="text-sm font-black text-neutral-100 uppercase">{lead.client_name}</div>
            <div className="flex flex-wrap gap-3 text-[10px] text-neutral-400">
              <span className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-neutral-600" />{lead.client_email}</span>
              {lead.client_phone && <span className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-neutral-600" />{lead.client_phone}</span>}
            </div>
          </div>

          {/* Model + price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-neutral-950/50 border border-neutral-800 rounded-xl">
              <span className="text-[8px] font-bold tracking-[0.2em] text-neutral-500 uppercase block mb-1">Base Model</span>
              <span className="text-sm font-black text-[#C5A880] uppercase">{lead.base_models?.name ?? "Bespoke Build"}</span>
            </div>
            <div className="p-4 bg-neutral-950/50 border border-neutral-800 rounded-xl">
              <span className="text-[8px] font-bold tracking-[0.2em] text-neutral-500 uppercase block mb-1">
                <DollarSign className="w-2.5 h-2.5 inline mr-0.5" />Locked Valuation
              </span>
              <span className="text-sm font-black text-neutral-100">
                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(lead.total_price)}
              </span>
            </div>
          </div>

          {/* Materials */}
          <div>
            <span className="text-[8px] font-bold tracking-[0.2em] text-neutral-500 uppercase block mb-3">Selected Materials</span>
            <div className="space-y-2">
              {selectedMats.length > 0 ? selectedMats.map(({ category, material }) => (
                <div key={category} className="flex items-center gap-3 p-3 bg-neutral-950/30 border border-neutral-800/60 rounded-lg">
                  <span
                    className="w-5 h-5 rounded-full shrink-0 border border-white/10"
                    style={{ backgroundColor: material?.hex_color ?? "#555" }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="block text-[8px] text-neutral-500 uppercase tracking-widest">
                      {category.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs font-bold text-neutral-200 uppercase">{material?.name ?? "Unknown"}</span>
                  </div>
                  <span className="text-[10px] font-bold text-neutral-400">
                    {material
                      ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0, signDisplay: "always" }).format(Number(material.price_modifier))
                      : "—"}
                  </span>
                </div>
              )) : (
                <p className="text-[10px] text-neutral-500 text-center py-4">No material data available.</p>
              )}
            </div>
          </div>

          {/* Timestamp */}
          <div className="text-[9px] text-neutral-600 uppercase tracking-wider text-right">
            Captured: {new Date(lead.created_at).toLocaleString()}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

function DashboardContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");

  const [leads, setLeads] = useState<CapturedLead[]>([]);
  const [materials, setMaterials] = useState<MaterialRow[]>(FALLBACK_MATERIALS);
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [showAddOnModal, setShowAddOnModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updatingMaterial, setUpdatingMaterial] = useState<string | null>(null);
  const [inspectingLead, setInspectingLead] = useState<CapturedLead | null>(null);

  const [editMaterialId, setEditMaterialId] = useState<string | null>(null);
  const [editPriceModifier, setEditPriceModifier] = useState<number>(0);
  const [editName, setEditName] = useState("");

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (isSupabaseSetup) {
        const { data: leadsData, error: leadsError } = await supabaseClient
          .from("saved_configurations")
          .select("*, base_models(name)")
          .order("created_at", { ascending: false });
        if (leadsError) throw leadsError;
        setLeads((leadsData as CapturedLead[]) || []);

        const { data: matsData, error: matsError } = await supabaseClient
          .from("materials")
          .select("*")
          .order("category");
        if (matsError) throw matsError;
        if (matsData && matsData.length > 0) setMaterials(matsData as MaterialRow[]);
      } else {
        const local = localStorage.getItem("apex_blueprint_leads") || "[]";
        const parsed: CapturedLead[] = JSON.parse(local);
        setLeads([...parsed].reverse());
        setMaterials(FALLBACK_MATERIALS);
      }
    } catch (err) {
      console.error("Dashboard load error:", err);
      setMaterials(FALLBACK_MATERIALS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // ── Auth ────────────────────────────────────────────────────────────────────
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "8888") {
      setIsAuthenticated(true);
      setPasscodeError("");
    } else {
      setPasscodeError("Access denied. Invalid signature code.");
    }
  };

  // ── CRUD ────────────────────────────────────────────────────────────────────
  const handleUpdateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMaterialId) return;
    setUpdatingMaterial(editMaterialId);
    try {
      if (isSupabaseSetup) {
        const { error } = await supabaseClient
          .from("materials")
          .update({ name: editName, price_modifier: editPriceModifier })
          .eq("id", editMaterialId);
        if (error) throw error;
      }
      setMaterials((prev) =>
        prev.map((m) =>
          m.id === editMaterialId ? { ...m, name: editName, price_modifier: editPriceModifier } : m
        )
      );
      setEditMaterialId(null);
      setEditName("");
      setEditPriceModifier(0);
    } catch (err) {
      console.error("Update material failed:", err);
      alert("Failed to save changes.");
    } finally {
      setUpdatingMaterial(null);
    }
  };

  const startEditing = (mat: MaterialRow) => {
    setEditMaterialId(mat.id);
    setEditName(mat.name);
    setEditPriceModifier(Number(mat.price_modifier));
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm("Delete this configuration lead?")) return;
    try {
      if (isSupabaseSetup) {
        const { error } = await supabaseClient.from("saved_configurations").delete().eq("id", id);
        if (error) throw error;
      } else {
        const local = localStorage.getItem("apex_blueprint_leads") || "[]";
        const list = JSON.parse(local).filter((l: CapturedLead) => l.id !== id);
        localStorage.setItem("apex_blueprint_leads", JSON.stringify(list));
      }
      setLeads((prev) => prev.filter((l) => l.id !== id));
      if (inspectingLead?.id === id) setInspectingLead(null);
    } catch (err) {
      console.error("Delete lead failed:", err);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="w-screen h-screen bg-[#0B0B0C] text-neutral-200 overflow-hidden font-sans relative flex flex-col select-none">

      {/* ── PASSCODE GATE ── */}
      <AnimatePresence>
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-[#0B0B0C] p-4"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900/30 via-[#0B0B0C] to-[#0B0B0C]" />
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-[400px] bg-[#111113]/90 border border-neutral-800/80 rounded-2xl p-8 relative z-10 text-center space-y-6 shadow-2xl"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-[#C5A880]/10 border border-[#C5A880]/40 flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#C5A880]" />
              </div>
              <div className="space-y-1.5">
                <h2 className="font-sans font-black text-base text-neutral-100 uppercase tracking-[0.2em]">Apex Secure Vault</h2>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest leading-relaxed">
                  Enter authorized administrator credentials to unlock the pricing &amp; lead database.
                </p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="password"
                  placeholder="••••"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full px-4 py-3 bg-black/60 border border-neutral-800 focus:border-[#C5A880]/50 rounded-xl text-center text-lg tracking-[0.5em] text-neutral-100 outline-none transition-all"
                />
                {passcodeError && (
                  <p className="text-[9px] text-red-500 uppercase tracking-wider text-center">{passcodeError}</p>
                )}
                <button
                  type="submit"
                  className="w-full py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-950 font-sans font-extrabold text-[10px] tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 transition-all uppercase"
                >
                  Clear Decryption
                  <Unlock className="w-3.5 h-3.5" />
                </button>
              </form>
              <div className="text-[9px] text-neutral-600 uppercase tracking-widest pt-2">
                Sandbox Passcode: <span className="text-[#C5A880] font-bold">8888</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DESIGN INSPECTOR OVERLAY ── */}
      <AnimatePresence>
        {inspectingLead && (
          <DesignInspector
            lead={inspectingLead}
            materials={materials}
            onClose={() => setInspectingLead(null)}
          />
        )}
      </AnimatePresence>

      {/* ── ADD-ON MODAL ── */}
      <AddOnModal
        isOpen={showAddOnModal}
        onClose={() => setShowAddOnModal(false)}
        onAdd={(addOn: AddOn) => setAddOns((prev) => [...prev, addOn])}
      />

      {/* ── MAIN DASHBOARD ── */}
      {isAuthenticated && (
        <>
          {/* Header */}
          <header className="px-6 py-4 border-b border-neutral-800/80 bg-neutral-950/40 flex justify-between items-center z-10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#C5A880] animate-pulse" />
              <div>
                <h1 className="font-sans font-black text-xs uppercase tracking-[0.25em] text-neutral-100">Apex Developer Portal</h1>
                <p className="text-[8px] text-neutral-500 uppercase tracking-wider mt-0.5">
                  Multi-Tenant Admin Workspace · {isSupabaseSetup ? "Supabase Connected" : "Local Database Mode"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchDashboardData}
                className="p-2 rounded-lg bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200 transition-all"
                title="Sync Database"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#C5A880]" : ""}`} />
              </button>
              <button
                onClick={() => setIsAuthenticated(false)}
                className="py-2 px-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[9px] font-bold tracking-wider rounded-lg flex items-center gap-2 transition-all uppercase text-neutral-400"
              >
                Lock Portal
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </header>

          {/* Grid Body */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden min-h-0">

            {/* ─ LEADS TABLE (2 cols) ─ */}
            <div className="lg:col-span-2 border-r border-neutral-800/80 flex flex-col bg-[#0b0b0c] min-h-0">
              <div className="p-5 border-b border-neutral-900/60 flex justify-between items-center bg-neutral-950/10 shrink-0">
                <div>
                  <h3 className="text-xs font-bold text-neutral-100 uppercase tracking-wider">Locked Spec Registries</h3>
                  <p className="text-[9px] text-neutral-500 uppercase tracking-widest mt-0.5">High-ticket user custom leads · click any row to inspect design.</p>
                </div>
                <div className="text-[10px] text-[#C5A880] font-bold uppercase tracking-wider">Total Leads: {leads.length}</div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 min-h-0">
                {leads.length === 0 ? (
                  <div className="py-24 text-center space-y-3">
                    <Database className="w-6 h-6 text-neutral-700 mx-auto" />
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest">No captured leads in the active schema.</p>
                  </div>
                ) : (
                  <div className="w-full border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950/10">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-neutral-900/50 border-b border-neutral-800 uppercase text-[9px] tracking-wider text-neutral-500 font-bold">
                          <th className="p-4">Client Detail</th>
                          <th className="p-4">Selections</th>
                          <th className="p-4 text-right">Locked Valuation</th>
                          <th className="p-4 text-center">Inspect</th>
                          <th className="p-4 text-center">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-900">
                        {leads.map((lead) => (
                          <tr
                            key={lead.id}
                            className="hover:bg-neutral-900/20 transition-colors cursor-pointer"
                            onClick={() => setInspectingLead(lead)}
                          >
                            <td className="p-4 space-y-1">
                              <span className="font-bold text-neutral-200 uppercase block">{lead.client_name}</span>
                              <div className="flex items-center gap-3 text-[9px] text-neutral-400">
                                <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-neutral-600" />{lead.client_email}</span>
                                <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-neutral-600" />{lead.client_phone || "N/A"}</span>
                              </div>
                            </td>
                            <td className="p-4 space-y-1">
                              <span className="text-[10px] font-bold text-[#C5A880] uppercase block">{lead.base_models?.name ?? "House Blueprint"}</span>
                              <span className="text-[9px] text-neutral-500 block">{resolveMaterialNames(lead.selected_materials, materials)}</span>
                              <div className="flex gap-1 pt-0.5">
                                {Object.values(parseMaterials(lead.selected_materials)).map((matId, i) => {
                                  const mat = materials.find((m) => m.id === matId);
                                  return mat?.hex_color ? (
                                    <span key={i} className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: mat.hex_color }} title={mat.name} />
                                  ) : null;
                                })}
                              </div>
                            </td>
                            <td className="p-4 text-right font-black text-neutral-100">
                              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(lead.total_price)}
                            </td>
                            <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => setInspectingLead(lead)}
                                className="text-[#C5A880]/70 hover:text-[#C5A880] p-1.5 rounded-lg border border-transparent hover:border-[#C5A880]/30 hover:bg-[#C5A880]/5 transition-all"
                                title="Inspect Design"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </td>
                            <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleDeleteLead(lead.id)}
                                className="text-red-500/70 hover:text-red-500 p-1.5 rounded-lg border border-transparent hover:border-red-950/50 hover:bg-red-950/20 transition-all"
                                title="Delete Lead"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* ─ PRICING CRUD (1 col) ─ */}
            <div className="flex flex-col bg-[#0B0B0C] min-h-0">
              {/* Add-On trigger */}
              <div className="flex justify-end px-5 pt-4 shrink-0">
                <button
                  onClick={() => setShowAddOnModal(true)}
                  className="bg-[#C5A880] text-[#111113] px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider hover:bg-[#d6b994] transition uppercase"
                >
                  + Add Feature
                </button>
              </div>

              {/* Added Features list */}
              {addOns.length > 0 && (
                <div className="mx-5 mt-3 p-4 border border-neutral-800 rounded-xl bg-[#111113] shrink-0">
                  <h3 className="text-[9px] font-bold text-[#C5A880] uppercase tracking-widest mb-2">Added Features</h3>
                  <ul className="space-y-1">
                    {addOns.map((a) => (
                      <li key={a.id} className="text-[10px] text-neutral-300 flex justify-between">
                        <span>{a.name} ({a.type})</span>
                        <span className="text-[#C5A880]">{a.dimensions}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="p-5 border-b border-neutral-900/60 bg-neutral-950/10 shrink-0 mt-2">
                <h3 className="text-xs font-bold text-neutral-100 uppercase tracking-wider">Asset Modifier Config</h3>
                <p className="text-[9px] text-neutral-500 uppercase tracking-widest mt-0.5">CRUD console for material pricing multipliers.</p>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
                {editMaterialId ? (
                  <form onSubmit={handleUpdateMaterial} className="p-5 border border-neutral-800 bg-neutral-950/20 rounded-xl space-y-4">
                    <div className="flex justify-between items-center border-b border-neutral-900 pb-2.5">
                      <span className="text-[10px] font-bold tracking-widest text-[#C5A880] uppercase">Update Pricing Option</span>
                      <button type="button" onClick={() => setEditMaterialId(null)} className="text-[9px] text-neutral-500 hover:text-neutral-300 uppercase tracking-wider">Cancel</button>
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[8px] font-bold tracking-[0.2em] text-neutral-500 uppercase">Material Name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2.5 bg-black/60 border border-neutral-800 focus:border-[#C5A880]/50 rounded-lg text-xs text-neutral-200 outline-none transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[8px] font-bold tracking-[0.2em] text-neutral-500 uppercase">Cost Modifier ($ USD)</label>
                      <input
                        type="number"
                        value={editPriceModifier}
                        onChange={(e) => setEditPriceModifier(Number(e.target.value))}
                        className="w-full px-3 py-2.5 bg-black/60 border border-neutral-800 focus:border-[#C5A880]/50 rounded-lg text-xs text-neutral-200 outline-none transition-all"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={updatingMaterial !== null}
                      className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-950 font-sans font-black text-[9px] tracking-[0.2em] rounded-lg flex items-center justify-center gap-1.5 transition-all uppercase disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {updatingMaterial === editMaterialId ? "Syncing..." : "Commit Valuation"}
                    </button>
                  </form>
                ) : (
                  <div className="p-4 border border-dashed border-neutral-800 rounded-xl text-center space-y-1.5 text-neutral-500">
                    <p className="text-[9px] uppercase tracking-wider leading-relaxed">Select a material card below to adjust its valuation multiplier.</p>
                  </div>
                )}

                <div className="space-y-3">
                  <span className="text-[8px] font-bold tracking-[0.2em] text-neutral-500 uppercase block border-b border-neutral-900 pb-1.5">
                    Available Materials &amp; Modifiers
                  </span>
                  {materials.map((mat) => {
                    const isWalls = mat.category === "exterior_walls";
                    const formattedModifier = new Intl.NumberFormat("en-US", {
                      style: "currency", currency: "USD", maximumFractionDigits: 0, signDisplay: "always",
                    }).format(Number(mat.price_modifier));
                    return (
                      <div
                        key={mat.id}
                        onClick={() => startEditing(mat)}
                        className="p-3.5 border border-neutral-800 bg-neutral-900/10 hover:bg-neutral-900/20 hover:border-neutral-700 cursor-pointer rounded-xl flex items-center justify-between transition-all duration-300"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-4 h-4 rounded-full shrink-0 border border-white/10" style={{ backgroundColor: mat.hex_color ?? "#888" }} />
                          <div className="space-y-0.5">
                            <span className="block text-[8px] text-neutral-500 uppercase tracking-widest font-bold">{isWalls ? "Façade Wall" : "Flooring"}</span>
                            <span className="text-xs font-bold text-neutral-200 uppercase">{mat.name}</span>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <span className={`text-[10px] font-extrabold block ${Number(mat.price_modifier) >= 0 ? "text-neutral-200" : "text-green-500"}`}>{formattedModifier}</span>
                          <span className="text-[7px] text-[#C5A880] uppercase tracking-wider font-bold bg-[#C5A880]/5 border border-[#C5A880]/10 px-1 py-0.5 rounded">Edit</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}

// ─── Route export ─────────────────────────────────────────────────────────────

export default function BuilderDashboard() {
  return (
    <RequireAuth requiredRole="admin">
      <DashboardContent />
    </RequireAuth>
  );
}
