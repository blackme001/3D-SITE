"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Sparkles, Shield, ArrowRight, Layers, Maximize, ClipboardList, ToggleLeft, ToggleRight } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";
import { HouseStyle, FootprintSize, LandSize } from "./Configurator";

interface SidebarProps {
  houseStyle: HouseStyle;
  setHouseStyle: (style: HouseStyle) => void;
  footprint: FootprintSize;
  setFootprint: (size: FootprintSize) => void;
  landSize: LandSize;
  setLandSize: (size: LandSize) => void;
  exteriorWalls: "Concrete" | "Cedar Wood" | "White Stucco";
  setExteriorWalls: (val: "Concrete" | "Cedar Wood" | "White Stucco") => void;
  flooring: "Polished Marble" | "Dark Oak";
  setFlooring: (val: "Polished Marble" | "Dark Oak") => void;
  isNight: boolean;
  setIsNight: (val: boolean) => void;
  totalCost: number;
  onOpenSaveModal: () => void;
  
  // Advanced customized controls props
  roomCount: 3 | 4 | 5;
  setRoomCount: (val: 3 | 4 | 5) => void;
  hasPool: boolean;
  setHasPool: (val: boolean) => void;
  hasSolar: boolean;
  setHasSolar: (val: boolean) => void;
  hasLounge: boolean;
  setHasLounge: (val: boolean) => void;
  interiorView: "exterior" | "ground" | "upper" | "exploded";
  setInteriorView: (val: "exterior" | "ground" | "upper" | "exploded") => void;
}

