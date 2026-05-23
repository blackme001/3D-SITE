"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { HouseStyle, FootprintSize, LandSize } from "./Configurator";

interface HouseModelProps {
  exteriorWalls: "Concrete" | "Cedar Wood" | "White Stucco";
  flooring: "Polished Marble" | "Dark Oak";
  isNight: boolean;
  houseStyle: HouseStyle;
  footprint: FootprintSize;
  landSize: LandSize;
  roomCount: 3 | 4 | 5;
  hasPool: boolean;
  hasSolar: boolean;
  hasLounge: boolean;
  interiorView: "exterior" | "ground" | "upper" | "exploded";
}

/* ══════════════════════════════════════════════════════
   SHARED ARCHITECTURAL PRIMITIVE COMPONENTS
   ══════════════════════════════════════════════════════ */

/** Punched window: dark steel frame + tinted glass pane */
function WindowBox({
  p, w = 1.1, h = 1.0, isNight, rotation = [0, 0, 0],
}: { p: [number, number, number]; w?: number; h?: number; isNight: boolean; rotation?: [number, number, number] }) {
  const frameThickness = 0.06;
  const frameDepth = 0.08;
  return (
    <group position={p} rotation={rotation}>
      {/* Left frame bar */}
      <mesh position={[-w / 2 + frameThickness / 2, 0, 0]}>
        <boxGeometry args={[frameThickness, h, frameDepth]} />
        <meshStandardMaterial color="#1A1A1E" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Right frame bar */}
      <mesh position={[w / 2 - frameThickness / 2, 0, 0]}>
        <boxGeometry args={[frameThickness, h, frameDepth]} />
        <meshStandardMaterial color="#1A1A1E" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Top frame bar */}
      <mesh position={[0, h / 2 - frameThickness / 2, 0]}>
        <boxGeometry args={[w, frameThickness, frameDepth]} />
        <meshStandardMaterial color="#1A1A1E" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Bottom frame bar */}
      <mesh position={[0, -h / 2 + frameThickness / 2, 0]}>
        <boxGeometry args={[w, frameThickness, frameDepth]} />
        <meshStandardMaterial color="#1A1A1E" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Tinted see-through glass pane */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[w - frameThickness * 2, h - frameThickness * 2, 0.02]} />
        <meshStandardMaterial
          color="#D5EEFF"
          transparent
          opacity={isNight ? 0.25 : 0.4}
          roughness={0.05}
          metalness={0.95}
        />
      </mesh>
      {/* Micro-realistic bronze handle */}
      <mesh position={[w / 2 - 0.14, 0, 0.02]}>
        <boxGeometry args={[0.02, 0.15, 0.02]} />
        <meshStandardMaterial color="#C5A880" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

/** Front entry door: dark aluminium slab with frosted transom and gold lever */
function EntryDoor({ p, isNight }: { p: [number, number, number]; isNight: boolean }) {
  return (
    <group position={p}>
      {/* Left jamb */}
      <mesh position={[-0.57, 1.05, 0]}>
        <boxGeometry args={[0.1, 2.1, 0.12]} />
        <meshStandardMaterial color="#0D0D0F" roughness={0.5} />
      </mesh>
      {/* Right jamb */}
      <mesh position={[0.57, 1.05, 0]}>
        <boxGeometry args={[0.1, 2.1, 0.12]} />
        <meshStandardMaterial color="#0D0D0F" roughness={0.5} />
      </mesh>
      {/* Head jamb */}
      <mesh position={[0, 2.12, 0]}>
        <boxGeometry args={[1.14, 0.12, 0.12]} />
        <meshStandardMaterial color="#0D0D0F" roughness={0.5} />
      </mesh>
      {/* Door slab */}
      <mesh position={[0, 0.95, 0.01]}>
        <boxGeometry args={[1.02, 1.9, 0.08]} />
        <meshStandardMaterial color="#1B1B1E" roughness={0.55} metalness={0.2} />
      </mesh>
      {/* Frosted transom glass */}
      <mesh position={[0, 1.82, 0.025]}>
        <boxGeometry args={[0.82, 0.46, 0.04]} />
        <meshStandardMaterial
          color="#1E3D4E"
          transparent
          opacity={isNight ? 0.35 : 0.52}
          roughness={0.04}
          metalness={0.88}
        />
      </mesh>
      {/* Gold lever handle */}
      <mesh position={[0.35, 0.88, 0.09]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.022, 0.022, 0.18, 8]} />
        <meshStandardMaterial color="#C5A880" metalness={0.82} roughness={0.16} />
      </mesh>
    </group>
  );
}

/** Interior door: narrower, lighter for room partitions */
function InteriorDoor({ p, rotation = [0, 0, 0] }: { p: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={p} rotation={rotation}>
      <mesh position={[-0.46, 0.95, 0]}>
        <boxGeometry args={[0.08, 1.9, 0.1]} />
        <meshStandardMaterial color="#CCCCCC" roughness={0.6} />
      </mesh>
      <mesh position={[0.46, 0.95, 0]}>
        <boxGeometry args={[0.08, 1.9, 0.1]} />
        <meshStandardMaterial color="#CCCCCC" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.89, 0]}>
        <boxGeometry args={[0.92, 0.1, 0.1]} />
        <meshStandardMaterial color="#CCCCCC" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.95, 0.01]}>
        <boxGeometry args={[0.84, 1.88, 0.06]} />
        <meshStandardMaterial color="#E8E8EA" roughness={0.7} />
      </mesh>
    </group>
  );
}

