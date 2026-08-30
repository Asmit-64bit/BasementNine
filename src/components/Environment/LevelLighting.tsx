import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';

export const LevelLighting: React.FC = () => {
  const { currentLevel } = useGameStore();
  const labFlickerLightRef = useRef<THREE.PointLight>(null);
  const reactorLightRef = useRef<THREE.PointLight>(null);
  const reactorBeaconRef = useRef<THREE.SpotLight>(null);
  const serverLightRef = useRef<THREE.PointLight>(null);
  const debugLightRef = useRef<THREE.PointLight>(null);
  const nexusLightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Level 1: Flickering lab tube
    if (labFlickerLightRef.current && currentLevel === 1) {
      const flicker = Math.sin(t * 14) * Math.cos(t * 22);
      labFlickerLightRef.current.intensity = 2.2 + (flicker > 0.6 ? 0.4 : -0.3);
    }

    // Level 2: Server room data pulse
    if (serverLightRef.current && currentLevel === 2) {
      serverLightRef.current.intensity = 2.0 + Math.sin(t * 2.5) * 0.5;
    }

    // Level 3: Reactor core pulse
    if (reactorLightRef.current && currentLevel === 3) {
      reactorLightRef.current.intensity = 3.2 + Math.sin(t * 3.2) * 1.0;
    }
    if (reactorBeaconRef.current && currentLevel === 3) {
      reactorBeaconRef.current.position.x = Math.sin(t * 1.8) * 8;
      reactorBeaconRef.current.position.z = Math.cos(t * 1.8) * 8;
    }

    // Level 4: Debug Wing purple neon glitch pulse
    if (debugLightRef.current && currentLevel === 4) {
      debugLightRef.current.intensity = 2.4 + Math.sin(t * 3.8) * 0.6;
    }

    // Level 5: The Nexus golden celestial pulse
    if (nexusLightRef.current && currentLevel === 5) {
      nexusLightRef.current.intensity = 3.4 + Math.sin(t * 2.0) * 0.8;
    }
  });

  return (
    <>
      {/* ----------------- LEVEL 1: LABORATORY LIGHTING ----------------- */}
      {currentLevel === 1 && (
        <>
          <fog attach="fog" args={['#0f172a', 16, 45]} />
          <ambientLight intensity={1.0} color="#e2e8f0" />
          <pointLight
            ref={labFlickerLightRef}
            position={[0, 4.2, 0]}
            intensity={2.4}
            distance={25}
            color="#f8fafc"
            castShadow
          />
          <pointLight position={[0, 2.2, -7.5]} intensity={2.0} distance={12} color="#34d399" />
          <pointLight position={[0, 3.8, 8.5]} intensity={1.8} distance={14} color="#f87171" />
          <pointLight position={[-7.5, 3.0, -4.5]} intensity={1.5} distance={12} color="#38bdf8" />
          <pointLight position={[7.5, 3.0, 0]} intensity={1.5} distance={12} color="#fbbf24" />
          <pointLight position={[9.2, 2.5, -6]} intensity={1.4} distance={11} color="#cbd5e1" />
          <pointLight position={[9.2, 2.5, 6]} intensity={1.4} distance={11} color="#cbd5e1" />
          <pointLight position={[-9.2, 2.5, 4]} intensity={1.4} distance={11} color="#cbd5e1" />
          <pointLight position={[0, 2.5, -9.2]} intensity={1.4} distance={11} color="#cbd5e1" />
        </>
      )}

      {/* ----------------- LEVEL 2: SERVER ROOM LIGHTING ----------------- */}
      {currentLevel === 2 && (
        <>
          <fog attach="fog" args={['#090d16', 18, 48]} />
          <ambientLight intensity={1.05} color="#93c5fd" />
          <pointLight
            ref={serverLightRef}
            position={[0, 4.2, 0]}
            intensity={2.2}
            distance={26}
            color="#67e8f9"
            castShadow
          />
          <pointLight position={[-8, 2.5, 7.5]} intensity={2.8} distance={14} color="#00e5ff" />
          <pointLight position={[8, 2.5, -7.5]} intensity={2.8} distance={14} color="#ff3366" />
          <pointLight position={[0, 3.8, 9.5]} intensity={2.0} distance={12} color="#fbbf24" />
          <pointLight position={[9.2, 2.5, 0]} intensity={1.6} distance={12} color="#7dd3fc" />
          <pointLight position={[-9.2, 2.5, -6]} intensity={1.6} distance={12} color="#7dd3fc" />
          <pointLight position={[0, 2.5, -9.2]} intensity={1.6} distance={12} color="#7dd3fc" />
        </>
      )}

      {/* ----------------- LEVEL 3: REACTOR CORE LIGHTING ----------------- */}
      {currentLevel === 3 && (
        <>
          <fog attach="fog" args={['#1c0a0a', 20, 52]} />
          <ambientLight intensity={1.1} color="#fca5a5" />
          <pointLight
            ref={reactorLightRef}
            position={[0, 4.0, 0]}
            intensity={3.8}
            distance={35}
            color="#ff5722"
            castShadow
          />
          <spotLight
            ref={reactorBeaconRef}
            position={[8, 8.5, 8]}
            angle={0.65}
            penumbra={0.4}
            intensity={4.0}
            color="#ff1744"
            target-position={[0, 0, 0]}
          />
          <pointLight position={[-8, 2.5, -8]} intensity={2.8} distance={15} color="#00e5ff" />
          <pointLight position={[0, 4.2, 14]} intensity={2.6} distance={16} color="#ffffff" />
          <pointLight position={[13.5, 3, -8]} intensity={1.7} distance={14} color="#fdba74" />
          <pointLight position={[-13.5, 3, 8]} intensity={1.7} distance={14} color="#fdba74" />
          <pointLight position={[0, 3, -13.5]} intensity={1.7} distance={14} color="#fdba74" />
        </>
      )}

      {/* ----------------- LEVEL 4: DEBUG WING LIGHTING ----------------- */}
      {currentLevel === 4 && (
        <>
          <fog attach="fog" args={['#13072b', 18, 50]} />
          <ambientLight intensity={1.05} color="#e9d5ff" />
          <pointLight
            ref={debugLightRef}
            position={[0, 4.8, 0]}
            intensity={2.6}
            distance={30}
            color="#c084fc"
            castShadow
          />
          <pointLight position={[-8, 2.5, -8]} intensity={2.8} distance={14} color="#e879f9" />
          <pointLight position={[8, 2.5, -6]} intensity={2.8} distance={14} color="#a855f7" />
          <pointLight position={[0, 4.2, 11.5]} intensity={2.2} distance={14} color="#34d399" />
          <pointLight position={[11, 3, 0]} intensity={1.6} distance={14} color="#d8b4fe" />
          <pointLight position={[-11, 3, 0]} intensity={1.6} distance={14} color="#d8b4fe" />
        </>
      )}

      {/* ----------------- LEVEL 5: THE NEXUS LIGHTING ----------------- */}
      {currentLevel === 5 && (
        <>
          <fog attach="fog" args={['#171004', 22, 56]} />
          <ambientLight intensity={1.15} color="#fef08a" />
          <pointLight
            ref={nexusLightRef}
            position={[0, 6.0, 0]}
            intensity={4.0}
            distance={40}
            color="#fbbf24"
            castShadow
          />
          <pointLight position={[-10, 3.5, 0]} intensity={3.0} distance={16} color="#f59e0b" />
          <pointLight position={[0, 5.0, 15.5]} intensity={3.2} distance={18} color="#ffffff" />
          <pointLight position={[10, 3.5, 0]} intensity={2.2} distance={15} color="#00e5ff" />
          <pointLight position={[0, 3.5, -15]} intensity={2.2} distance={15} color="#fbbf24" />
        </>
      )}
    </>
  );
};