export default function Sidebar({
  houseStyle,
  setHouseStyle,
  footprint,
  setFootprint,
  landSize,
  setLandSize,
  exteriorWalls,
  setExteriorWalls,
  flooring,
  setFlooring,
  isNight,
  setIsNight,
  totalCost,
  onOpenSaveModal,
  roomCount,
  setRoomCount,
  hasPool,
  setHasPool,
  hasSolar,
  setHasSolar,
  hasLounge,
  setHasLounge,
  interiorView,
  setInteriorView,
}: SidebarProps) {
  const blueprintAssets = useMemo(() => {
    const list: Array<{
      name: string;
      position: string;
      room: string;
      status: string;
      isToggleable?: boolean;
      active?: boolean;
      action?: () => void;
    }> = [];

    // Ground floor assets
    if (interiorView === "exterior" || interiorView === "ground" || interiorView === "exploded") {
      const doorXStr = houseStyle === "Minimalist Pavilion" ? "X = -3.5" : "X = 0";
      list.push({ name: "Solid Aluminium Entry Door", position: `${doorXStr}, Z = 3.93`, room: "Front Foyer", status: "Installed" });
      list.push({ name: "Glazed Facade Windows", position: "Multiple Positions", room: "Facade / Sides", status: "Fitted" });
      list.push({ name: "Central Floating Staircase", position: "X = 0.4, Z = -3.3", room: "Staircase Well", status: "Erected" });
      list.push({ name: "Modular Parlor L-Sofa", position: "X = 3.5, Z = 1.2", room: "Living Room", status: "Placed" });
      list.push({ name: "Hardwood Dining Set & Chairs", position: "X = -0.8, Z = -1.0", room: "Dining Area", status: "Placed" });
      list.push({ name: "L-Kitchen Counters & Fridge", position: "X = -4.5, Z = 1.2", room: "Kitchen Suite", status: "Built-in" });
      list.push({ name: "Toilet Bowl & Sink Basin", position: "X = -4.8, Z = -2.7", room: "Ground Toilet", status: "Plumbed" });
      
      list.push({
        name: "Eco Reflecting Pool & Deck",
        position: "X = 1.5, Z = 6.2",
        room: "Front Yard",
        status: hasPool ? "Active" : "Omitted",
        isToggleable: true,
        active: hasPool,
        action: () => setHasPool(!hasPool),
      });

      list.push({
        name: "Firepit Lounge & Gravel Yard",
        position: "X = -6.8, Z = 3.8",
        room: "Left Yard",
        status: hasLounge ? "Active" : "Omitted",
        isToggleable: true,
        active: hasLounge,
        action: () => setHasLounge(!hasLounge),
      });
    }

    // Upper floor assets
    if (interiorView === "exterior" || interiorView === "upper" || interiorView === "exploded") {
      list.push({ name: "Solid Master Ensuite Door", position: "X = 1.82, Z = -2.5", room: "Master Ensuite", status: "Installed" });
      list.push({ name: "Master Suite Entry Door", position: "X = 1.82, Z = 1.5", room: "Master Bedroom", status: "Installed" });
      list.push({ name: "King Bed, Tables & Wardrobe", position: "X = 4.5, Z = 0.5", room: "Master Bedroom", status: "Furnished" });
      list.push({ name: "Ensuite Toilet & Basin Vanity", position: "X = 4.8, Z = -2.85", room: "Master Ensuite", status: "Plumbed" });
      list.push({ name: "Upper Family Bathroom", position: "X = 0.6, Z = -2.85", room: "Upper Bathroom", status: "Plumbed" });
      list.push({ name: "Family Bathroom Door", position: "X = 0.57, Z = -1.8", room: "Upper Bathroom", status: "Installed" });
      list.push({ name: "Stair Landing Balustrade", position: "X = -2.06, Z = -2.5", room: "Stair Landing", status: "Fitted" });
      list.push({ name: "Bedroom 2 Entry Door", position: "X = -2.12, Z = 1.8", room: "Bedroom 2", status: "Installed" });
      list.push({ name: "Bedroom 2 Bed & Headboard", position: "X = -1.4, Z = 0.6", room: "Bedroom 2", status: "Furnished" });
      list.push({ name: "Bedroom 3 Entry Door", position: "X = -4.5, Z = 1.8", room: "Bedroom 3", status: "Installed" });
      list.push({ name: "Bedroom 3 Bed & Headboard", position: "X = -3.3, Z = 0.6", room: "Bedroom 3", status: "Furnished" });

      list.push({
        name: "Bedroom 4 Layout & Bed",
        position: "X = -5.2, Z = 0.6",
        room: "Bedroom 4",
        status: roomCount >= 4 ? "Active" : "Omitted",
        isToggleable: true,
        active: roomCount >= 4,
        action: () => setRoomCount(roomCount >= 4 ? 3 : 4),
      });

      list.push({
        name: "Bedroom 5 Layout & Bed",
        position: "X = -6.35, Z = 0.6",
        room: "Bedroom 5",
        status: roomCount === 5 ? "Active" : "Omitted",
        isToggleable: true,
        active: roomCount === 5,
        action: () => setRoomCount(roomCount === 5 ? 4 : 5),
      });

      list.push({
        name: "Roof Solar Array Panels",
        position: "X = 3.0, Z = 0.5",
        room: "Roof Slab",
        status: hasSolar ? "Active" : "Omitted",
        isToggleable: true,
        active: hasSolar,
        action: () => setHasSolar(!hasSolar),
      });
    }


    return list;
  }, [houseStyle, interiorView, roomCount, hasPool, hasSolar, hasLounge, setHasPool, setHasLounge, setHasSolar, setRoomCount]);

  // Preset descriptions and pricing info
  const styleInfo = {
    "Aperture Terrace": {
      desc: "Custom procedural arches, horizontal teak panels, and concentric ring privacy screens",
      price: "Base $1.65M",
    },
    "Timberline Vista": {
      desc: "Stacked slate cladding blocks, organic climbing ivy foliage, and a vertical panoramic window glass column",
      price: "Base $2.10M",
    },
    "Minimalist Pavilion": {
      desc: "Monochromatic high-contrast stucco columns with angled roofs and an open double-height carport frame",
      price: "Base $1.45M",
    },
  };

  const exteriorDetails = {
    Concrete: { desc: "Industrial raw micro-cement panels", price: "Included" },
    "Cedar Wood": { desc: "Warm vertical sustainably-sourced slats", price: "+$45,000" },
    "White Stucco": { desc: "Minimalist fine-grain luxury plaster", price: "-$15,000" },
  };

  const flooringDetails = {
    "Polished Marble": { desc: "Bookmatched Carrara gold marble tile", price: "+$85,000" },
    "Dark Oak": { desc: "Wide-plank custom-charred organic oak", price: "+$35,000" },
  };

  return (
    <div className="w-full lg:w-[440px] h-full flex flex-col justify-between p-6 md:p-8 bg-[#0B0B0C]/80 border-t lg:border-t-0 lg:border-l border-neutral-800/80 backdrop-blur-xl relative z-10 select-none overflow-y-auto">
      {/* Upper Content */}
      <div className="space-y-6">
        {/* Header Branding */}
        <div>
          <div className="flex items-center gap-2 text-xs tracking-[0.25em] text-luxury-gold uppercase font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-luxury-gold" />
            Bespoke Architecture
          </div>
          <h1 className="font-display font-extrabold text-2xl text-neutral-100 tracking-tight leading-none mb-1.5 uppercase">
            Apex Configurator
          </h1>
          <p className="text-[10px] text-neutral-400 font-normal leading-relaxed uppercase tracking-wider">
            Signature Design Customizer
          </p>
        </div>

        {/* Day/Night Lighting Switch */}
        <div className="p-3 rounded-xl bg-neutral-900/40 border border-neutral-800/50 flex items-center justify-between">
          <div>
            <h3 className="text-[10px] font-bold tracking-wider text-neutral-200 uppercase mb-0.5">
              Atmosphere & Lights
            </h3>
            <p className="text-[9px] text-neutral-400 uppercase">
              {isNight ? "Twilight Horizon Glow" : "Crisp Midday Sun"}
            </p>
          </div>
          <div className="flex bg-neutral-950 p-1 rounded-lg border border-neutral-800/50">
            <button
              onClick={() => setIsNight(false)}
              className={`p-1.5 rounded-md transition-all duration-300 ${
                !isNight
                  ? "bg-neutral-800 text-luxury-gold glow-gold shadow-sm"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
              title="Day Mode"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsNight(true)}
              className={`p-1.5 rounded-md transition-all duration-300 ${
                isNight
                  ? "bg-neutral-800 text-luxury-gold glow-gold shadow-sm"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
              title="Night Mode"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Section 01 / Architectural Preset */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-end border-b border-neutral-800/80 pb-1.5">
            <h2 className="text-[10px] font-bold tracking-[0.15em] text-neutral-300 uppercase flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-luxury-gold" />
              01 / Signature Model Presets
            </h2>
            <span className="text-[9px] tracking-widest text-luxury-gold uppercase font-semibold">
              {styleInfo[houseStyle].price}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {[
              { id: "Aperture Terrace", label: "Aperture Terrace" },
              { id: "Timberline Vista", label: "Timberline Vista" },
              { id: "Minimalist Pavilion", label: "Minimalist Pavilion" },
            ].map((preset) => (
              <button
                key={preset.id}
                onClick={() => setHouseStyle(preset.id as HouseStyle)}
                className={`w-full py-2.5 px-4 rounded-xl border text-left transition-all duration-300 flex items-center justify-between ${
                  houseStyle === preset.id
                    ? "border-luxury-gold bg-luxury-gold/5 text-neutral-100"
                    : "border-neutral-800/60 bg-neutral-900/10 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-800/10"
                }`}
              >
                <span className="text-[10px] font-bold tracking-wider uppercase font-sans">
                  {preset.label}
                </span>
                <span className="text-[8px] text-neutral-500 italic uppercase">
                  {houseStyle === preset.id ? "Active Design" : "Select Preset"}
                </span>
              </button>
            ))}
          </div>
          <p className="text-[9px] text-neutral-400 italic leading-relaxed">
            {styleInfo[houseStyle].desc}
          </p>
        </div>

        {/* Section 02 / Sizing & Scale & Room Capacity */}
        <div className="space-y-3">
          <div className="flex justify-between items-end border-b border-neutral-800/80 pb-1.5">
            <h2 className="text-[10px] font-bold tracking-[0.15em] text-neutral-300 uppercase flex items-center gap-1.5">
              <Maximize className="w-3.5 h-3.5 text-luxury-gold" />
              02 / Scale & Layout Sizing
            </h2>
          </div>

          {/* Building Footprint */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[9px] font-semibold text-neutral-400 uppercase tracking-wider">
              <span>Footprint Area</span>
              <span className="text-luxury-gold font-bold">
                {footprint === 3500 ? "3,500 SQ FT (Base)" : footprint === 5800 ? "5,800 SQ FT (+$250k)" : "7,200 SQ FT (+$450k)"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { size: 3500, label: "3.5K SQFT" },
                { size: 5800, label: "5.8K SQFT" },
                { size: 7200, label: "7.2K SQFT" },
              ].map((item) => (
                <button
                  key={item.size}
                  onClick={() => setFootprint(item.size as FootprintSize)}
                  className={`py-1.5 rounded-lg border text-[9px] font-bold tracking-wider transition-all duration-300 uppercase ${
                    footprint === item.size
                      ? "border-luxury-gold bg-luxury-gold/5 text-luxury-gold"
                      : "border-neutral-800 bg-[#0B0B0C] text-neutral-500 hover:border-neutral-750"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bedrooms / Rooms Count Selector */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[9px] font-semibold text-neutral-400 uppercase tracking-wider">
              <span>Layout Capacity</span>
              <span className="text-luxury-gold font-bold">
                {roomCount === 3 ? "3 Bedrooms (Base)" : roomCount === 4 ? "4 Bedrooms (+$120k)" : "5 Bedrooms (+$240k)"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { size: 3, label: "3 Rooms" },
                { size: 4, label: "4 Rooms" },
                { size: 5, label: "5 Rooms" },
              ].map((item) => (
                <button
                  key={item.size}
                  onClick={() => setRoomCount(item.size as 3 | 4 | 5)}
                  className={`py-1.5 rounded-lg border text-[9px] font-bold tracking-wider transition-all duration-300 uppercase ${
                    roomCount === item.size
                      ? "border-luxury-gold bg-luxury-gold/5 text-luxury-gold"
                      : "border-neutral-800 bg-[#0B0B0C] text-neutral-500 hover:border-neutral-750"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Land Sizing */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[9px] font-semibold text-neutral-400 uppercase tracking-wider">
              <span>Land Plot Size</span>
              <span className="text-luxury-gold font-bold">
                {landSize === 0.5 ? "0.5 Acres (Base)" : landSize === 1.0 ? "1.0 Acres (+$180k)" : "2.0 Acres (+$350k)"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { size: 0.5, label: "0.5 ACRES" },
                { size: 1.0, label: "1.0 ACRES" },
                { size: 2.0, label: "2.0 ACRES" },
              ].map((item) => (
                <button
                  key={item.size}
                  onClick={() => setLandSize(item.size as LandSize)}
                  className={`py-1.5 rounded-lg border text-[9px] font-bold tracking-wider transition-all duration-300 uppercase ${
                    landSize === item.size
                      ? "border-luxury-gold bg-luxury-gold/5 text-luxury-gold"
                      : "border-neutral-800 bg-[#0B0B0C] text-neutral-500 hover:border-neutral-750"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 03 / Dynamic Floor X-Ray Plan Selector */}
        <div className="space-y-2">
          <div className="flex justify-between items-end border-b border-neutral-800/80 pb-1.5">
            <h2 className="text-[10px] font-bold tracking-[0.15em] text-neutral-300 uppercase">
              03 / Floor plan X-Ray
            </h2>
            <span className="text-[8px] tracking-widest text-luxury-gold uppercase font-bold">
              {interiorView === "exploded" ? "Separated 3D" : interiorView === "ground" ? "Ground Plan" : interiorView === "upper" ? "Upper Plan" : "Full Assembly"}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800/60">
            {[
              { id: "exterior", label: "Full" },
              { id: "ground", label: "Ground" },
              { id: "upper", label: "Upper" },
              { id: "exploded", label: "Explode" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setInteriorView(tab.id as any)}
                className={`py-1.5 rounded-lg text-[9px] font-bold tracking-wider transition-all duration-300 uppercase ${
                  interiorView === tab.id
                    ? "bg-luxury-gold/10 text-luxury-gold shadow-sm shadow-luxury-gold/5 border border-luxury-gold/20"
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section 3.5 / Interactive Asset Directory & Blueprint Details */}
        <div className="space-y-2">
          <div className="flex justify-between items-end border-b border-neutral-800/80 pb-1.5">
            <h2 className="text-[10px] font-bold tracking-[0.15em] text-neutral-300 uppercase flex items-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5 text-luxury-gold" />
              Blueprint Details & Asset Directory
            </h2>
            <span className="text-[8px] tracking-widest text-neutral-500 uppercase font-semibold">
              {blueprintAssets.length} Items Listed
            </span>
          </div>

          <div className="max-h-[220px] overflow-y-auto pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
            {blueprintAssets.map((asset, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-lg border text-left transition-all duration-300 flex items-center justify-between gap-3 ${
                  asset.isToggleable
                    ? asset.active
                      ? "border-luxury-gold/30 bg-luxury-gold/[0.02]"
                      : "border-neutral-900/60 bg-neutral-950/20 opacity-60 hover:opacity-90"
                    : "border-neutral-900/40 bg-neutral-900/10"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold text-neutral-300 truncate uppercase">
                      {asset.name}
                    </span>
                    <span className={`text-[7px] px-1 py-0.5 rounded uppercase font-semibold ${
                      asset.status === "Omitted"
                        ? "bg-neutral-850 text-neutral-500 border border-neutral-800"
                        : "bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/20"
                    }`}>
                      {asset.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[8px] text-neutral-500 uppercase font-medium">
                    <span className="text-luxury-gold/60">{asset.room}</span>
                    <span>•</span>
                    <span className="font-mono text-[7.5px]">{asset.position}</span>
                  </div>
                </div>

                {asset.isToggleable && asset.action && (
                  <button
                    onClick={asset.action}
                    className="p-1 rounded-md transition-colors hover:bg-neutral-800 text-luxury-gold/80 hover:text-luxury-gold shrink-0"
                    title={`Toggle ${asset.name}`}
                  >
                    {asset.active ? (
                      <ToggleRight className="w-5 h-5 text-luxury-gold" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-neutral-600" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 04 / Finishes */}
        <div className="space-y-4">
          {/* Walls */}
          <div className="space-y-2">
            <div className="flex justify-between items-end border-b border-neutral-800/80 pb-1.5">
              <h2 className="text-[10px] font-bold tracking-[0.15em] text-neutral-300 uppercase">
                04 / Exterior Finishes
              </h2>
              <span className="text-[9px] tracking-widest text-luxury-gold uppercase font-semibold">
                {exteriorDetails[exteriorWalls].price}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "Concrete", color: "bg-[#7F8285]", label: "Concrete" },
                { id: "Cedar Wood", color: "bg-[#9C6D42]", label: "Cedar Wood" },
                { id: "White Stucco", color: "bg-[#E8E7E3]", label: "Stucco" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setExteriorWalls(item.id as any)}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all duration-300 ${
                    exteriorWalls === item.id
                      ? "border-luxury-gold bg-luxury-gold/5"
                      : "border-neutral-800/60 bg-neutral-900/10 hover:border-neutral-700/80 hover:bg-neutral-800/20"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full ${item.color} shadow-inner border border-white/10`} />
                  <span className="text-[8px] font-bold tracking-wider text-neutral-300 uppercase">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Flooring */}
          <div className="space-y-2">
            <div className="flex justify-between items-end border-b border-neutral-800/80 pb-1.5">
              <h2 className="text-[10px] font-bold tracking-[0.15em] text-neutral-300 uppercase">
                05 / Flooring Foundation
              </h2>
              <span className="text-[9px] tracking-widest text-luxury-gold uppercase font-semibold">
                {flooringDetails[flooring].price}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "Polished Marble", color: "bg-[#F3F3F5]", label: "White Marble" },
                { id: "Dark Oak", color: "bg-[#2A1D13]", label: "Dark Oak" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFlooring(item.id as any)}
                  className={`p-2 rounded-xl border flex items-center justify-center gap-2 transition-all duration-300 ${
                    flooring === item.id
                      ? "border-luxury-gold bg-luxury-gold/5"
                      : "border-neutral-800/60 bg-neutral-900/10 hover:border-neutral-700/80 hover:bg-neutral-800/20"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-md ${item.color} shadow-inner border border-white/10`} />
                  <span className="text-[8px] font-bold tracking-wider text-neutral-300 uppercase">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 05 / Landscape eco add-ons */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-end border-b border-neutral-800/80 pb-1.5">
            <h2 className="text-[10px] font-bold tracking-[0.15em] text-neutral-300 uppercase">
              06 / Surrounding Add-ons & Eco
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "hasPool", label: "Reflecting Pool", premium: "+$115k", active: hasPool, toggle: () => setHasPool(!hasPool) },
              { key: "hasSolar", label: "Solar Array", premium: "+$48k", active: hasSolar, toggle: () => setHasSolar(!hasSolar) },
              { key: "hasLounge", label: "Firepit Lounge", premium: "+$65k", active: hasLounge, toggle: () => setHasLounge(!hasLounge) },
            ].map((item) => (
              <button
                key={item.key}
                onClick={item.toggle}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center gap-1 transition-all duration-300 ${
                  item.active
                    ? "border-luxury-gold bg-luxury-gold/5"
                    : "border-neutral-800/60 bg-neutral-900/10 hover:border-neutral-700/80 hover:bg-neutral-800/20"
                }`}
              >
                <span className={`text-[8px] font-bold tracking-wider uppercase ${item.active ? "text-luxury-gold" : "text-neutral-400"}`}>
                  {item.label}
                </span>
                <span className="text-[7px] text-neutral-500 italic font-semibold">
                  {item.premium}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Panel (Dynamic Cost & CTA) */}
      <div className="pt-4 border-t border-neutral-800/80 space-y-4 mt-4">
        <div className="flex justify-between items-center bg-neutral-900/30 p-2.5 rounded-xl border border-neutral-800/40">
          <div className="space-y-0.5">
            <span className="text-[8px] tracking-[0.2em] text-neutral-400 uppercase font-semibold">
              Estimated Build Cost
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-[10px] text-neutral-500 font-semibold uppercase">Est.</span>
              <AnimatedCounter value={totalCost} />
            </div>
          </div>
          <div className="flex flex-col items-end text-[8px] text-neutral-400 uppercase tracking-widest gap-0.5">
            <span className="flex items-center gap-1 font-bold text-luxury-gold">
              <Shield className="w-3 h-3 text-luxury-gold" />
              Locked Premium
            </span>
            <span>Incl. Architectural Fees</span>
          </div>
        </div>

        {/* Save Configuration Trigger */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={onOpenSaveModal}
          className="w-full py-3 px-6 bg-gradient-to-r from-luxury-gold to-luxury-bronze hover:from-luxury-goldHover hover:to-luxury-bronze text-[#0B0B0C] font-display font-extrabold text-[10px] tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 transition-colors uppercase shadow-lg shadow-luxury-gold/5"
        >
          Secure Blueprint Config
          <ArrowRight className="w-3.5 h-3.5 text-[#0B0B0C]" />
        </motion.button>
      </div>
    </div>
  );
}