/** Central staircase: stepped boxes with gold handrails */
function Staircase({ p, flooringColor }: { p: [number, number, number]; flooringColor: string }) {
  const steps = 12;
  const sh = 0.238; // step height
  const sd = 0.24;  // step depth
  return (
    <group position={p}>
      {Array.from({ length: steps }).map((_, i) => (
        <mesh key={i} castShadow receiveShadow position={[0, i * sh + sh / 2, i * sd]}>
          <boxGeometry args={[1.75, sh, sd + 0.01]} />
          <meshStandardMaterial color={flooringColor} roughness={0.72} />
        </mesh>
      ))}
      {/* Left stringer */}
      <mesh position={[-0.93, steps * sh * 0.5, steps * sd * 0.45]}>
        <boxGeometry args={[0.04, steps * sh, steps * sd]} />
        <meshStandardMaterial color="#191919" roughness={0.6} />
      </mesh>
      {/* Right stringer */}
      <mesh position={[0.93, steps * sh * 0.5, steps * sd * 0.45]}>
        <boxGeometry args={[0.04, steps * sh, steps * sd]} />
        <meshStandardMaterial color="#191919" roughness={0.6} />
      </mesh>
      {/* Left handrail */}
      <mesh position={[-0.93, steps * sh + 0.05, steps * sd * 0.45]}>
        <boxGeometry args={[0.04, 0.04, steps * sd + 0.12]} />
        <meshStandardMaterial color="#C5A880" metalness={0.72} roughness={0.18} />
      </mesh>
      {/* Right handrail */}
      <mesh position={[0.93, steps * sh + 0.05, steps * sd * 0.45]}>
        <boxGeometry args={[0.04, 0.04, steps * sd + 0.12]} />
        <meshStandardMaterial color="#C5A880" metalness={0.72} roughness={0.18} />
      </mesh>
      {/* Balusters */}
      {Array.from({ length: 7 }).map((_, i) => (
        <group key={i}>
          <mesh position={[-0.93, i * sh * 1.7 + 0.12, i * sd * 1.7]}>
            <boxGeometry args={[0.025, sh * 1.7, 0.025]} />
            <meshStandardMaterial color="#1A1A1C" />
          </mesh>
          <mesh position={[0.93, i * sh * 1.7 + 0.12, i * sd * 1.7]}>
            <boxGeometry args={[0.025, sh * 1.7, 0.025]} />
            <meshStandardMaterial color="#1A1A1C" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Low-poly bathroom: toilet + sink for ground/upper bathrooms */
function BathroomCell({ p }: { p: [number, number, number] }) {
  return (
    <group position={p}>
      {/* Toilet bowl */}
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.18, 0.2, 0.36, 10]} />
        <meshStandardMaterial color="#ECEEF0" roughness={0.5} />
      </mesh>
      {/* Cistern */}
      <mesh position={[0, 0.47, -0.2]}>
        <boxGeometry args={[0.34, 0.28, 0.16]} />
        <meshStandardMaterial color="#ECEEF0" roughness={0.5} />
      </mesh>
      {/* Sink counter */}
      <mesh position={[-0.62, 0.35, 0]}>
        <boxGeometry args={[0.5, 0.07, 0.38]} />
        <meshStandardMaterial color="#F2F4F6" roughness={0.28} metalness={0.12} />
      </mesh>
      {/* Sink basin */}
      <mesh position={[-0.62, 0.37, 0]}>
        <cylinderGeometry args={[0.13, 0.11, 0.06, 8]} />
        <meshStandardMaterial color="#D8DADC" roughness={0.2} metalness={0.15} />
      </mesh>
      {/* Tap */}
      <mesh position={[-0.62, 0.44, -0.12]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.12, 6]} />
        <meshStandardMaterial color="#B0B2B5" metalness={0.7} roughness={0.25} />
      </mesh>
    </group>
  );
}

/** Luxury modern ceiling pendant light with gold accents and glowing night sphere */
function CeilingLight({ p, isNight }: { p: [number, number, number]; isNight: boolean }) {
  return (
    <group position={p}>
      {/* Gold ceiling mounting plate */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.02, 8]} />
        <meshStandardMaterial color="#C5A880" metalness={0.85} roughness={0.15} />
      </mesh>
      {/* Thin black hanging cord */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.4, 6]} />
        <meshStandardMaterial color="#111113" roughness={0.5} />
      </mesh>
      {/* Glass sphere emitting warm light */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial
          color={isNight ? "#FFF3D6" : "#EAEAEA"}
          emissive={isNight ? "#FFA834" : "#000000"}
          emissiveIntensity={isNight ? 2.5 : 0}
          roughness={0.1}
        />
      </mesh>
      {/* Gold accent metal ring */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.12, 0.015, 6, 16]} />
        <meshStandardMaterial color="#C5A880" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Interactive PointLight for cozy night rendering */}
      {isNight && (
        <pointLight
          position={[0, -0.15, 0]}
          color="#FF9E4A"
          intensity={2.8}
          distance={6.0}
          decay={1.6}
          castShadow
          shadow-bias={-0.002}
        />
      )}
    </group>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN HOUSE MODEL
   ══════════════════════════════════════════════════════ */

export default function HouseModel({
  exteriorWalls, flooring, isNight, houseStyle, footprint, landSize,
  roomCount, hasPool, hasSolar, hasLounge, interiorView,
}: HouseModelProps) {
  const houseGroup = useRef<THREE.Group>(null);
  const upperFloorGroup = useRef<THREE.Group>(null);
  const roofGroup = useRef<THREE.Group>(null);
  const explodedOffsetRef = useRef(0);

  useFrame((state, delta) => {
    // Subtle ambient breathing rotation — base at 0 so front facade faces the camera
    if (houseGroup.current) {
      houseGroup.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.08) * 0.02;
    }
    // Smooth physics-damp explosion
    const targetOffset = interiorView === "exploded" ? 4.8 : 0;
    explodedOffsetRef.current = THREE.MathUtils.damp(explodedOffsetRef.current, targetOffset, 4.2, delta);
    if (upperFloorGroup.current) upperFloorGroup.current.position.y = explodedOffsetRef.current;
    if (roofGroup.current) roofGroup.current.position.y = explodedOffsetRef.current * 1.8;
  });

  // ── Base material configs ──
  const concreteColor  = new THREE.Color("#5C5D60");
  const stuccoColor    = new THREE.Color("#F3F2EE");
  const cedarColor     = new THREE.Color("#95663B");
  const marbleColor    = new THREE.Color("#F9F9FB");
  const darkOakColor   = new THREE.Color("#21160D");
  const metalColor     = new THREE.Color("#1A1A1C");
  const charcoalColor  = new THREE.Color("#18181A");

  const wallMaterialConfig = {
    color: exteriorWalls === "Concrete" ? concreteColor
      : exteriorWalls === "White Stucco" ? stuccoColor
      : cedarColor,
    roughness: exteriorWalls === "Concrete" ? 0.75 : exteriorWalls === "White Stucco" ? 0.9 : 0.55,
    metalness: exteriorWalls === "Concrete" ? 0.15 : 0.05,
  };

  const floorMaterialConfig = {
    color: flooring === "Polished Marble" ? marbleColor : darkOakColor,
    roughness: flooring === "Polished Marble" ? 0.08 : 0.75,
    metalness: flooring === "Polished Marble" ? 0.25 : 0.05,
  };

  const flooringColor = flooring === "Polished Marble" ? "#F5F5F7" : "#2A1D13";

  const structureScale = footprint === 3500 ? 1.0 : footprint === 5800 ? 1.15 : 1.28;
  const landScale      = landSize === 0.5 ? 1.0 : landSize === 1.0 ? 1.22 : 1.4;

  const showGroundFloor = interiorView !== "upper";
  const showUpperFloor  = interiorView !== "ground";
  const showRoof        = interiorView === "exterior" || interiorView === "exploded";

  const doorX = houseStyle === "Minimalist Pavilion" ? -3.5 : 0;
  const pathwayX = houseStyle === "Minimalist Pavilion" ? -3.5 : 0;

  return (
    <group ref={houseGroup}>

      {/* ══════════════════════════════════════════════════════
          1. SITE PLATFORM, LANDSCAPING & APPROACH PATHWAY
          ══════════════════════════════════════════════════════ */}
      <group scale={[landScale, 1, landScale]} position={[0, -1, 0]}>
        {/* Base ground plane */}
        <mesh receiveShadow position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[26, 26]} />
          <meshStandardMaterial color="#0E0E0F" roughness={0.95} />
        </mesh>
        {/* Elevated foundation platform */}
        <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
          <boxGeometry args={[18, 0.2, 14]} />
          <meshStandardMaterial color="#161618" roughness={0.85} />
        </mesh>
        {/* Gravel border */}
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[19.2, 15.2]} />
          <meshStandardMaterial color="#060607" roughness={0.99} />
        </mesh>

        {/* ── FRONT ENTRANCE PATHWAY (facing camera direction +Z, dynamically offset to align with door) ── */}
        <mesh receiveShadow position={[pathwayX, 0.115, 6.6]}>
          <boxGeometry args={[3.0, 0.03, 5.2]} />
          <meshStandardMaterial color="#1C1C1E" roughness={0.88} />
        </mesh>
        {/* Gold pathway edge strips */}
        {([-1.55, 1.55] as number[]).map((x, i) => (
          <mesh key={i} receiveShadow position={[pathwayX + x, 0.13, 6.6]}>
            <boxGeometry args={[0.05, 0.03, 5.2]} />
            <meshStandardMaterial color="#C5A880" metalness={0.55} roughness={0.38} />
          </mesh>
        ))}
        {/* Pathway lantern posts */}
        {([-1.25, 1.25] as number[]).map((x, i) => (
          <group key={i} position={[pathwayX + x, 0.12, 8.4]}>
            <mesh><cylinderGeometry args={[0.042, 0.05, 0.85, 8]} /><meshStandardMaterial color="#1A1A1C" metalness={0.55} /></mesh>
            <mesh position={[0, 0.52, 0]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial
                color={isNight ? "#FFD580" : "#444448"}
                emissive={isNight ? "#FF9A30" : "#000000"}
                emissiveIntensity={isNight ? 1.5 : 0}
              />
            </mesh>
            {isNight && <pointLight position={[0, 0.52, 0]} color="#FFA030" intensity={0.9} distance={3.5} decay={1.8} />}
          </group>
        ))}

        {/* ── REFLECTING POOL ── */}
        {hasPool && (
          <group position={[1.5, 0.15, 6.2]}>
            <mesh receiveShadow position={[-5.3, 0, 0]}><boxGeometry args={[3.4, 0.1, 3.4]} /><meshStandardMaterial color="#5E432E" roughness={0.8} /></mesh>
            <mesh receiveShadow position={[1.8, -0.1, 0]}><boxGeometry args={[9.4, 0.25, 3.4]} /><meshStandardMaterial color="#0C1416" roughness={0.7} /></mesh>
            <mesh position={[1.8, 0.03, 0]}>
              <boxGeometry args={[9.2, 0.02, 3.2]} />
              <meshStandardMaterial color="#1E4450" transparent opacity={isNight ? 0.65 : 0.78} roughness={0.02} metalness={0.9} />
            </mesh>
            {isNight && (
              <group>
                <pointLight position={[-1.0, -0.05, 0]} color="#38D7FF" intensity={2.2} distance={5} decay={1.5} />
                <pointLight position={[4.0, -0.05, 0]} color="#38D7FF" intensity={2.2} distance={5} decay={1.5} />
              </group>
            )}
          </group>
        )}

        {/* ── FIREPIT LOUNGE ── */}
        {hasLounge && (
          <group position={[-6.8, 0.15, 3.8]}>
            <mesh receiveShadow><boxGeometry args={[3.2, 0.1, 3.2]} /><meshStandardMaterial color="#242426" roughness={0.8} /></mesh>
            <mesh position={[0, 0.15, 0]}><cylinderGeometry args={[0.4, 0.45, 0.25, 12]} /><meshStandardMaterial color="#111" roughness={0.6} /></mesh>
            <mesh position={[0, 0.22, 0]}><sphereGeometry args={[0.3, 12, 12]} /><meshBasicMaterial color={isNight ? "#FF621E" : "#8A3B18"} /></mesh>
            {isNight && <pointLight position={[0, 0.4, 0]} color="#FF7A30" intensity={3.5} distance={6} decay={1.5} castShadow />}
          </group>
        )}
      </group>

      {/* ══════════════════════════════════════════════════════
          2. HOUSE STRUCTURE — FRONT FACADE FACES +Z (CAMERA)
             No static rotation applied. Animation at base 0.
          ══════════════════════════════════════════════════════ */}
      <group scale={[structureScale, 1, structureScale]} position={[0, -1, 0]}>

        {/* ─────────────────────────────────────────
            GROUND FLOOR
            ───────────────────────────────────────── */}
        {showGroundFloor && (
          <group>
            {/* Ground slab */}
            <mesh castShadow receiveShadow position={[0, 0.25, 0]}>
              <boxGeometry args={[14, 0.1, 8]} />
              <meshStandardMaterial {...floorMaterialConfig} />
            </mesh>

            {/* Flooring accent lines */}
            {flooring === "Dark Oak" ? (
              <group position={[0, 0.31, 0]}>
                {[-2.5, -0.8, 0.8, 2.5].map((z, idx) => (
                  <mesh key={idx} position={[0, 0, z]}><boxGeometry args={[13.8, 0.005, 0.02]} /><meshBasicMaterial color="#150E09" /></mesh>
                ))}
              </group>
            ) : (
              <group position={[0, 0.31, 0]}>
                {[-4, -2, 0, 2, 4].map((x, idx) => (
                  <mesh key={idx} position={[x, 0, 0]}><boxGeometry args={[0.01, 0.005, 7.8]} /><meshBasicMaterial color="#EAEAEA" opacity={0.4} transparent /></mesh>
                ))}
              </group>
            )}

            {/* ── INTERIOR PARTITIONS — Ground Floor ── */}
            {/* Living / Dining divider */}
            <mesh castShadow position={[1.82, 1.55, 1.2]}>
              <boxGeometry args={[0.1, 2.4, 3.4]} />
              <meshStandardMaterial color="#DEDEDE" roughness={0.9} />
            </mesh>
            {/* Dining / Kitchen divider */}
            <mesh castShadow position={[-2.12, 1.55, 1.2]}>
              <boxGeometry args={[0.1, 2.4, 3.4]} />
              <meshStandardMaterial color="#DEDEDE" roughness={0.9} />
            </mesh>
            {/* Bathroom rear wall */}
            <mesh castShadow position={[-4.5, 1.55, -2.0]}>
              <boxGeometry args={[2.1, 2.4, 0.1]} />
              <meshStandardMaterial color="#DEDEDE" roughness={0.9} />
            </mesh>
            {/* Bathroom side wall */}
            <mesh castShadow position={[-5.52, 1.55, -3.0]}>
              <boxGeometry args={[0.1, 2.4, 2.2]} />
              <meshStandardMaterial color="#DEDEDE" roughness={0.9} />
            </mesh>
            {/* Bathroom door opening marker */}
            <InteriorDoor p={[-4.5, 0.3, -2.0]} />

            {/* ── INTERIOR LAYOUT: LIVING ROOM (Right Wing) ── */}
            <group position={[3.5, 0.4, 1.2]}>
              {/* Main sofa */}
              <mesh castShadow><boxGeometry args={[2.8, 0.4, 0.8]} /><meshStandardMaterial color="#6B6D72" roughness={0.8} /></mesh>
              {/* L-arm sofa */}
              <mesh castShadow position={[-1.0, 0, -0.8]}><boxGeometry args={[0.8, 0.4, 0.8]} /><meshStandardMaterial color="#6B6D72" roughness={0.8} /></mesh>
              {/* TV console */}
              <mesh castShadow position={[0, -0.1, 1.5]}><boxGeometry args={[2.5, 0.2, 0.4]} /><meshStandardMaterial color="#1B1B1D" roughness={0.6} /></mesh>
              {/* TV screen */}
              <mesh castShadow position={[0, 0.6, 1.55]}><boxGeometry args={[2.0, 1.0, 0.08]} /><meshStandardMaterial color="#0A0A0C" roughness={0.2} metalness={0.9} /></mesh>
              {/* Coffee table */}
              <mesh castShadow position={[0.2, -0.1, 0]}><boxGeometry args={[1.0, 0.08, 0.6]} /><meshStandardMaterial color="#1E1A14" roughness={0.65} /></mesh>
            </group>

            {/* ── INTERIOR LAYOUT: DINING (Center) ── */}
            <group position={[-0.8, 0.4, -1.0]}>
              <mesh castShadow position={[0, 0.1, 0]}><boxGeometry args={[2.2, 0.1, 1.1]} /><meshStandardMaterial color="#362312" roughness={0.7} /></mesh>
              <mesh position={[-0.9, -0.15, 0]}><cylinderGeometry args={[0.06, 0.06, 0.4, 8]} /><meshStandardMaterial color="#151517" /></mesh>
              <mesh position={[0.9, -0.15, 0]}><cylinderGeometry args={[0.06, 0.06, 0.4, 8]} /><meshStandardMaterial color="#151517" /></mesh>
              {[-0.8, 0, 0.8].map((x, i) => (
                <group key={i}>
                  <mesh castShadow position={[x, -0.1, 0.75]}><boxGeometry args={[0.35, 0.35, 0.35]} /><meshStandardMaterial color="#1E1E20" roughness={0.9} /></mesh>
                  <mesh castShadow position={[x, -0.1, -0.75]}><boxGeometry args={[0.35, 0.35, 0.35]} /><meshStandardMaterial color="#1E1E20" roughness={0.9} /></mesh>
                </group>
              ))}
              {/* Pendant light over table */}
              <mesh position={[0, 1.8, 0]}><cylinderGeometry args={[0.25, 0.18, 0.18, 10]} /><meshStandardMaterial color="#1A1A1C" roughness={0.3} metalness={0.6} /></mesh>
            </group>

            {/* ── INTERIOR LAYOUT: KITCHEN (Left Wing) ── */}
            <group position={[-4.5, 0.4, 1.2]}>
              <mesh castShadow position={[0, 0.1, 0]}><boxGeometry args={[2.8, 0.5, 0.75]} /><meshStandardMaterial color="#262728" roughness={0.4} /></mesh>
              <mesh castShadow position={[-1.0, 0.1, -0.85]}><boxGeometry args={[0.8, 0.5, 1.0]} /><meshStandardMaterial color="#262728" roughness={0.4} /></mesh>
              {/* Refrigerator */}
              <mesh castShadow position={[1.0, 0.7, -0.1]}><boxGeometry args={[0.7, 1.6, 0.7]} /><meshStandardMaterial color="#9EA0A4" metalness={0.7} roughness={0.3} /></mesh>
              {/* Counter backsplash */}
              <mesh position={[0, 0.6, -0.82]}><boxGeometry args={[2.8, 0.6, 0.04]} /><meshStandardMaterial color="#383A3C" roughness={0.5} /></mesh>
            </group>

            {/* ── GROUND FLOOR BATHROOM (rear left) ── */}
            <BathroomCell p={[-4.8, 0.4, -2.7]} />

            {/* ── CENTRAL STAIRCASE (reoriented to rise from the side) ── */}
            <group position={[-3.5, 0.3, -2.5]} rotation={[0, Math.PI / 2, 0]}>
              <Staircase p={[0, 0, 0]} flooringColor={flooringColor} />
            </group>

            {/* Ground Room Ceiling Lights */}
            <CeilingLight p={[3.5, 2.3, 1.2]} isNight={isNight} />
            <CeilingLight p={[-4.5, 2.3, 1.2]} isNight={isNight} />
            <CeilingLight p={[-4.8, 2.3, -2.7]} isNight={isNight} />

            {/* ── ENTRY DOOR — Front Facade Center (dynamically positioned based on style) ── */}
            <EntryDoor p={[doorX, 0.3, 3.93]} isNight={isNight} />

            {/* ── WINDOWS — Front Facade (next to entry door) ── */}
            {houseStyle !== "Minimalist Pavilion" ? (
              <>
                <WindowBox p={[-3.0, 1.65, 3.97]} w={1.12} h={1.02} isNight={isNight} />
                <WindowBox p={[3.0, 1.65, 3.97]} w={1.12} h={1.02} isNight={isNight} />
              </>
            ) : (
              <>
                <WindowBox p={[-1.0, 1.65, 3.97]} w={1.12} h={1.02} isNight={isNight} />
                <WindowBox p={[-6.0, 1.65, 3.97]} w={1.12} h={1.02} isNight={isNight} />
              </>
            )}

            {/* ── WINDOWS — Rear Wall (Ground) ── */}
            {([-3.5, 0, 3.5] as number[]).map((x, i) => (
              <WindowBox key={i} p={[x, 1.65, -3.97]} w={1.12} h={1.02} isNight={isNight} />
            ))}
            {/* ── WINDOWS — Left Side Wall (Ground) ── */}
            <WindowBox p={[-7.05, 1.65, -1.3]} w={1.12} h={1.02} isNight={isNight} />
            <WindowBox p={[-7.05, 1.65, 1.5]} w={1.12} h={1.02} isNight={isNight} />

            {/* ── STYLE-SPECIFIC GROUND FLOOR EXTERIOR ── */}
            {houseStyle === "Aperture Terrace" && (
              <group>
                {/* Split left wall to leave gaps for side windows */}
                <mesh castShadow receiveShadow position={[-6.85, 1.6, -3.0]}><boxGeometry args={[0.3, 2.7, 2.0]} /><meshStandardMaterial color="#1C1C1E" roughness={0.7} /></mesh>
                <mesh castShadow receiveShadow position={[-6.85, 1.6, 0.1]}><boxGeometry args={[0.3, 2.7, 1.4]} /><meshStandardMaterial color="#1C1C1E" roughness={0.7} /></mesh>
                <mesh castShadow receiveShadow position={[-6.85, 1.6, 3.1]}><boxGeometry args={[0.3, 2.7, 1.8]} /><meshStandardMaterial color="#1C1C1E" roughness={0.7} /></mesh>
                {/* Split rear wall to leave gaps for windows */}
                <mesh castShadow receiveShadow position={[-5.25, 1.6, -3.9]}><boxGeometry args={[2.1, 2.7, 0.2]} /><meshStandardMaterial color="#E1DFDA" roughness={0.8} /></mesh>
                <mesh castShadow receiveShadow position={[-1.75, 1.6, -3.9]}><boxGeometry args={[2.1, 2.7, 0.2]} /><meshStandardMaterial color="#E1DFDA" roughness={0.8} /></mesh>
                <mesh castShadow receiveShadow position={[1.75, 1.6, -3.9]}><boxGeometry args={[2.1, 2.7, 0.2]} /><meshStandardMaterial color="#E1DFDA" roughness={0.8} /></mesh>
                <mesh castShadow receiveShadow position={[5.25, 1.6, -3.9]}><boxGeometry args={[2.1, 2.7, 0.2]} /><meshStandardMaterial color="#E1DFDA" roughness={0.8} /></mesh>
                <mesh castShadow position={[6.0, 1.6, 3.8]}><boxGeometry args={[0.4, 2.7, 0.4]} /><meshStandardMaterial color="#E1DFDA" roughness={0.8} /></mesh>
                <mesh castShadow position={[-0.4, 3.0, 3.85]}><boxGeometry args={[13.2, 0.25, 0.3]} /><meshStandardMaterial color="#E1DFDA" roughness={0.8} /></mesh>
                {/* Front panoramic glass */}
                <mesh position={[-0.4, 1.6, 3.8]}><boxGeometry args={[12.4, 2.5, 0.03]} /><meshStandardMaterial color="#28424D" transparent opacity={isNight ? 0.2 : 0.38} roughness={0.03} metalness={0.9} /></mesh>
                <mesh position={[6.7, 1.6, 0]}><boxGeometry args={[0.03, 2.5, 7.6]} /><meshStandardMaterial color="#28424D" transparent opacity={isNight ? 0.2 : 0.38} roughness={0.03} metalness={0.9} /></mesh>
                <WindowBox p={[7.05, 1.65, -1.5]} w={1.12} h={1.02} isNight={isNight} />
              </group>
            )}
            {houseStyle === "Timberline Vista" && (
              <group>
                {/* Split left masonry tower wall to leave gaps for side windows */}
                <mesh castShadow receiveShadow position={[-5.8, 1.6, -3.0]}><boxGeometry args={[2.2, 2.7, 2.0]} /><meshStandardMaterial color="#3D3E42" roughness={0.7} /></mesh>
                <mesh castShadow receiveShadow position={[-5.8, 1.6, 0.1]}><boxGeometry args={[2.2, 2.7, 1.4]} /><meshStandardMaterial color="#3D3E42" roughness={0.7} /></mesh>
                <mesh castShadow receiveShadow position={[-5.8, 1.6, 3.1]}><boxGeometry args={[2.2, 2.7, 1.8]} /><meshStandardMaterial color="#3D3E42" roughness={0.7} /></mesh>
                {/* Split rear wall to leave gaps for windows */}
                <mesh castShadow receiveShadow position={[-5.25, 1.6, -3.85]}><boxGeometry args={[2.1, 2.7, 0.3]} /><meshStandardMaterial color="#282B30" roughness={0.6} /></mesh>
                <mesh castShadow receiveShadow position={[-1.75, 1.6, -3.85]}><boxGeometry args={[2.1, 2.7, 0.3]} /><meshStandardMaterial color="#282B30" roughness={0.6} /></mesh>
                <mesh castShadow receiveShadow position={[1.75, 1.6, -3.85]}><boxGeometry args={[2.1, 2.7, 0.3]} /><meshStandardMaterial color="#282B30" roughness={0.6} /></mesh>
                <mesh castShadow receiveShadow position={[5.25, 1.6, -3.85]}><boxGeometry args={[2.1, 2.7, 0.3]} /><meshStandardMaterial color="#282B30" roughness={0.6} /></mesh>
                <mesh castShadow position={[5.2, 1.6, -2.5]}><boxGeometry args={[0.25, 2.7, 2.2]} /><meshStandardMaterial color="#906138" roughness={0.5} /></mesh>
                {/* Masonry tower slot window */}
                <WindowBox p={[-5.8, 1.6, 3.96]} w={0.8} h={2.3} isNight={isNight} />
                <WindowBox p={[7.05, 1.65, -0.5]} w={0.9} h={1.02} isNight={isNight} />
                {/* Front glass sliders */}
                <mesh position={[0.2, 1.6, 3.8]}><boxGeometry args={[9.8, 2.5, 0.03]} /><meshStandardMaterial color="#2B434C" transparent opacity={isNight ? 0.18 : 0.35} roughness={0.03} metalness={0.88} /></mesh>
                <mesh position={[6.8, 1.6, 0]}><boxGeometry args={[0.03, 2.5, 7.8]} /><meshStandardMaterial color="#2B434C" transparent opacity={isNight ? 0.18 : 0.35} roughness={0.03} metalness={0.88} /></mesh>
              </group>
            )}
            {houseStyle === "Minimalist Pavilion" && (
              <group>
                {/* Split left glass wall to leave gaps for side windows */}
                <mesh position={[-6.8, 1.6, -3.0]}><boxGeometry args={[0.03, 2.5, 2.0]} /><meshStandardMaterial color="#2A3D46" transparent opacity={isNight ? 0.22 : 0.4} roughness={0.02} metalness={0.9} /></mesh>
                <mesh position={[-6.8, 1.6, 0.1]}><boxGeometry args={[0.03, 2.5, 1.4]} /><meshStandardMaterial color="#2A3D46" transparent opacity={isNight ? 0.22 : 0.4} roughness={0.02} metalness={0.9} /></mesh>
                <mesh position={[-6.8, 1.6, 3.1]}><boxGeometry args={[0.03, 2.5, 1.8]} /><meshStandardMaterial color="#2A3D46" transparent opacity={isNight ? 0.22 : 0.4} roughness={0.02} metalness={0.9} /></mesh>
                {/* Split rear wall to leave gaps for windows */}
                <mesh castShadow receiveShadow position={[-5.25, 1.6, -3.85]}><boxGeometry args={[2.1, 2.7, 0.3]} /><meshStandardMaterial color="#F4F4F6" roughness={0.95} /></mesh>
                <mesh castShadow receiveShadow position={[-1.75, 1.6, -3.85]}><boxGeometry args={[2.1, 2.7, 0.3]} /><meshStandardMaterial color="#F4F4F6" roughness={0.95} /></mesh>
                <mesh castShadow receiveShadow position={[1.75, 1.6, -3.85]}><boxGeometry args={[2.1, 2.7, 0.3]} /><meshStandardMaterial color="#F4F4F6" roughness={0.95} /></mesh>
                <mesh castShadow receiveShadow position={[5.25, 1.6, -3.85]}><boxGeometry args={[2.1, 2.7, 0.3]} /><meshStandardMaterial color="#F4F4F6" roughness={0.95} /></mesh>
                <mesh castShadow position={[5.8, 1.6, -3.6]}><cylinderGeometry args={[0.12, 0.12, 2.7, 8]} /><meshStandardMaterial color="#1E1E20" roughness={0.4} /></mesh>
                <mesh castShadow position={[5.8, 1.6, 3.6]}><cylinderGeometry args={[0.12, 0.12, 2.7, 8]} /><meshStandardMaterial color="#1E1E20" roughness={0.4} /></mesh>
                <mesh castShadow receiveShadow position={[-1.2, 1.6, 0]}><boxGeometry args={[0.3, 2.7, 7.8]} /><meshStandardMaterial color="#242426" roughness={0.7} /></mesh>
                <WindowBox p={[7.05, 1.65, -1.5]} w={1.12} h={1.02} isNight={isNight} />
                <WindowBox p={[7.05, 1.65, 1.5]} w={1.12} h={1.02} isNight={isNight} />
                <mesh position={[-4.2, 1.6, 3.8]}><boxGeometry args={[5.6, 2.5, 0.03]} /><meshStandardMaterial color="#2A3D46" transparent opacity={isNight ? 0.22 : 0.4} roughness={0.02} metalness={0.9} /></mesh>
              </group>
            )}
          </group>
        )}

        {/* ─────────────────────────────────────────
            UPPER FIRST FLOOR
            ───────────────────────────────────────── */}
        {showUpperFloor && (
          <group ref={upperFloorGroup}>
            {/* ── UPPER FLOOR CONCRETE SLAB (5-piece, leaves staircase well at X=[-3.5,-0.62], Z=[-3.375,-1.625]) ── */}
            {/* Right wing slab (master side, no hole) */}
            <mesh castShadow receiveShadow position={[4.41, 3.05, 0]}>
              <boxGeometry args={[5.18, 0.2, 8.2]} />
              <meshStandardMaterial color="#1F2022" roughness={0.75} />
            </mesh>
            {/* Far-left slab (behind staircase, no hole) */}
            <mesh castShadow receiveShadow position={[-5.25, 3.05, 0]}>
              <boxGeometry args={[3.5, 0.2, 8.2]} />
              <meshStandardMaterial color="#1F2022" roughness={0.75} />
            </mesh>
            {/* Top center: X=[-3.5,1.82] Z=[-1.625,4.1] */}
            <mesh castShadow receiveShadow position={[-0.84, 3.05, 1.2375]}>
              <boxGeometry args={[5.32, 0.2, 5.725]} />
              <meshStandardMaterial color="#1F2022" roughness={0.75} />
            </mesh>
            {/* Bottom-left of staircase: X=[-3.5,-0.62] Z=[-4.1,-3.375] */}
            <mesh castShadow receiveShadow position={[-2.06, 3.05, -3.7375]}>
              <boxGeometry args={[2.88, 0.2, 0.725]} />
              <meshStandardMaterial color="#1F2022" roughness={0.75} />
            </mesh>
            {/* Bottom-right of staircase: X=[-0.62,1.82] Z=[-4.1,-1.625] */}
            <mesh castShadow receiveShadow position={[0.6, 3.05, -2.8625]}>
              <boxGeometry args={[2.44, 0.2, 2.475]} />
              <meshStandardMaterial color="#1F2022" roughness={0.75} />
            </mesh>

            {/* Flooring finish (5 matching pieces) */}
            <mesh receiveShadow position={[4.41, 3.16, 0]}>
              <boxGeometry args={[5.18, 0.02, 8.0]} />
              <meshStandardMaterial {...floorMaterialConfig} />
            </mesh>
            <mesh receiveShadow position={[-5.25, 3.16, 0]}>
              <boxGeometry args={[3.5, 0.02, 8.0]} />
              <meshStandardMaterial {...floorMaterialConfig} />
            </mesh>
            <mesh receiveShadow position={[-0.84, 3.16, 1.2375]}>
              <boxGeometry args={[5.32, 0.02, 5.725]} />
              <meshStandardMaterial {...floorMaterialConfig} />
            </mesh>
            <mesh receiveShadow position={[-2.06, 3.16, -3.7375]}>
              <boxGeometry args={[2.88, 0.02, 0.725]} />
              <meshStandardMaterial {...floorMaterialConfig} />
            </mesh>
            <mesh receiveShadow position={[0.6, 3.16, -2.8625]}>
              <boxGeometry args={[2.44, 0.02, 2.475]} />
              <meshStandardMaterial {...floorMaterialConfig} />
            </mesh>

            {/* ── STAIRCASE LANDING PLATFORM & RAILINGS ── */}
            <mesh receiveShadow position={[-2.06, 3.17, -2.5]}>
              <boxGeometry args={[2.88, 0.04, 1.75]} />
              <meshStandardMaterial color={flooringColor} roughness={0.7} />
            </mesh>
            {/* Safety railing at right edge of staircase hole (X=-0.62) */}
            <mesh position={[-0.62, 3.62, -2.5]}>
              <boxGeometry args={[0.04, 0.9, 1.75]} />
              <meshStandardMaterial color="#1A1A1C" roughness={0.5} />
            </mesh>
            <mesh position={[-0.62, 4.07, -2.5]}>
              <boxGeometry args={[0.04, 0.04, 1.75]} />
              <meshStandardMaterial color="#C5A880" metalness={0.7} roughness={0.2} />
            </mesh>
            {/* Safety railing at front of staircase hole (Z=-1.625) */}
            <mesh position={[-2.06, 3.62, -1.625]}>
              <boxGeometry args={[2.88, 0.9, 0.04]} />
              <meshStandardMaterial color="#1A1A1C" roughness={0.5} />
            </mesh>
            <mesh position={[-2.06, 4.07, -1.625]}>
              <boxGeometry args={[2.88, 0.04, 0.04]} />
              <meshStandardMaterial color="#C5A880" metalness={0.7} roughness={0.2} />
            </mesh>

            {/* ── INTERIOR PARTITION WALLS — Upper Floor ── */}
            {/* Master bedroom separation wall (X=1.82, full depth) */}
            <mesh castShadow position={[1.82, 4.5, 0]}>
              <boxGeometry args={[0.1, 2.4, 8.2]} />
              <meshStandardMaterial color="#DEDEDE" roughness={0.9} />
            </mesh>
            {/* Master ensuite rear wall (Z=-1.8) */}
            <mesh castShadow position={[4.41, 4.5, -1.8]}>
              <boxGeometry args={[5.18, 2.4, 0.1]} />
              <meshStandardMaterial color="#DEDEDE" roughness={0.9} />
            </mesh>
            {/* Family bathroom left wall (X=-0.68) */}
            <mesh castShadow position={[-0.68, 4.5, -2.9]}>
              <boxGeometry args={[0.1, 2.4, 2.4]} />
              <meshStandardMaterial color="#DEDEDE" roughness={0.9} />
            </mesh>
            {/* Family bathroom rear wall (Z=-1.8) */}
            <mesh castShadow position={[0.57, 4.5, -1.8]}>
              <boxGeometry args={[1.25, 2.4, 0.1]} />
              <meshStandardMaterial color="#DEDEDE" roughness={0.9} />
            </mesh>
            {/* Bedroom 2 zone divider (X=-2.12) — always for 3+ rooms */}
            <mesh castShadow position={[-2.12, 4.5, 1.1]}>
              <boxGeometry args={[0.1, 2.4, 5.9]} />
              <meshStandardMaterial color="#DEDEDE" roughness={0.9} />
            </mesh>
            {/* Bedroom 3 zone divider (X=-4.5) — always for 3+ rooms */}
            <mesh castShadow position={[-4.5, 4.5, 1.1]}>
              <boxGeometry args={[0.1, 2.4, 5.9]} />
              <meshStandardMaterial color="#DEDEDE" roughness={0.9} />
            </mesh>
            {/* Bedroom 4 zone divider (X=-5.9) — shown for 4+ rooms */}
            {roomCount >= 4 && (
              <mesh castShadow position={[-5.9, 4.5, 1.1]}>
                <boxGeometry args={[0.1, 2.4, 5.9]} />
                <meshStandardMaterial color="#DEDEDE" roughness={0.9} />
              </mesh>
            )}
            {/* Bedroom 5 zone divider (X=-6.7) — shown for 5 rooms */}
            {roomCount >= 5 && (
              <mesh castShadow position={[-6.7, 4.5, 1.1]}>
                <boxGeometry args={[0.1, 2.4, 5.9]} />
                <meshStandardMaterial color="#DEDEDE" roughness={0.9} />
              </mesh>
            )}

            {/* ── INTERIOR DOORS — Upper Floor ── */}
            {/* Master ensuite door */}
            <InteriorDoor p={[1.82, 3.16, -2.5]} />
            {/* Master bedroom entry door */}
            <InteriorDoor p={[1.82, 3.16, 1.5]} rotation={[0, Math.PI / 2, 0]} />
            {/* Family bathroom door */}
            <InteriorDoor p={[0.57, 3.16, -1.8]} rotation={[0, 0, 0]} />
            {/* Bedroom 2 entry door (always shown) */}
            <InteriorDoor p={[-2.12, 3.16, 1.8]} rotation={[0, Math.PI / 2, 0]} />
            {/* Bedroom 3 entry door (always shown) */}
            <InteriorDoor p={[-4.5, 3.16, 1.8]} rotation={[0, Math.PI / 2, 0]} />
            {/* Bedroom 4 entry door */}
            {roomCount >= 4 && <InteriorDoor p={[-5.9, 3.16, 1.8]} rotation={[0, Math.PI / 2, 0]} />}
            {/* Bedroom 5 entry door */}
            {roomCount >= 5 && <InteriorDoor p={[-6.7, 3.16, 1.8]} rotation={[0, Math.PI / 2, 0]} />}

            {/* ── INTERIOR LAYOUT: Upper Floor Rooms ── */}
            <group position={[0, 3.16, 0]}>
              {/* MASTER BEDROOM */}
              <group position={[4.5, 0.4, 0.5]}>
                <mesh castShadow position={[0, 0.15, -0.8]}><boxGeometry args={[2.2, 0.3, 2.4]} /><meshStandardMaterial color="#F3F3F5" roughness={0.9} /></mesh>
                <mesh castShadow position={[0, 0.62, -1.95]}><boxGeometry args={[2.4, 1.2, 0.1]} /><meshStandardMaterial color="#4A3423" roughness={0.8} /></mesh>
                <mesh position={[-0.55, 0.33, -1.75]}><boxGeometry args={[0.65, 0.1, 0.4]} /><meshStandardMaterial color="#E6E6EA" /></mesh>
                <mesh position={[0.55, 0.33, -1.75]}><boxGeometry args={[0.65, 0.1, 0.4]} /><meshStandardMaterial color="#E6E6EA" /></mesh>
                <mesh position={[-1.35, 0.15, -1.9]}><boxGeometry args={[0.4, 0.3, 0.4]} /><meshStandardMaterial color="#222" /></mesh>
                <mesh position={[1.35, 0.15, -1.9]}><boxGeometry args={[0.4, 0.3, 0.4]} /><meshStandardMaterial color="#222" /></mesh>
                <mesh position={[-1.35, 0.38, -1.9]}><cylinderGeometry args={[0.1, 0.14, 0.28, 8]} /><meshStandardMaterial color={isNight ? "#FFD580" : "#DDDDE0"} emissive={isNight ? "#FF9A30" : "#000"} emissiveIntensity={isNight ? 0.6 : 0} /></mesh>
                <mesh position={[1.35, 0.38, -1.9]}><cylinderGeometry args={[0.1, 0.14, 0.28, 8]} /><meshStandardMaterial color={isNight ? "#FFD580" : "#DDDDE0"} emissive={isNight ? "#FF9A30" : "#000"} emissiveIntensity={isNight ? 0.6 : 0} /></mesh>
                <mesh position={[0.6, 0.6, 2.5]}><boxGeometry args={[2.4, 1.8, 0.5]} /><meshStandardMaterial color="#2E2322" roughness={0.7} /></mesh>
              </group>

              {/* MASTER ENSUITE */}
              <BathroomCell p={[4.8, 0.4, -2.85]} />

              {/* UPPER FAMILY BATHROOM — always shown for all configs */}
              <BathroomCell p={[0.6, 0.4, -2.85]} />

              {/* BEDROOM 2 — always shown (3+ rooms) */}
              <group position={[-1.4, 0.4, 0.6]}>
                <mesh castShadow position={[0, 0.15, -1.0]}><boxGeometry args={[1.2, 0.3, 1.8]} /><meshStandardMaterial color="#DFDFF3" roughness={0.9} /></mesh>
                <mesh castShadow position={[0, 0.62, -1.85]}><boxGeometry args={[1.3, 0.8, 0.08]} /><meshStandardMaterial color="#3A2B1E" roughness={0.8} /></mesh>
                <mesh position={[0, 0.33, -1.62]}><boxGeometry args={[0.4, 0.1, 0.3]} /><meshStandardMaterial color="#FFF" /></mesh>
                <mesh position={[0, 0.15, 1.8]}><boxGeometry args={[1.0, 0.3, 0.4]} /><meshStandardMaterial color="#2E2322" roughness={0.7} /></mesh>
              </group>

              {/* BEDROOM 3 — always shown (3+ rooms) */}
              <group position={[-3.3, 0.4, 0.6]}>
                <mesh castShadow position={[0, 0.15, -1.0]}><boxGeometry args={[1.2, 0.3, 1.8]} /><meshStandardMaterial color="#DFF3DF" roughness={0.9} /></mesh>
                <mesh castShadow position={[0, 0.62, -1.85]}><boxGeometry args={[1.3, 0.8, 0.08]} /><meshStandardMaterial color="#3A2B1E" roughness={0.8} /></mesh>
                <mesh position={[0, 0.33, -1.62]}><boxGeometry args={[0.4, 0.1, 0.3]} /><meshStandardMaterial color="#FFF" /></mesh>
                <mesh position={[0, 0.15, 1.8]}><boxGeometry args={[1.0, 0.3, 0.4]} /><meshStandardMaterial color="#2E2322" roughness={0.7} /></mesh>
              </group>

              {/* BEDROOM 4 — shown for 4+ rooms */}
              {roomCount >= 4 && (
                <group position={[-5.2, 0.4, 0.6]}>
                  <mesh castShadow position={[0, 0.15, -1.0]}><boxGeometry args={[1.0, 0.3, 1.8]} /><meshStandardMaterial color="#F3DFF3" roughness={0.9} /></mesh>
                  <mesh castShadow position={[0, 0.62, -1.85]}><boxGeometry args={[1.1, 0.8, 0.08]} /><meshStandardMaterial color="#3A2B1E" roughness={0.8} /></mesh>
                  <mesh position={[0, 0.33, -1.62]}><boxGeometry args={[0.35, 0.1, 0.3]} /><meshStandardMaterial color="#FFF" /></mesh>
                </group>
              )}

              {/* BEDROOM 5 — shown for 5 rooms */}
              {roomCount >= 5 && (
                <group position={[-6.35, 0.4, 0.6]}>
                  <mesh castShadow position={[0, 0.15, -1.0]}><boxGeometry args={[0.9, 0.3, 1.6]} /><meshStandardMaterial color="#F3EFD0" roughness={0.9} /></mesh>
                  <mesh castShadow position={[0, 0.62, -1.85]}><boxGeometry args={[1.0, 0.8, 0.08]} /><meshStandardMaterial color="#3A2B1E" roughness={0.8} /></mesh>
                </group>
              )}
            </group>

            {/* ── CEILING LIGHTS — Upper Floor ── */}
            <CeilingLight p={[4.5, 5.56, 0.5]} isNight={isNight} />
            <CeilingLight p={[4.5, 5.56, -3.0]} isNight={isNight} />
            <CeilingLight p={[0.6, 5.56, -2.85]} isNight={isNight} />
            <CeilingLight p={[-1.4, 5.56, 0.6]} isNight={isNight} />
            <CeilingLight p={[-3.3, 5.56, 0.6]} isNight={isNight} />
            {roomCount >= 4 && <CeilingLight p={[-5.2, 5.56, 0.6]} isNight={isNight} />}
            {roomCount >= 5 && <CeilingLight p={[-6.35, 5.56, 0.6]} isNight={isNight} />}

            {/* ── WINDOWS — Rear Wall (Upper) ── */}
            {([-3.5, 0, 3.5] as number[]).map((x, i) => (
              <WindowBox key={i} p={[x, 4.52, -4.17]} w={1.2} h={1.12} isNight={isNight} />
            ))}
            {/* ── WINDOWS — Left Side Wall (Upper) ── */}
            <WindowBox p={[-7.25, 4.52, -2.0]} w={1.12} h={1.02} isNight={isNight} />
            <WindowBox p={[-7.25, 4.52, 1.0]} w={1.12} h={1.02} isNight={isNight} />

            {/* ── STYLE-SPECIFIC UPPER FLOOR EXTERIOR ── */}
            {houseStyle === "Aperture Terrace" && (
              <group>
                {/* Left wall — split to leave gaps for side windows */}
                <mesh castShadow receiveShadow position={[-6.85, 4.5, -3.0]}><boxGeometry args={[0.3, 2.7, 2.0]} /><meshStandardMaterial color="#1C1C1E" roughness={0.7} /></mesh>
                <mesh castShadow receiveShadow position={[-6.85, 4.5, 0.1]}><boxGeometry args={[0.3, 2.7, 1.4]} /><meshStandardMaterial color="#1C1C1E" roughness={0.7} /></mesh>
                <mesh castShadow receiveShadow position={[-6.85, 4.5, 3.1]}><boxGeometry args={[0.3, 2.7, 1.8]} /><meshStandardMaterial color="#1C1C1E" roughness={0.7} /></mesh>
                {/* Rear wall — split to leave gaps for rear windows */}
                <mesh castShadow receiveShadow position={[-5.25, 4.5, -3.925]}><boxGeometry args={[2.1, 2.7, 0.15]} /><meshStandardMaterial {...wallMaterialConfig} /></mesh>
                <mesh castShadow receiveShadow position={[-1.75, 4.5, -3.925]}><boxGeometry args={[2.1, 2.7, 0.15]} /><meshStandardMaterial {...wallMaterialConfig} /></mesh>
                <mesh castShadow receiveShadow position={[1.75, 4.5, -3.925]}><boxGeometry args={[2.1, 2.7, 0.15]} /><meshStandardMaterial {...wallMaterialConfig} /></mesh>
                <mesh castShadow receiveShadow position={[5.25, 4.5, -3.925]}><boxGeometry args={[2.1, 2.7, 0.15]} /><meshStandardMaterial {...wallMaterialConfig} /></mesh>
                {/* Right Wall */}
                <mesh castShadow receiveShadow position={[3.625, 4.5, -0.6]}><boxGeometry args={[0.15, 2.7, 6.8]} /><meshStandardMaterial {...wallMaterialConfig} /></mesh>
                {/* Front Wall */}
                <mesh castShadow receiveShadow position={[-1.5, 4.5, 2.725]}><boxGeometry args={[10.4, 2.7, 0.15]} /><meshStandardMaterial {...wallMaterialConfig} /></mesh>
                {/* Signature aperture ring screen */}
                <group position={[3.5, 4.5, 3.9]} rotation={[0, Math.PI / 2, 0]}>
                  <mesh castShadow position={[0, 0, -2.6]}><boxGeometry args={[0.15, 2.7, 0.2]} /><meshStandardMaterial color="#E1DFDA" /></mesh>
                  <mesh castShadow position={[0, 0, 2.6]}><boxGeometry args={[0.15, 2.7, 0.2]} /><meshStandardMaterial color="#E1DFDA" /></mesh>
                  {([-1.6, -0.8, 0, 0.8, 1.6] as number[]).map((zVal, idx) => (
                    <group key={idx} position={[0, 0, zVal]} rotation={[0, Math.PI / 2, 0]}>
                      <mesh castShadow><torusGeometry args={[0.44, 0.08, 10, 24]} /><meshStandardMaterial color="#E1DFDA" roughness={0.9} /></mesh>
                      {idx % 2 === 0 && <mesh castShadow><torusGeometry args={[0.22, 0.05, 8, 20]} /><meshStandardMaterial color="#E1DFDA" roughness={0.9} /></mesh>}
                    </group>
                  ))}
                </group>
                {/* Under-balcony wood slats */}
                <group position={[-1.5, 3.16, 3.2]}>
                  {Array.from({ length: 16 }).map((_, i) => (
                    <mesh key={i} position={[-4.5 + i * 0.6, 0, 0]} castShadow>
                      <boxGeometry args={[0.12, 0.03, 1.4]} />
                      <meshStandardMaterial color="#7E5632" roughness={0.65} />
                    </mesh>
                  ))}
                </group>
                <mesh position={[1.5, 4.5, 2.85]}><boxGeometry args={[4.4, 2.4, 0.03]} /><meshStandardMaterial color="#2C4855" transparent opacity={isNight ? 0.2 : 0.4} roughness={0.02} metalness={0.9} /></mesh>
                <group position={[1.5, 3.2, 3.9]}>
                  <mesh castShadow position={[0, 0.9, 0]}><boxGeometry args={[10.4, 0.04, 0.04]} /><meshStandardMaterial color={metalColor} /></mesh>
                  <mesh position={[0, 0.45, 0]}><boxGeometry args={[10.3, 0.8, 0.02]} /><meshStandardMaterial color="#324B54" transparent opacity={0.35} /></mesh>
                </group>
                <WindowBox p={[7.05, 4.52, -2.0]} w={1.12} h={1.02} isNight={isNight} />
              </group>
            )}
            {houseStyle === "Timberline Vista" && (
              <group>
                {/* Left masonry tower — split for window gaps */}
                <mesh castShadow receiveShadow position={[-5.8, 4.5, -3.825]}><boxGeometry args={[2.2, 2.7, 0.15]} /><meshStandardMaterial color="#3D3E42" roughness={0.7} /></mesh>
                <mesh castShadow receiveShadow position={[-5.8, 4.5, 3.825]}><boxGeometry args={[2.2, 2.7, 0.15]} /><meshStandardMaterial color="#3D3E42" roughness={0.7} /></mesh>
                <mesh castShadow receiveShadow position={[-6.825, 4.5, -3.0]}><boxGeometry args={[0.15, 2.7, 2.0]} /><meshStandardMaterial color="#3D3E42" roughness={0.7} /></mesh>
                <mesh castShadow receiveShadow position={[-6.825, 4.5, 0.1]}><boxGeometry args={[0.15, 2.7, 1.4]} /><meshStandardMaterial color="#3D3E42" roughness={0.7} /></mesh>
                <mesh castShadow receiveShadow position={[-6.825, 4.5, 3.1]}><boxGeometry args={[0.15, 2.7, 1.8]} /><meshStandardMaterial color="#3D3E42" roughness={0.7} /></mesh>
                <mesh castShadow receiveShadow position={[-4.775, 4.5, 0]}><boxGeometry args={[0.15, 2.7, 7.8]} /><meshStandardMaterial color="#3D3E42" roughness={0.7} /></mesh>
                {/* Main volume rear wall — split for window gaps */}
                <mesh castShadow receiveShadow position={[-5.25, 4.5, -3.825]}><boxGeometry args={[2.1, 2.7, 0.15]} /><meshStandardMaterial color="#906138" roughness={0.6} /></mesh>
                <mesh castShadow receiveShadow position={[-1.75, 4.5, -3.825]}><boxGeometry args={[2.1, 2.7, 0.15]} /><meshStandardMaterial color="#906138" roughness={0.6} /></mesh>
                <mesh castShadow receiveShadow position={[1.75, 4.5, -3.825]}><boxGeometry args={[2.1, 2.7, 0.15]} /><meshStandardMaterial color="#906138" roughness={0.6} /></mesh>
                <mesh castShadow receiveShadow position={[5.25, 4.5, -3.825]}><boxGeometry args={[2.1, 2.7, 0.15]} /><meshStandardMaterial color="#906138" roughness={0.6} /></mesh>
                <mesh castShadow receiveShadow position={[0.5, 4.5, 2.225]}><boxGeometry args={[10.2, 2.7, 0.15]} /><meshStandardMaterial color="#906138" roughness={0.6} /></mesh>
                <mesh castShadow receiveShadow position={[-4.525, 4.5, -0.8]}><boxGeometry args={[0.15, 2.7, 6.2]} /><meshStandardMaterial color="#906138" roughness={0.6} /></mesh>
                <mesh castShadow receiveShadow position={[5.525, 4.5, -0.8]}><boxGeometry args={[0.15, 2.7, 6.2]} /><meshStandardMaterial color="#906138" roughness={0.6} /></mesh>
                {/* Slate cladding layers */}
                <group position={[3.5, 4.5, -0.6]}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <mesh key={i} position={[0, -1.0 + i * 0.4, 2.92]} castShadow receiveShadow>
                      <boxGeometry args={[1.8, 0.35, 0.1]} />
                      <meshStandardMaterial color={i % 2 === 0 ? "#2B2D31" : "#36393E"} roughness={0.8} />
                    </mesh>
                  ))}
                </group>
                {/* Balcony vertical cedar slats */}
                <group position={[0.2, 4.5, 2.8]}>
                  {Array.from({ length: 14 }).map((_, i) => {
                    const xPos = -4.0 + i * 0.65;
                    if (xPos > -1.2 && xPos < 1.5) return null;
                    return (
                      <mesh key={i} position={[xPos, 0, 0]} castShadow>
                        <boxGeometry args={[0.06, 2.6, 0.06]} />
                        <meshStandardMaterial color="#906138" roughness={0.5} />
                      </mesh>
                    );
                  })}
                </group>
                <WindowBox p={[-5.8, 4.52, 3.96]} w={0.8} h={2.3} isNight={isNight} />
                {/* Climbing ivy */}
                <group position={[-4.5, 3.2, 3.25]}>
                  <mesh castShadow><sphereGeometry args={[0.32, 8, 8]} /><meshStandardMaterial color="#3F6446" roughness={0.9} /></mesh>
                  <mesh castShadow position={[0.25, -0.1, 0.2]}><sphereGeometry args={[0.25, 8, 8]} /><meshStandardMaterial color="#34543A" roughness={0.9} /></mesh>
                  <mesh castShadow position={[6.5, 0, 0.1]}><sphereGeometry args={[0.28, 8, 8]} /><meshStandardMaterial color="#3F6446" roughness={0.9} /></mesh>
                  <mesh castShadow position={[6.75, -0.05, 0.3]}><sphereGeometry args={[0.24, 8, 8]} /><meshStandardMaterial color="#34543A" roughness={0.9} /></mesh>
                </group>
                <mesh position={[0.2, 4.5, 2.2]}><boxGeometry args={[8.8, 2.4, 0.03]} /><meshStandardMaterial color="#2B434C" transparent opacity={isNight ? 0.2 : 0.38} metalness={0.9} /></mesh>
                <group position={[0.2, 3.2, 3.0]}>
                  <mesh castShadow position={[0, 0.9, 0]}><boxGeometry args={[10.2, 0.04, 0.04]} /><meshStandardMaterial color={metalColor} /></mesh>
                  <mesh position={[0, 0.45, 0]}><boxGeometry args={[10.1, 0.8, 0.02]} /><meshStandardMaterial color="#324B54" transparent opacity={0.35} /></mesh>
                </group>
                <WindowBox p={[7.05, 4.52, -1.5]} w={1.12} h={1.02} isNight={isNight} />
              </group>
            )}
            {houseStyle === "Minimalist Pavilion" && (
              <group>
                {/* Left wall — split for side window gaps */}
                <mesh castShadow receiveShadow position={[-7.025, 4.5, -3.0]}><boxGeometry args={[0.15, 2.7, 2.0]} /><meshStandardMaterial color="#F4F4F6" roughness={0.9} /></mesh>
                <mesh castShadow receiveShadow position={[-7.025, 4.5, 0.1]}><boxGeometry args={[0.15, 2.7, 1.4]} /><meshStandardMaterial color="#F4F4F6" roughness={0.9} /></mesh>
                <mesh castShadow receiveShadow position={[-7.025, 4.5, 3.1]}><boxGeometry args={[0.15, 2.7, 1.8]} /><meshStandardMaterial color="#F4F4F6" roughness={0.9} /></mesh>
                {/* Rear wall — split for window gaps */}
                <mesh castShadow receiveShadow position={[-5.25, 4.5, -4.025]}><boxGeometry args={[2.1, 2.7, 0.15]} /><meshStandardMaterial color="#F4F4F6" roughness={0.9} /></mesh>
                <mesh castShadow receiveShadow position={[-1.75, 4.5, -4.025]}><boxGeometry args={[2.1, 2.7, 0.15]} /><meshStandardMaterial color="#F4F4F6" roughness={0.9} /></mesh>
                <mesh castShadow receiveShadow position={[1.75, 4.5, -4.025]}><boxGeometry args={[2.1, 2.7, 0.15]} /><meshStandardMaterial color="#F4F4F6" roughness={0.9} /></mesh>
                <mesh castShadow receiveShadow position={[5.25, 4.5, -4.025]}><boxGeometry args={[2.1, 2.7, 0.15]} /><meshStandardMaterial color="#F4F4F6" roughness={0.9} /></mesh>
                {/* Front wall */}
                <mesh castShadow receiveShadow position={[0, 4.5, 4.025]}><boxGeometry args={[14.2, 2.7, 0.15]} /><meshStandardMaterial color="#F4F4F6" roughness={0.9} /></mesh>
                <mesh castShadow receiveShadow position={[7.025, 4.5, 0]}><boxGeometry args={[0.15, 2.7, 8.2]} /><meshStandardMaterial color="#F4F4F6" roughness={0.9} /></mesh>
                {/* Stacked black accent box */}
                <mesh castShadow position={[4.5, 4.5, -1.35]}><boxGeometry args={[4.4, 2.72, 0.1]} /><meshStandardMaterial color="#1E1E20" roughness={0.7} /></mesh>
                <mesh castShadow position={[4.5, 4.5, 3.75]}><boxGeometry args={[4.4, 2.72, 0.1]} /><meshStandardMaterial color="#1E1E20" roughness={0.7} /></mesh>
                <mesh castShadow position={[2.35, 4.5, 1.2]}><boxGeometry args={[0.1, 2.72, 5.2]} /><meshStandardMaterial color="#1E1E20" roughness={0.7} /></mesh>
                <mesh castShadow position={[6.65, 4.5, 1.2]}><boxGeometry args={[0.1, 2.72, 5.2]} /><meshStandardMaterial color="#1E1E20" roughness={0.7} /></mesh>
                <group position={[-5.8, 4.5, 4.12]}>
                  {([-1.2, 1.2] as number[]).map((xOffset, idx) => (
                    <mesh key={idx} position={[xOffset, 0, 0]}><boxGeometry args={[1.1, 2.4, 0.03]} /><meshStandardMaterial color="#2B3D46" transparent opacity={0.3} metalness={0.9} /></mesh>
                  ))}
                </group>
                <mesh position={[-0.8, 4.5, 4.12]}><boxGeometry args={[5.2, 2.4, 0.03]} /><meshStandardMaterial color="#2B3D46" transparent opacity={isNight ? 0.22 : 0.4} roughness={0.02} metalness={0.9} /></mesh>
                {/* Rear punched windows */}
                <WindowBox p={[-3.5, 4.52, -4.18]} w={1.2} h={1.12} isNight={isNight} />
                <WindowBox p={[0.0, 4.52, -4.18]} w={1.2} h={1.12} isNight={isNight} />
                {/* Balcony railing */}
                <group position={[-0.8, 3.2, 4.15]}>
                  <mesh castShadow position={[0, 0.9, 0]}><boxGeometry args={[5.2, 0.04, 0.04]} /><meshStandardMaterial color={charcoalColor} /></mesh>
                  <mesh position={[0, 0.45, 0]}><boxGeometry args={[5.1, 0.8, 0.02]} /><meshStandardMaterial color="#2B3D46" transparent opacity={0.3} /></mesh>
                </group>
              </group>
            )}

            {isNight && (
              <group>
                <pointLight position={[3.5, 5.0, 0]} color="#FFA64D" intensity={3.0} distance={5} decay={1.5} />
                <pointLight position={[-3.5, 5.0, 0]} color="#FFA64D" intensity={3.0} distance={5} decay={1.5} />
              </group>
            )}
          </group>
        )}



        {/* ─────────────────────────────────────────
            ROOF LEVEL
            ───────────────────────────────────────── */}
        {showRoof && (
          <group ref={roofGroup}>
            {houseStyle === "Aperture Terrace" && (
              <group position={[0, 5.85, 0]}>
                <mesh castShadow position={[0, 0.15, 0]}><boxGeometry args={[14.8, 0.25, 8.8]} /><meshStandardMaterial color="#242426" roughness={0.7} /></mesh>
                <mesh position={[0, 0.15, 4.42]} castShadow><boxGeometry args={[14.84, 0.28, 0.04]} /><meshStandardMaterial color={metalColor} roughness={0.3} /></mesh>
              </group>
            )}
            {houseStyle === "Timberline Vista" && (
              <group position={[0, 5.85, 0]}>
                <mesh castShadow position={[0, 0.15, -0.2]}><boxGeometry args={[14.6, 0.25, 8.4]} /><meshStandardMaterial color="#3D3E42" roughness={0.8} /></mesh>
                <mesh position={[0.5, 0.15, 4.02]} castShadow><boxGeometry args={[10.4, 0.28, 0.05]} /><meshStandardMaterial color="#906138" roughness={0.5} /></mesh>
              </group>
            )}
            {houseStyle === "Minimalist Pavilion" && (
              <group position={[0, 5.85, 0]}>
                <mesh castShadow position={[0, 0.15, 0]}><boxGeometry args={[14.8, 0.2, 8.8]} /><meshStandardMaterial color="#1E1E20" roughness={0.7} /></mesh>
                <mesh position={[0, 0.26, 0]} castShadow><boxGeometry args={[14.6, 0.05, 8.6]} /><meshStandardMaterial color="#F4F4F6" /></mesh>
              </group>
            )}

            {/* Solar panels */}
            {hasSolar && (
              <group position={[3.0, 6.2, 0.5]}>
                {([-1.8, -0.6, 0.6, 1.8] as number[]).map((xPos, idx) => (
                  <group key={idx} position={[xPos, 0, 0]} rotation={[0.08, 0, 0]}>
                    <mesh castShadow><boxGeometry args={[1.0, 0.05, 1.8]} /><meshStandardMaterial color="#142130" roughness={0.1} metalness={0.9} /></mesh>
                    <mesh position={[0, -0.03, 0]}><boxGeometry args={[1.04, 0.02, 1.84]} /><meshStandardMaterial color={metalColor} roughness={0.2} /></mesh>
                  </group>
                ))}
              </group>
            )}
          </group>
        )}

      </group>
    </group>
  );
}
