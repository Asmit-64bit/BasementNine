import React, { useRef, useMemo, useEffect } from 'react';
import { RigidBody } from '@react-three/rapier';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';

export const OfficeRoom: React.FC = () => {
  const { scene } = useGLTF('/office_is_old_abandoned_free.glb');
  const { setMessage, hasItem, setActivePuzzle, escaped } = useGameStore();

  const terminalScreenGlowRef = useRef<THREE.MeshStandardMaterial>(null);
  const speakerLightRef = useRef<THREE.PointLight>(null);
  const exitBeaconRef = useRef<THREE.MeshStandardMaterial>(null);

  // Clone scene so multiple mounts don't collide
  const clonedScene = useMemo(() => {
    const s = scene.clone(true);
    s.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => {
              mat.side = THREE.DoubleSide;
            });
          } else {
            (mesh.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
          }
        }
      }
    });
    return s;
  }, [scene]);

  // Subtitle voice dialogue message on room start
  useEffect(() => {
    setMessage(
      'A single screen glows in the corner. "You want the exit. I want to know who I\'m dealing with. Find my name in the logs — one line out of forty thousand."'
    );
  }, [setMessage]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (terminalScreenGlowRef.current) {
      terminalScreenGlowRef.current.emissiveIntensity = 1.8 + Math.sin(t * 3.5) * 0.5;
    }
    if (speakerLightRef.current) {
      speakerLightRef.current.intensity = 2.0 + Math.sin(t * 4) * 0.6;
    }
    if (exitBeaconRef.current) {
      exitBeaconRef.current.emissiveIntensity = escaped
        ? 2.2 + Math.sin(t * 4) * 0.6
        : 1.2 + Math.sin(t * 2) * 0.4;
    }
  });

  const handleInteractTerminal = () => {
    if (hasItem('Terminal Clearance')) {
      setMessage('"Slow. But honest. Let\'s see what else is slow about you." — The Exit is unlocked.');
    } else {
      setActivePuzzle(1);
    }
  };

  const handleInteractExit = () => {
    if (escaped || hasItem('Terminal Clearance')) {
      setMessage('"Slow. But honest. Let\'s see what else is slow about you." (Proceeding to Exit...)');
      setActivePuzzle(3);
    } else {
      setMessage('The speaker crackles: "Find my name in the logs — one line out of forty thousand."');
    }
  };

  return (
    <>
      {/* Main Abandoned Office 3D GLB Model Mesh with RigidBody trimesh physics & correct rotation */}
      <RigidBody type="fixed" colliders="trimesh">
        <primitive
          object={clonedScene}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          scale={[1.3, 1.3, 1.3]}
        />
      </RigidBody>

      {/* Primary Room Illumination */}
      <ambientLight intensity={0.65} color="#94a3b8" />
      <directionalLight position={[0, 6, 2]} intensity={1.2} color="#f8fafc" castShadow />
      <directionalLight position={[-3, 4, -3]} intensity={0.6} color="#64748b" />

      {/* Rusty Corner Speaker Light Source & Indicator */}
      <pointLight
        ref={speakerLightRef}
        position={[-3.8, 2.5, -3.8]}
        color="#fbbf24"
        intensity={2.2}
        distance={10}
      />
      <mesh position={[-3.8, 2.7, -3.8]}>
        <boxGeometry args={[0.35, 0.5, 0.25]} />
        <meshStandardMaterial color="#27272a" roughness={0.9} />
      </mesh>

      {/* Single Glowing Screen in Corner (Interactable Terminal) */}
      <RigidBody type="fixed" position={[-3.2, 0.95, -3.2]}>
        {/* Terminal Monitor Housing */}
        <mesh
          position={[0, 0.35, 0]}
          rotation={[0, Math.PI / 4, 0]}
          userData={{
            name: 'Single Glowing Terminal',
            interactable: true,
            isInteractable: true,
            onInteract: handleInteractTerminal,
          }}
        >
          <boxGeometry args={[1.1, 0.75, 0.35]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Green CRT Glowing Display Screen */}
        <mesh
          position={[0.08, 0.35, 0.08]}
          rotation={[0, Math.PI / 4, 0]}
          userData={{
            name: 'Single Glowing Terminal',
            interactable: true,
            isInteractable: true,
            onInteract: handleInteractTerminal,
          }}
        >
          <planeGeometry args={[0.95, 0.6]} />
          <meshStandardMaterial
            ref={terminalScreenGlowRef}
            color="#064e3b"
            emissive="#10b981"
            emissiveIntensity={2.0}
          />
        </mesh>

        {/* Spot Light radiating from the terminal screen into the room */}
        <spotLight
          position={[0.2, 0.4, 0.2]}
          target-position={[1.5, 0, 1.5]}
          color="#34d399"
          intensity={3.5}
          distance={9}
          angle={0.75}
        />
      </RigidBody>

      {/* Room Exit Gate / Door (South Wall) */}
      <RigidBody type="fixed" position={[0, 1.5, 4.5]}>
        <mesh
          userData={{
            name: 'Room 1 Exit Gate',
            interactable: true,
            isInteractable: true,
            onInteract: handleInteractExit,
          }}
        >
          <boxGeometry args={[2.8, 3.2, 0.3]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Status Light Beacon above exit door */}
        <mesh position={[0, 1.75, 0.2]}>
          <boxGeometry args={[0.5, 0.12, 0.08]} />
          <meshStandardMaterial
            ref={exitBeaconRef}
            color={escaped ? '#10b981' : '#eab308'}
            emissive={escaped ? '#34d399' : '#f59e0b'}
            emissiveIntensity={1.8}
          />
        </mesh>
      </RigidBody>
    </>
  );
};

useGLTF.preload('/office_is_old_abandoned_free.glb');
