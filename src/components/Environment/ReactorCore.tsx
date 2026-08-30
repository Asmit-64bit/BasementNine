import React, { useRef, useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { getReactorFloorTexture, getReactorWallTexture, getCeilingTexture } from '../../utils/textureGenerator';

export const ReactorCore: React.FC = () => {
  const { setMessage, hasItem, setActivePuzzle, escaped } = useGameStore();
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const coreMeshRef = useRef<THREE.Mesh>(null);
  const coreGlowRef = useRef<THREE.MeshStandardMaterial>(null);
  const coolantGlowRef = useRef<THREE.MeshStandardMaterial>(null);

  const floorTexture = useMemo(() => getReactorFloorTexture(), []);
  const wallTexture = useMemo(() => getReactorWallTexture(), []);
  const ceilingTexture = useMemo(() => getCeilingTexture(), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (ring1Ref.current) ring1Ref.current.rotation.z = t * 0.8;
    if (ring2Ref.current) ring2Ref.current.rotation.x = -t * 0.6;
    if (ring3Ref.current) ring3Ref.current.rotation.y = t * 0.5;

    if (coreMeshRef.current) {
      coreMeshRef.current.rotation.y = t * 0.2;
      coreMeshRef.current.scale.setScalar(1 + Math.sin(t * 3) * 0.05);
    }
    if (coreGlowRef.current) {
      coreGlowRef.current.emissiveIntensity = 2.5 + Math.sin(t * 3.5) * 1.0;
    }
    if (coolantGlowRef.current) {
      coolantGlowRef.current.emissiveIntensity = hasItem('Coolant Override')
        ? 1.8 + Math.sin(t * 2) * 0.3
        : 1.0 + Math.sin(t * 6) * 0.5;
    }
  });

  const handleCoolant = () => {
    if (hasItem('Coolant Override')) {
      setMessage('Coolant pressure stabilized. Lockdown sequence primed for final override.');
    } else {
      setActivePuzzle(7);
    }
  };

  const handleEscapePod = () => {
    if (escaped) return;
    if (hasItem('Coolant Override')) {
      setActivePuzzle(8);
    } else {
      setMessage('Reactor core meltdown imminent! Stabilize the Coolant Terminal first.');
    }
  };

  return (
    <>
      {/* Textured Diamond Plate Industrial Floor */}
      <RigidBody type="fixed">
        <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[32, 32]} />
          <meshStandardMaterial map={floorTexture} roughness={0.6} metalness={0.7} />
        </mesh>
      </RigidBody>

      {/* Glowing Sub-Floor Coolant / Lava Chasm Ring */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.5, 9.5, 32]} />
        <meshStandardMaterial color="#dc2626" emissive="#ef4444" emissiveIntensity={2.2} />
      </mesh>

      {/* Textured Ceiling */}
      <RigidBody type="fixed">
        <mesh position={[0, 10, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[32, 32]} />
          <meshStandardMaterial map={ceilingTexture} roughness={0.8} />
        </mesh>
      </RigidBody>

      {/* Perimeter Blast Walls with Hazard Wallpapers */}
      <RigidBody type="fixed">
        <mesh position={[0, 5, -16]}><boxGeometry args={[32, 10, 0.8]} /><meshStandardMaterial map={wallTexture} roughness={0.6} metalness={0.6} /></mesh>
        <mesh position={[0, 5, 16]}><boxGeometry args={[32, 10, 0.8]} /><meshStandardMaterial map={wallTexture} roughness={0.6} metalness={0.6} /></mesh>
        <mesh position={[16, 5, 0]}><boxGeometry args={[0.8, 10, 32]} /><meshStandardMaterial map={wallTexture} roughness={0.6} metalness={0.6} /></mesh>
        <mesh position={[-16, 5, 0]}><boxGeometry args={[0.8, 10, 32]} /><meshStandardMaterial map={wallTexture} roughness={0.6} metalness={0.6} /></mesh>
      </RigidBody>

      {/* Central Magnetic Reactor Pillars */}
      <RigidBody type="fixed" position={[-4.5, 5, -4.5]}>
        <mesh><cylinderGeometry args={[0.5, 0.7, 10, 16]} /><meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} /></mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[4.5, 5, -4.5]}>
        <mesh><cylinderGeometry args={[0.5, 0.7, 10, 16]} /><meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} /></mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[-4.5, 5, 4.5]}>
        <mesh><cylinderGeometry args={[0.5, 0.7, 10, 16]} /><meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} /></mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[4.5, 5, 4.5]}>
        <mesh><cylinderGeometry args={[0.5, 0.7, 10, 16]} /><meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} /></mesh>
      </RigidBody>

      {/* Central Plasma Anomaly Core */}
      <RigidBody type="fixed" position={[0, 4, 0]}>
        {/* Core Base & Emitter Pedestal */}
        <mesh position={[0, -3.2, 0]}>
          <cylinderGeometry args={[2.5, 3.2, 1.6, 24]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Top Magnetic Containment Cap */}
        <mesh position={[0, 3.8, 0]}>
          <cylinderGeometry args={[3.2, 2.5, 1.6, 24]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Pulsing Plasma Core Sphere */}
        <mesh ref={coreMeshRef} position={[0, 0.2, 0]}>
          <icosahedronGeometry args={[1.8, 3]} />
          <meshStandardMaterial
            ref={coreGlowRef}
            color="#ff3d00"
            emissive="#ff1744"
            emissiveIntensity={3.0}
            roughness={0.1}
          />
        </mesh>

        {/* Rotating Magnetic Containment Torus Rings */}
        <mesh ref={ring1Ref} position={[0, 0.2, 0]}>
          <torusGeometry args={[2.8, 0.1, 16, 64]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} emissive="#f59e0b" emissiveIntensity={0.8} />
        </mesh>
        <mesh ref={ring2Ref} position={[0, 0.2, 0]}>
          <torusGeometry args={[3.2, 0.08, 16, 64]} />
          <meshStandardMaterial color="#ef4444" metalness={0.9} emissive="#dc2626" emissiveIntensity={1.0} />
        </mesh>
        <mesh ref={ring3Ref} position={[0, 0.2, 0]}>
          <torusGeometry args={[3.6, 0.06, 16, 64]} />
          <meshStandardMaterial color="#00ffff" metalness={0.9} emissive="#06b6d4" emissiveIntensity={1.5} />
        </mesh>
      </RigidBody>

      {/* Coolant Valve Console (Interactable #7) */}
      <RigidBody type="fixed" position={[-8, 0, -8]}>
        <mesh position={[0, 1.0, 0]} userData={{ name: 'Cryo Coolant Console', interactable: true, onInteract: handleCoolant }}>
          <boxGeometry args={[2.4, 2.0, 1.4]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Cryo Screen Display */}
        <mesh position={[0, 1.3, 0.72]}>
          <planeGeometry args={[1.8, 1.0]} />
          <meshStandardMaterial
            ref={coolantGlowRef}
            color="#0891b2"
            emissive="#00e5ff"
            emissiveIntensity={2.0}
          />
        </mesh>

        {/* Coolant Piping System */}
        <mesh position={[-1.0, 2.2, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 1.2, 16]} />
          <meshStandardMaterial color="#06b6d4" metalness={0.8} />
        </mesh>
        <mesh position={[1.0, 2.2, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 1.2, 16]} />
          <meshStandardMaterial color="#06b6d4" metalness={0.8} />
        </mesh>
      </RigidBody>

      {/* Final Escape Pod AirLock (Exit Interactable #8) */}
      <RigidBody type="fixed" position={[0, 3, 15.6]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[6.2, 6.2, 0.6]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Airlock Perimeter Ring */}
        <mesh position={[0, 0, 0.32]}>
          <torusGeometry args={[2.6, 0.2, 16, 48]} />
          <meshStandardMaterial
            color={escaped ? '#10b981' : '#b91c1c'}
            emissive={escaped ? '#34d399' : '#ef4444'}
            emissiveIntensity={2.2}
          />
        </mesh>

        {/* Escape Pod Sliding Hydraulic Hatch */}
        <mesh
          position={[escaped ? 3.5 : 0, 0, 0.2]}
          userData={{ name: 'Escape Pod Airlock', interactable: true, onInteract: handleEscapePod }}
        >
          <cylinderGeometry args={[2.4, 2.4, 0.3, 32]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color={escaped ? '#10b981' : '#dc2626'} metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Launch Control Terminal Console */}
        <mesh position={[3.6, -1.2, 0.4]} userData={{ name: 'Launch Control Console', interactable: true, onInteract: handleEscapePod }}>
          <boxGeometry args={[0.6, 1.2, 0.4]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>
        <mesh position={[3.6, -0.9, 0.62]}>
          <planeGeometry args={[0.4, 0.3]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.5} />
        </mesh>
      </RigidBody>
    </>
  );
};
