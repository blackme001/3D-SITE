"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, Unlock, Mail, Trash2, Download, Search, FileText, Eye, 
  MapPin, Clock, DollarSign, Award, Layers, Compass, ExternalLink,
  ChevronRight, Calendar, Settings, Database, RefreshCw, LogOut, Check
} from "lucide-react";
import { fetchLeads, deleteLead, Lead } from "@/lib/supabase";
import ThreeCanvas from "@/components/ThreeCanvas";

export default function AdminPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [simulatedEmails, setSimulatedEmails] = useState<any[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [styleFilter, setStyleFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"visual" | "specs" | "email" | "raw">("visual");
  const [adminInteriorView, setAdminInteriorView] = useState<"exterior" | "ground" | "upper" | "exploded">("exterior");
  const [adminNightMode, setAdminNightMode] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch data from database and simulated logs
  const loadData = async () => {
    setIsLoading(true);
    try {
      const fetchedLeads = await fetchLeads();
      setLeads(fetchedLeads);
      if (fetchedLeads.length > 0 && !selectedLead) {
        setSelectedLead(fetchedLeads[0]);
      }

      // Fetch simulated outbox logs
      const res = await fetch("/api/leads");
      if (res.ok) {
        const emailData = await res.json();
        setSimulatedEmails(emailData.emails || []);
      }
    } catch (err) {
      console.error("Failed to load admin dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default secret passcode is 8888 for simulation
    if (passcode === "8888") {
      setIsAuthenticated(true);
      setPasscodeError("");
    } else {
      setPasscodeError("Invalid security credential clearance code.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasscode("");
    setLeads([]);
    setSelectedLead(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this lead configuration?")) {
      return;
    }
    setIsDeleting(id);
    try {
      const success = await deleteLead(id);
      if (success) {
        setLeads((prev) => prev.filter((l) => l.id !== id));
        if (selectedLead?.id === id) {
          const remaining = leads.filter((l) => l.id !== id);
          setSelectedLead(remaining.length > 0 ? remaining[0] : null);
        }
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(leads, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `apex_configurations_export_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    const headers = ["Client Name", "Email", "Project Location", "House Style", "Est. Cost", "Timeline", "Room Count", "Reflecting Pool", "Solar Array", "Firepit Lounge", "Timestamp"];
    const rows = leads.map(l => {
      const conf = l.configuration || {};
      return [
        l.full_name,
        l.email,
        l.project_location,
        conf.house_style || "N/A",
        conf.estimated_cost || 0,
        conf.timeline || "N/A",
        conf.rooms || "N/A",
        conf.swimming_pool || "N/A",
        conf.solar_array || "N/A",
        conf.firepit_lounge || "N/A",
        l.created_at || new Date().toISOString()
      ];
    });

    const csvContent = [headers.join(","), ...rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", `apex_leads_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Helper to parse numeric values from string configuration keys
  const parsedConfig = useMemo(() => {
    if (!selectedLead) return null;
    const config = selectedLead.configuration || {};
    
    // Parse footprint (e.g. "3500 SQ FT")
    const footprintNum = parseInt(config.footprint) || 3500;
    
    // Parse land size (e.g. "0.5 Acres")
    const landSizeNum = parseFloat(config.land_size) || 0.5;

    // Parse rooms (e.g. "3 Bedrooms")
    const roomsCount = parseInt(config.rooms) || 3;

    return {
      houseStyle: (config.house_style || "Aperture Terrace") as any,
      footprint: footprintNum as any,
      landSize: landSizeNum as any,
      exteriorWalls: (config.exterior_walls || "Concrete") as any,
      flooring: (config.flooring || "Polished Marble") as any,
      roomCount: roomsCount as any,
      hasPool: config.swimming_pool === "Included",
      hasSolar: config.solar_array === "Included",
      hasLounge: config.firepit_lounge === "Included",
      totalCost: config.estimated_cost || 0
    };
  }, [selectedLead]);

  // Find simulated email for selected lead
  const matchedEmailHtml = useMemo(() => {
    if (!selectedLead) return "";
    const matched = simulatedEmails.find(
      (email) => email.client_email.toLowerCase() === selectedLead.email.toLowerCase()
    );
    return matched ? matched.html : null;
  }, [selectedLead, simulatedEmails]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch = 
        lead.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.project_location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStyle = styleFilter === "all" || lead.configuration?.house_style === styleFilter;
      
      return matchesSearch && matchesStyle;
    });
  }, [leads, searchQuery, styleFilter]);

  // Analytical stats
  const stats = useMemo(() => {
    if (leads.length === 0) return { total: 0, avgCost: 0, popularStyle: "N/A" };
    const total = leads.length;
    const sumCost = leads.reduce((sum, l) => sum + (l.configuration?.estimated_cost || 0), 0);
    const avgCost = sumCost / total;

    const stylesCount = leads.reduce((acc: any, l) => {
      const style = l.configuration?.house_style || "Unknown";
      acc[style] = (acc[style] || 0) + 1;
      return acc;
    }, {});

    const popularStyle = Object.keys(stylesCount).reduce((a, b) => 
      stylesCount[a] > stylesCount[b] ? a : b, "N/A"
    );

    return { total, avgCost, popularStyle };
  }, [leads]);

  if (!mounted) return null;

  return (
    <div className="w-screen h-screen bg-[#0B0B0C] text-neutral-200 overflow-hidden font-sans select-none relative flex flex-col">
      {/* ACCESS LOCKED GATE */}
      <AnimatePresence>
        {!isAuthenticated && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-[#0B0B0C] p-4"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900/40 via-[#0B0B0C] to-[#0B0B0C]" />
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-[400px] glass-panel rounded-2xl p-8 relative z-10 text-center space-y-6"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-luxury-gold/10 border border-luxury-gold/40 flex items-center justify-center">
                <Lock className="w-5 h-5 text-luxury-gold" />
              </div>
              <div className="space-y-1.5">
                <h2 className="font-display font-extrabold text-lg text-neutral-100 uppercase tracking-widest">
                  APEX DESIGN PORTAL
                </h2>
                <p className="text-[10px] text-neutral-400 uppercase tracking-widest">
                  Enter authorized administrator credentials to inspect configurations.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[9px] font-bold tracking-[0.2em] text-neutral-400 uppercase">
                    Security Passcode
                  </label>
                  <input
                    type="password"
                    placeholder="••••"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0B0B0C] border border-neutral-800 focus:border-luxury-gold/50 rounded-xl text-center text-lg tracking-[0.5em] text-neutral-100 outline-none transition-all"
                  />
                  {passcodeError && (
                    <p className="text-[9px] text-red-500 uppercase tracking-wider text-center mt-1">
                      {passcodeError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-950 font-display font-extrabold text-[10px] tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 transition-all uppercase"
                >
                  Decrypt Credentials
                  <Unlock className="w-3.5 h-3.5" />
                </button>
              </form>
              <div className="text-[8px] text-neutral-600 uppercase tracking-widest pt-2">
                Simulated Sandbox Passcode: <span className="text-luxury-gold font-bold">8888</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER BAR */}
      <header className="px-6 py-4 border-b border-neutral-800/80 bg-neutral-950/40 flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-luxury-gold glow-gold" />
          <div>
            <h1 className="font-display font-black text-xs uppercase tracking-[0.2em] text-neutral-100">
              Apex Spec Registry
            </h1>
            <p className="text-[8px] text-neutral-500 uppercase tracking-wider">
              Management Portal • Database View Mode
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2 rounded-lg bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200 transition-all"
            title="Refresh Database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-luxury-gold' : ''}`} />
          </button>
          
          <button
            onClick={handleLogout}
            className="py-2 px-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[9px] font-bold tracking-wider rounded-lg flex items-center gap-2 transition-all uppercase text-neutral-400"
          >
            Log Out
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* DASHBOARD GRID CONTENT */}
      {isAuthenticated && (
        <div className="flex-1 flex overflow-hidden min-h-0">
          
          {/* LEFT COLUMN: LIST & CONTROLS */}
          <div className="w-[380px] border-r border-neutral-800/80 flex flex-col bg-[#0b0b0c] min-h-0 shrink-0">
            {/* STATS STRIP */}
            <div className="p-4 grid grid-cols-3 gap-2 border-b border-neutral-900 bg-neutral-950/20 shrink-0">
              <div className="bg-neutral-900/20 border border-neutral-800/40 rounded-lg p-2.5 text-center">
                <span className="block text-[7px] text-neutral-500 uppercase tracking-wider font-bold mb-0.5">Leads</span>
                <span className="text-sm font-extrabold text-neutral-200">{stats.total}</span>
              </div>
              <div className="bg-neutral-900/20 border border-neutral-800/40 rounded-lg p-2.5 text-center">
                <span className="block text-[7px] text-neutral-500 uppercase tracking-wider font-bold mb-0.5">Avg Build</span>
                <span className="text-xs font-bold text-luxury-gold">
                  ${(stats.avgCost / 1000).toFixed(0)}k
                </span>
              </div>
              <div className="bg-neutral-900/20 border border-neutral-800/40 rounded-lg p-2.5 text-center">
                <span className="block text-[7px] text-neutral-500 uppercase tracking-wider font-bold mb-0.5">Popular</span>
                <span className="text-[8px] font-bold text-neutral-300 truncate block">
                  {stats.popularStyle.replace(" Minimalist", "").replace(" Pavilion", "")}
                </span>
              </div>
            </div>

            {/* SEARCH AND FILTERS */}
            <div className="p-4 border-b border-neutral-900 space-y-3 shrink-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search client, email, or site..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-neutral-900/50 border border-neutral-800/80 rounded-xl text-xs placeholder-neutral-600 outline-none text-neutral-200 focus:border-luxury-gold/50"
                />
                <Search className="absolute left-3 top-3 w-4 h-4 text-neutral-600" />
              </div>

              <div className="flex gap-2">
                {["all", "Aperture Terrace", "Timberline Vista", "Minimalist Pavilion"].map((style) => (
                  <button
                    key={style}
                    onClick={() => setStyleFilter(style)}
                    className={`py-1.5 px-2.5 rounded-lg border text-[8px] tracking-wider font-bold uppercase transition-all truncate flex-1 text-center ${
                      styleFilter === style
                        ? "border-luxury-gold bg-luxury-gold/5 text-luxury-gold"
                        : "border-neutral-800 bg-[#0B0B0C] text-neutral-400 hover:border-neutral-700"
                    }`}
                  >
                    {style === "all" ? "All Styles" : style.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* UTILITY EXPORTS */}
            <div className="px-4 py-2 border-b border-neutral-900 flex justify-between items-center text-[9px] text-neutral-400 tracking-wider uppercase font-bold shrink-0">
              <span>Registry Listing ({filteredLeads.length})</span>
              <div className="flex gap-2.5">
                <button onClick={handleExportCSV} className="hover:text-luxury-gold flex items-center gap-1 transition-all">
                  <Download className="w-3 h-3" /> CSV
                </button>
                <button onClick={handleExportJSON} className="hover:text-luxury-gold flex items-center gap-1 transition-all">
                  <Download className="w-3 h-3" /> JSON
                </button>
              </div>
            </div>

            {/* LIST OF LEADS */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredLeads.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <Database className="w-6 h-6 text-neutral-700 mx-auto" />
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest">No configurations archived.</p>
                </div>
              ) : (
                filteredLeads.map((lead) => {
                  const isSelected = selectedLead?.id === lead.id;
                  const cost = lead.configuration?.estimated_cost || 0;
                  const dateFormatted = lead.created_at
                    ? new Date(lead.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                    : "Mock Lead";

                  return (
                    <div
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-300 relative ${
                        isSelected
                          ? "border-luxury-gold bg-luxury-gold/5 shadow-inner"
                          : "border-neutral-800/60 bg-neutral-900/10 hover:border-neutral-700 hover:bg-neutral-800/20"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-0.5 min-w-0">
                          <h4 className="text-xs font-bold text-neutral-200 truncate uppercase">
                            {lead.full_name}
                          </h4>
                          <p className="text-[9px] text-neutral-500 truncate lowercase leading-none">
                            {lead.email}
                          </p>
                        </div>
                        <span className="text-[8px] font-bold text-neutral-500 uppercase whitespace-nowrap bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                          {dateFormatted}
                        </span>
                      </div>

                      <div className="mt-3 flex justify-between items-end border-t border-neutral-900 pt-2.5">
                        <div className="space-y-0.5">
                          <span className="block text-[7px] text-neutral-600 uppercase tracking-wider font-bold">Model Style</span>
                          <span className="text-[8px] font-bold text-luxury-gold uppercase tracking-wider">
                            {lead.configuration?.house_style}
                          </span>
                        </div>
                        <span className="text-xs font-black text-neutral-100">
                          ${(cost / 1000).toFixed(0)}k
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: ACTIVE INSPECTION CANVAS & SPEC TABLE */}
          <div className="flex-1 bg-neutral-950/20 flex flex-col overflow-hidden min-h-0">
            {selectedLead ? (
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
                
                {/* 3D CANVAS INSPECTION VIEW (LEFT DETAILED HALF) */}
                <div className="flex-1 h-[40vh] md:h-full relative overflow-hidden flex flex-col border-b md:border-b-0 md:border-r border-neutral-800/80">
                  <div className="absolute top-6 left-6 z-10 pointer-events-none">
                    <span className="text-[9px] font-bold tracking-[0.25em] text-neutral-400 uppercase">
                      Inspect Client Geometry
                    </span>
                    <h3 className="font-display font-extrabold text-lg text-neutral-100 uppercase tracking-widest leading-none mt-1">
                      {selectedLead.full_name}
                    </h3>
                  </div>

                  {/* 3D CANVAS COMPONENT */}
                  <div className="flex-1 w-full bg-[#0a0a0b] relative">
                    {parsedConfig && (
                      <ThreeCanvas
                        exteriorWalls={parsedConfig.exteriorWalls}
                        flooring={parsedConfig.flooring}
                        isNight={adminNightMode}
                        houseStyle={parsedConfig.houseStyle}
                        footprint={parsedConfig.footprint}
                        landSize={parsedConfig.landSize}
                        roomCount={parsedConfig.roomCount}
                        hasPool={parsedConfig.hasPool}
                        hasSolar={parsedConfig.hasSolar}
                        hasLounge={parsedConfig.hasLounge}
                        interiorView={adminInteriorView}
                      />
                    )}
                  </div>

                  {/* 3D CANVAS TOGGLES OVERLAY */}
                  <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-wrap gap-2.5 justify-between items-center glass-panel p-3.5 rounded-xl border border-neutral-850">
                    {/* Floor views segmented control */}
                    <div className="flex gap-1.5">
                      {[
                        { id: "exterior", label: "Exterior" },
                        { id: "ground", label: "Ground" },
                        { id: "upper", label: "Upper" },
                        { id: "exploded", label: "Exploded" }
                      ].map((view) => (
                        <button
                          key={view.id}
                          onClick={() => setAdminInteriorView(view.id as any)}
                          className={`py-1.5 px-3 rounded-lg border text-[8px] tracking-wider font-bold uppercase transition-all ${
                            adminInteriorView === view.id
                              ? "border-luxury-gold bg-luxury-gold/5 text-luxury-gold"
                              : "border-neutral-800 bg-[#0B0B0C]/40 text-neutral-400 hover:border-neutral-700"
                          }`}
                        >
                          {view.label}
                        </button>
                      ))}
                    </div>

                    {/* Night mode toggle */}
                    <button
                      onClick={() => setAdminNightMode(!adminNightMode)}
                      className={`py-1.5 px-3 rounded-lg border text-[8px] tracking-wider font-bold uppercase transition-all ${
                        adminNightMode
                          ? "border-luxury-gold bg-luxury-gold/5 text-luxury-gold"
                          : "border-neutral-800 bg-[#0B0B0C]/40 text-neutral-400 hover:border-neutral-700"
                      }`}
                    >
                      {adminNightMode ? "Night Scene" : "Day Scene"}
                    </button>
                  </div>
                </div>

                {/* DETAILS TABS & ACTION CONSOLE (RIGHT DETAILED HALF) */}
                <div className="w-full md:w-[420px] flex flex-col overflow-hidden min-h-0 bg-[#0B0B0C]">
                  
                  {/* TAB LIST */}
                  <div className="flex border-b border-neutral-800/80 bg-neutral-950/40 shrink-0">
                    {[
                      { id: "visual", label: "Spec Overview" },
                      { id: "specs", label: "Directory Specs" },
                      { id: "email", label: "Sent Email" },
                      { id: "raw", label: "JSON" }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 py-3 text-[8px] tracking-[0.15em] font-bold text-center border-b-2 uppercase transition-all ${
                          activeTab === tab.id
                            ? "border-luxury-gold text-luxury-gold bg-luxury-gold/2"
                            : "border-transparent text-neutral-400 hover:text-neutral-200"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* TAB CONTEXT BODY */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
                    
                    {/* TAB: VISUAL OVERVIEW */}
                    {activeTab === "visual" && parsedConfig && (
                      <div className="space-y-6">
                        <div className="space-y-1">
                          <span className="text-[8px] font-bold tracking-[0.2em] text-neutral-500 uppercase">Registry Signature</span>
                          <h4 className="text-sm font-bold text-neutral-100 uppercase">{selectedLead.full_name}</h4>
                          <div className="flex items-center gap-1.5 text-[9px] text-neutral-400">
                            <Mail className="w-3 h-3 text-neutral-600" /> {selectedLead.email}
                          </div>
                        </div>

                        {/* KEY SPECIFICATIONS */}
                        <div className="space-y-2">
                          <span className="text-[8px] font-bold tracking-[0.2em] text-neutral-500 uppercase block border-b border-neutral-900 pb-1">
                            Architectural Assets
                          </span>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-neutral-900/30 p-2.5 rounded-lg border border-neutral-850">
                              <span className="block text-[7px] text-neutral-500 uppercase tracking-widest font-bold">Base Style</span>
                              <span className="text-[10px] font-bold text-neutral-200">{parsedConfig.houseStyle}</span>
                            </div>
                            <div className="bg-neutral-900/30 p-2.5 rounded-lg border border-neutral-850">
                              <span className="block text-[7px] text-neutral-500 uppercase tracking-widest font-bold">Estimated Cost</span>
                              <span className="text-[10px] font-black text-luxury-gold">
                                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(parsedConfig.totalCost)}
                              </span>
                            </div>
                            <div className="bg-neutral-900/30 p-2.5 rounded-lg border border-neutral-850">
                              <span className="block text-[7px] text-neutral-500 uppercase tracking-widest font-bold">Zoning Location</span>
                              <span className="text-[10px] font-bold text-neutral-200">{selectedLead.project_location}</span>
                            </div>
                            <div className="bg-neutral-900/30 p-2.5 rounded-lg border border-neutral-850">
                              <span className="block text-[7px] text-neutral-500 uppercase tracking-widest font-bold">Init. Timeline</span>
                              <span className="text-[10px] font-bold text-neutral-200">{selectedLead.configuration?.timeline || "N/A"}</span>
                            </div>
                            <div className="bg-neutral-900/30 p-2.5 rounded-lg border border-neutral-850">
                              <span className="block text-[7px] text-neutral-500 uppercase tracking-widest font-bold">Footprint Size</span>
                              <span className="text-[10px] font-bold text-neutral-200">{selectedLead.configuration?.footprint}</span>
                            </div>
                            <div className="bg-neutral-900/30 p-2.5 rounded-lg border border-neutral-850">
                              <span className="block text-[7px] text-neutral-500 uppercase tracking-widest font-bold">Zoning Land plot</span>
                              <span className="text-[10px] font-bold text-neutral-200">{selectedLead.configuration?.land_size}</span>
                            </div>
                          </div>
                        </div>

                        {/* CONFIGURATION LIST */}
                        <div className="space-y-2">
                          <span className="text-[8px] font-bold tracking-[0.2em] text-neutral-500 uppercase block border-b border-neutral-900 pb-1">
                            Materials & Eco Extras
                          </span>
                          <div className="space-y-2 text-[10px]">
                            <div className="flex justify-between items-center py-1.5 border-b border-neutral-900">
                              <span className="text-neutral-500 uppercase font-semibold">Facade Finish</span>
                              <span className="text-neutral-200 font-bold uppercase">{parsedConfig.exteriorWalls}</span>
                            </div>
                            <div className="flex justify-between items-center py-1.5 border-b border-neutral-900">
                              <span className="text-neutral-500 uppercase font-semibold">Interior Flooring</span>
                              <span className="text-neutral-200 font-bold uppercase">{parsedConfig.flooring}</span>
                            </div>
                            <div className="flex justify-between items-center py-1.5 border-b border-neutral-900">
                              <span className="text-neutral-500 uppercase font-semibold">Bedroom Count</span>
                              <span className="text-neutral-200 font-bold uppercase">{parsedConfig.roomCount} Rooms</span>
                            </div>
                            <div className="flex justify-between items-center py-1.5 border-b border-neutral-900">
                              <span className="text-neutral-500 uppercase font-semibold">Reflecting Pool</span>
                              <span className={`font-bold uppercase ${parsedConfig.hasPool ? "text-luxury-gold" : "text-neutral-600"}`}>
                                {parsedConfig.hasPool ? "Included" : "None"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-1.5 border-b border-neutral-900">
                              <span className="text-neutral-500 uppercase font-semibold">Solar Roof Array</span>
                              <span className={`font-bold uppercase ${parsedConfig.hasSolar ? "text-luxury-gold" : "text-neutral-600"}`}>
                                {parsedConfig.hasSolar ? "Included" : "None"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-1.5 border-b border-neutral-900">
                              <span className="text-neutral-500 uppercase font-semibold">Gravel Firepit Lounge</span>
                              <span className={`font-bold uppercase ${parsedConfig.hasLounge ? "text-luxury-gold" : "text-neutral-600"}`}>
                                {parsedConfig.hasLounge ? "Included" : "None"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB: DIRECTORY SPECIFICATIONS (LOCAL COORDINATES) */}
                    {activeTab === "specs" && parsedConfig && (
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <span className="text-[8px] font-bold tracking-[0.2em] text-neutral-500 uppercase block">Blueprints Coordinates</span>
                          <p className="text-[10px] text-neutral-400 leading-relaxed uppercase">
                            Spatial registry positions of mock doors, windows, and structural cells as calculated:
                          </p>
                        </div>
                        
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                          {[
                            { name: "Entry Front Pivot Door", position: "X = 0, Z = 4.2", room: "Ground Foyer" },
                            { name: "Master Balcony Window", position: "X = -3.8, Z = 4.2", room: "Master Bedroom" },
                            { name: "Ground Floating Staircase", position: "X = -3.85, Z = 2.4", room: "Living Saloon" },
                            { name: "Master Ensuite Pivot Door", position: "X = 1.82, Z = -2.55", room: "Master Suite" },
                            { name: "Kitchen Side Sliding Glass", position: "X = 3.8, Z = 0", room: "Kitchenette" },
                            ...(parsedConfig.hasPool ? [{ name: "Reflecting Deck Board Pool", position: "X = 6.4, Z = -0.5", room: "East Landscape" }] : []),
                            ...(parsedConfig.hasSolar ? [{ name: "Silicon Solar Cells Array", position: "X = -3.8, Z = 0", room: "Roof Terrace" }] : []),
                            ...(parsedConfig.hasLounge ? [{ name: "Basalt Firepit Circle", position: "X = -6.8, Z = -5.6", room: "West Landscape" }] : [])
                          ].map((item, i) => (
                            <div key={i} className="p-3 bg-neutral-900/30 border border-neutral-850 rounded-xl flex flex-col gap-1 text-[10px] leading-tight">
                              <span className="font-bold text-neutral-300 uppercase">{item.name}</span>
                              <div className="flex justify-between text-[8px] uppercase tracking-wider text-neutral-500 font-bold mt-1">
                                <span>{item.room}</span>
                                <span className="text-luxury-gold">{item.position}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* TAB: SENT EMAIL OUTBOX NOTIFICATION PREVIEW */}
                    {activeTab === "email" && (
                      <div className="space-y-4 h-full flex flex-col min-h-0">
                        <div className="space-y-1">
                          <span className="text-[8px] font-bold tracking-[0.2em] text-neutral-500 uppercase block">Outbox Dispatch Log</span>
                          <p className="text-[10px] text-neutral-400 leading-relaxed uppercase">
                            The exact visual HTML email template dispatched to the registry owner email for assignment scoping:
                          </p>
                        </div>

                        {matchedEmailHtml ? (
                          <div className="flex-1 bg-white border border-neutral-800 rounded-xl overflow-hidden min-h-[300px] h-[350px]">
                            <iframe 
                              srcDoc={matchedEmailHtml} 
                              className="w-full h-full border-0 scale-90 origin-top"
                              style={{ width: "111%", height: "111%" }}
                            />
                          </div>
                        ) : (
                          <div className="p-8 border border-neutral-850 rounded-xl text-center space-y-2 bg-neutral-900/10">
                            <Mail className="w-5 h-5 text-neutral-600 mx-auto" />
                            <p className="text-[9px] text-neutral-500 uppercase tracking-widest">
                              No server email payload logs matched for this contact domain. Showing fallback standard preview.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB: RAW JSON METADATA */}
                    {activeTab === "raw" && (
                      <div className="space-y-2 h-full flex flex-col min-h-0">
                        <span className="text-[8px] font-bold tracking-[0.2em] text-neutral-500 uppercase block shrink-0">Raw Database Payload Record</span>
                        <pre className="flex-1 p-4 bg-[#050506] border border-neutral-900 rounded-xl text-[9px] text-luxury-gold font-mono overflow-auto leading-relaxed max-h-[300px]">
                          {JSON.stringify(selectedLead, null, 2)}
                        </pre>
                      </div>
                    )}

                  </div>

                  {/* BOTTOM ACTION BUTTONS */}
                  <div className="p-6 border-t border-neutral-800/80 bg-neutral-950/20 shrink-0">
                    <button
                      onClick={() => handleDelete(selectedLead.id!)}
                      disabled={isDeleting === selectedLead.id}
                      className="w-full py-3 bg-red-950/20 border border-red-900/60 hover:bg-red-950/40 text-red-400 font-display font-extrabold text-[10px] tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 transition-all uppercase"
                    >
                      {isDeleting === selectedLead.id ? (
                        <>Archiving Record...</>
                      ) : (
                        <>
                          Archive Configuration
                          <Trash2 className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>

                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-3">
                <Database className="w-8 h-8 text-neutral-700 animate-pulse" />
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">No Client Spec Selected</h3>
                  <p className="text-[9px] text-neutral-500 uppercase tracking-wider">Select a blueprint configuration registry card from the left panel to inspect.</p>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
