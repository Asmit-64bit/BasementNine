import React, { useRef, useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getLabFloorTexture, getLabWallTexture, getCeilingTexture } from '../../utils/textureGenerator';

export const Laboratory: React.FC = () => {
  const bioSpecimenRef = useRef<THREE.Mesh>(null);

  const floorTexture = useMemo(() => getLabFloorTexture(), []);
  const wallTexture = useMemo(() => getLabWallTexture(), []);
  const ceilingTexture = useMemo(() => getCeilingTexture(), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (bioSpecimenRef.current) {
      bioSpecimenRef.current.position.y = 1.8 + Math.sin(t * 1.5) * 0.15;
      bioSpecimenRef.current.rotation.y = t * 0.5;
      bioSpecimenRef.current.rotation.x = Math.sin(t * 0.8) * 0.2;
    }
  });

  return (
    <>
      {/* Textured Main Floor */}
      <RigidBody type="fixed">
        <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial
            map={floorTexture}
            roughness={0.4}
            metalness={0.3}
          />
        </mesh>
      </RigidBody>

      {/* Hazard Caution Striping near Exit (South wall) */}
      <mesh position={[0, 0.01, 7]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 1]} />
        <meshStandardMaterial color="#eab308" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.015, 7]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.6, 0.8]} />
        <meshStandardMaterial color="#1f2937" roughness={0.5} />
      </mesh>

      {/* Textured Ceiling */}
      <RigidBody type="fixed">
        <mesh position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial map={ceilingTexture} roughness={0.8} />
        </mesh>
      </RigidBody>

      {/* Ceiling Conduits */}
      <mesh position={[0, 4.7, -4]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 20, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 4.7, 4]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 20, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Overhead Fluorescent Fixtures */}
      <mesh position={[0, 4.85, 0]}>
        <boxGeometry args={[3.5, 0.2, 0.8]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0, 4.75, 0]}>
        <boxGeometry args={[3.2, 0.05, 0.6]} />
        <meshStandardMaterial color="#ffffff" emissive="#f8fafc" emissiveIntensity={1.5} />
      </mesh>

      {/* North Wall with Wallpaper & Telemetry Screen */}
      <RigidBody type="fixed">
        <mesh position={[0, 2.5, -10]}>
          <boxGeometry args={[20, 5, 0.5]} />
          <meshStandardMaterial map={wallTexture} roughness={0.5} metalness={0.4} />
        </mesh>
      </RigidBody>
      {/* Wall Telemetry Monitor (North) */}
      <mesh position={[4.5, 3.2, -9.7]}>
        <boxGeometry args={[3.2, 1.8, 0.1]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} />
      </mesh>
      <mesh position={[4.5, 3.2, -9.64]}>
        <planeGeometry args={[3, 1.6]} />
        <meshStandardMaterial color="#064e3b" emissive="#10b981" emissiveIntensity={0.6} />
      </mesh>

      {/* South Wall (Exit Side) */}
      <RigidBody type="fixed">
        <mesh position={[0, 2.5, 10]}>
          <boxGeometry args={[20, 5, 0.5]} />
          <meshStandardMaterial map={wallTexture} roughness={0.5} metalness={0.4} />
        </mesh>
      </RigidBody>

      {/* East Wall (Painting Side) */}
      <RigidBody type="fixed">
        <mesh position={[10, 2.5, 0]}>
          <boxGeometry args={[0.5, 5, 20]} />
          <meshStandardMaterial map={wallTexture} roughness={0.5} metalness={0.4} />
        </mesh>
      </RigidBody>

      {/* West Wall (Bookshelf Side) */}
      <RigidBody type="fixed">
        <mesh position={[-10, 2.5, 0]}>
          <boxGeometry args={[0.5, 5, 20]} />
          <meshStandardMaterial map={wallTexture} roughness={0.5} metalness={0.4} />
        </mesh>
      </RigidBody>

      {/* Cryo Containment Tank (North-East Corner) */}
      <RigidBody type="fixed" position={[7, 0, -7]}>
        {/* Base */}
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.9, 1.1, 0.5, 24]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Top Cap */}
        <mesh position={[0, 3.25, 0]}>
          <cylinderGeometry args={[1.0, 0.9, 0.5, 24]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Glass Cylinder */}
        <mesh position={[0, 1.75, 0]}>
          <cylinderGeometry args={[0.8, 0.8, 2.5, 24]} />
          <meshStandardMaterial
            color="#10b981"
            transparent
            opacity={0.4}
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>
        {/* Floating Biological Anomaly Specimen inside */}
        <mesh ref={bioSpecimenRef} position={[0, 1.75, 0]}>
          <octahedronGeometry args={[0.38, 2]} />
          <meshStandardMaterial
            color="#34d399"
            emissive="#10b981"
            emissiveIntensity={1.8}
            wireframe
          />
        </mesh>
      </RigidBody>

      {/* Hazmat Chemical Barrels (North-West Corner) */}
      <RigidBody type="fixed" position={[-7, 0, -8]}>
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 1.6, 20]} />
          <meshStandardMaterial color="#dc2626" roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.52, 0.52, 0.08, 20]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.52, 0.52, 0.08, 20]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[-8, 0, -7]}>
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 1.6, 20]} />
          <meshStandardMaterial color="#64748b" roughness={0.4} metalness={0.7} />
        </mesh>
      </RigidBody>
    </>
  );
};
