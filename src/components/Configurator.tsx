"use client";

import { useState, useMemo } from "react";
import ThreeCanvas from "./ThreeCanvas";
import Sidebar from "./Sidebar";
import LeadModal from "./LeadModal";
import { Compass, Square, Layers, Sparkles } from "lucide-react";

export type HouseStyle = "Aperture Terrace" | "Timberline Vista" | "Minimalist Pavilion";
export type FootprintSize = 3500 | 5800 | 7200;
export type LandSize = 0.5 | 1.0 | 2.0;

export default function Configurator() {
  const [houseStyle, setHouseStyle] = useState<HouseStyle>("Aperture Terrace");
  const [footprint, setFootprint] = useState<FootprintSize>(3500);
  const [landSize, setLandSize] = useState<LandSize>(0.5);
  const [exteriorWalls, setExteriorWalls] = useState<"Concrete" | "Cedar Wood" | "White Stucco">("Concrete");
  const [flooring, setFlooring] = useState<"Polished Marble" | "Dark Oak">("Polished Marble");
  const [isNight, setIsNight] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New state variables for advanced customized additions
  const [roomCount, setRoomCount] = useState<3 | 4 | 5>(3);
  const [hasPool, setHasPool] = useState(true);
  const [hasSolar, setHasSolar] = useState(false);
  const [hasLounge, setHasLounge] = useState(false);
  const [interiorView, setInteriorView] = useState<"exterior" | "ground" | "upper" | "exploded">("exterior");

  // Core pricing calculations
  const totalCost = useMemo(() => {
    const basePrices = {
      "Aperture Terrace": 1650000,
      "Timberline Vista": 2100000,
      "Minimalist Pavilion": 1450000,
    };

    const footprintPremiums = {
      3500: 0,
      5800: 250000,
      7200: 450000,
    };

    const landPremiums = {
      0.5: 0,
      1.0: 180000,
      2.0: 350000,
    };

    const exteriorPremium = {
      Concrete: 0,
      "Cedar Wood": 45000,
      "White Stucco": -15000,
    };
    
    const flooringPremium = {
      "Polished Marble": 85000,
      "Dark Oak": 35000,
    };

    const roomPremium = (roomCount - 3) * 120000;
    const poolPremium = hasPool ? 115000 : 0;
    const solarPremium = hasSolar ? 48000 : 0;
    const loungePremium = hasLounge ? 65000 : 0;

    return (
      basePrices[houseStyle] +
      footprintPremiums[footprint] +
      landPremiums[landSize] +
      exteriorPremium[exteriorWalls] +
      flooringPremium[flooring] +
      roomPremium +
      poolPremium +
      solarPremium +
      loungePremium
    );
  }, [houseStyle, footprint, landSize, exteriorWalls, flooring, roomCount, hasPool, hasSolar, hasLounge]);

  return (
    <main className="w-screen h-screen flex flex-col lg:flex-row bg-[#0B0B0C] overflow-hidden font-sans select-none relative">
      {/* 3D CANVAS VIEWPORT (LEFT) */}
      <div className="flex-1 h-[55vh] lg:h-full relative overflow-hidden">
        {/* Top Header Overlay Branding */}
        <div className="absolute top-6 left-6 z-20 pointer-events-none">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-luxury-gold glow-gold animate-pulse" />
            <span className="text-[9px] font-bold tracking-[0.3em] text-neutral-400 uppercase">
              APEX DESIGN LABS
            </span>
          </div>
          <h2 className="font-display font-extrabold text-lg text-neutral-100 uppercase tracking-widest leading-none">
            SPEC-01 / {houseStyle === "Aperture Terrace" ? "APERTURE TERRACE" : houseStyle === "Timberline Vista" ? "TIMBERLINE VISTA" : "MINIMALIST PAVILION"}
          </h2>
        </div>

        {/* Floating Architectural Specifications Panel */}
        <div className="absolute top-6 right-6 z-20 hidden md:flex flex-col gap-2.5 pointer-events-none max-w-xs">
          <div className="glass-panel p-4 rounded-xl flex flex-col gap-3">
            <span className="text-[9px] font-bold tracking-[0.2em] text-neutral-400 uppercase border-b border-neutral-800/80 pb-1.5">
              Structural Overview
            </span>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[10px] uppercase font-semibold">
              <div className="flex items-center gap-1.5 text-neutral-400">
                <Square className="w-3.5 h-3.5 text-luxury-gold" />
                Footprint
              </div>
              <div className="text-right text-neutral-200">{footprint.toLocaleString()} SQ FT</div>
              
              <div className="flex items-center gap-1.5 text-neutral-400">
                <Layers className="w-3.5 h-3.5 text-luxury-gold" />
                Structure
              </div>
              <div className="text-right text-neutral-200">
                {houseStyle === "Minimalist Pavilion" ? "1 Level" : "2 Levels"}
              </div>

              <div className="flex items-center gap-1.5 text-neutral-400">
                <Compass className="w-3.5 h-3.5 text-luxury-gold" />
                Domain Site
              </div>
              <div className="text-right text-neutral-200">{landSize} ACRES</div>
            </div>
          </div>
        </div>

        {/* Signature Watermark Badge (Bottom Right Overlay) */}
        <div className="absolute bottom-6 right-6 z-20 hidden md:flex items-center gap-2 pointer-events-none glass-panel px-4 py-2 rounded-xl text-[9px] font-bold tracking-widest text-neutral-400 uppercase select-none">
          <Sparkles className="w-3 h-3 text-luxury-gold" />
          {houseStyle.toUpperCase()} EDITION
        </div>

        {/* 3D WebGL Canvas */}
        <ThreeCanvas 
          exteriorWalls={exteriorWalls} 
          flooring={flooring} 
          isNight={isNight} 
          houseStyle={houseStyle}
          footprint={footprint}
          landSize={landSize}
          roomCount={roomCount}
          hasPool={hasPool}
          hasSolar={hasSolar}
          hasLounge={hasLounge}
          interiorView={interiorView}
        />
      </div>

      {/* DUAL PANEL CUSTOMIZATION SIDEBAR (RIGHT) */}
      <Sidebar
        houseStyle={houseStyle}
        setHouseStyle={setHouseStyle}
        footprint={footprint}
        setFootprint={setFootprint}
        landSize={landSize}
        setLandSize={setLandSize}
        exteriorWalls={exteriorWalls}
        setExteriorWalls={setExteriorWalls}
        flooring={flooring}
        setFlooring={setFlooring}
        isNight={isNight}
        setIsNight={setIsNight}
        totalCost={totalCost}
        onOpenSaveModal={() => setIsModalOpen(true)}
        roomCount={roomCount}
        setRoomCount={setRoomCount}
        hasPool={hasPool}
        setHasPool={setHasPool}
        hasSolar={hasSolar}
        setHasSolar={setHasSolar}
        hasLounge={hasLounge}
        setHasLounge={setHasLounge}
        interiorView={interiorView}
        setInteriorView={setInteriorView}
      />

      {/* LEAD INTAKE MULTI-STEP MODAL */}
      <LeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        configuration={{
          houseStyle,
          footprint,
          landSize,
          exteriorWalls,
          flooring,
          totalCost,
          roomCount,
          hasPool,
          hasSolar,
          hasLounge,
        }}
      />
    </main>
  );
}
