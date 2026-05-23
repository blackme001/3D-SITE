"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, PerspectiveCamera } from "@react-three/drei";
import HouseModel from "./HouseModel";
import { Suspense } from "react";
import { HouseStyle, FootprintSize, LandSize } from "./Configurator";

interface ThreeCanvasProps {
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

export default function ThreeCanvas({
  exteriorWalls,
  flooring,
  isNight,
  houseStyle,
  footprint,
  landSize,
  roomCount,
  hasPool,
  hasSolar,
  hasLounge,
  interiorView,
}: ThreeCanvasProps) {
  return (
    <div className="w-full h-full relative bg-[#09090A]">
      <Canvas
        shadows
        gl={{ antialias: true, preserveDrawingBuffer: true, alpha: false }}
        className="w-full h-full"
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[11, 7, 11]} fov={45} />
          
          {/* Day & Night Custom Lighting System */}
          {isNight ? (
            <>
              {/* Navy Night ambient sky dome fill */}
              <ambientLight intensity={0.4} color="#161A2B" />
              {/* Crisp cool moonlight */}
              <directionalLight
                castShadow
                position={[-6, 12, -6]}
                intensity={0.8}
                color="#A3B4E3"
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                shadow-bias={-0.0005}
              />
              {/* Horizon warm orange glow fill */}
              <directionalLight
                position={[8, 1, 4]}
                intensity={0.25}
                color="#FFA665"
              />
            </>
          ) : (
            <>
              {/* Clean crisp blueish sky light fill */}
              <ambientLight intensity={0.9} color="#F2F5FF" />
              {/* Intense white sunlight casting sharp structural shadows */}
              <directionalLight
                castShadow
                position={[8, 14, 6]}
                intensity={2.4}
                color="#FFFDF5"
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-bias={-0.0002}
              />
              {/* Cool shadow fill bouncing from the background */}
              <directionalLight
                position={[-8, 6, -4]}
                intensity={0.5}
                color="#A4BCDE"
              />
            </>
          )}

          {/* Procedural Cantilever Modernist Villa */}
          <HouseModel
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

          {/* Tactile Soft Shadow plane directly below the foundation floor slab */}
          <ContactShadows
            position={[0, 0, 0]}
            opacity={isNight ? 0.75 : 0.55}
            scale={20}
            blur={2.5}
            far={4.0}
            resolution={512}
          />

          {/* Damped Orbit controls bounded to premium angles */}
          <OrbitControls
            enableDamping
            dampingFactor={0.06}
            minDistance={7}
            maxDistance={18}
            minPolarAngle={Math.PI / 10} // Restrict looking directly top-down
            maxPolarAngle={Math.PI / 2 - 0.03} // Prevent slipping below floor grid plane
            makeDefault
          />
        </Suspense>
      </Canvas>

      {/* Modern floating camera control instructions overlay */}
      <div className="absolute bottom-6 left-6 pointer-events-none select-none glass-panel px-5 py-2.5 rounded-full text-[10px] tracking-[0.15em] text-neutral-400 flex items-center gap-2.5">
        <span className="w-1.5 h-1.5 rounded-full bg-luxury-gold animate-pulse" />
        DRAG TO ROTATE • SCROLL TO ZOOM
      </div>
    </div>
  );
}
