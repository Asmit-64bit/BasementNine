import { useEffect } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useGameStore } from '../../store/gameStore';

const MODEL_PATH = '/Abandoned-hospital-corridor-map.glb';

function tag(scene: THREE.Object3D, nodeName: string, userData: Record<string, unknown>) {
  const node = scene.getObjectByName(nodeName);
  if (!node) return;
  node.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.userData = { ...child.userData, ...userData };
    }
  });
}

// Reuses existing corridor set-dressing (a wall panel, a pinboard, an alarm
// call-point, the main double door and a wall frame) as the level's
// interactive puzzle props, instead of drawing new geometry on top of them.
export function HospitalHotspots() {
  const { scene } = useGLTF(MODEL_PATH);

  useEffect(() => {
    tag(scene, 'frame_1', {
      name: 'Anomalous Portrait',
      interactable: true,
      onInteract: () => {
        const { hasItem, setMessage, addToInventory } = useGameStore.getState();
        if (!hasItem('USB Drive')) {
          setMessage("You inspect behind the anomalous portrait and discover an encrypted 'USB Drive'!");
          addToInventory('USB Drive');
        } else {
          setMessage('The surveillance portrait stares back into the room with cold digital silence.');
        }
      },
    });

    tag(scene, 'switcher', {
      name: 'Terminal Terminal_01',
      interactable: true,
      onInteract: () => {
        const { hasItem, setActivePuzzle, setMessage } = useGameStore.getState();
        if (hasItem('Gold Key')) {
          setMessage('You have already breached and extracted data from this terminal.');
        } else {
          setActivePuzzle(1);
        }
      },
    });

    tag(scene, 'board_1', {
      name: 'Archive Bookshelf',
      interactable: true,
      onInteract: () => {
        const { hasItem, setMessage } = useGameStore.getState();
        if (hasItem('USB Drive')) {
          setMessage('A research dossier on the shelf reads: "Facility AI core has developed quantum sentience. Do not trust terminal outputs."');
        } else {
          setMessage('Rows of research archives on cybersecurity and neural networks. You might need something to inspect deeper.');
        }
      },
    });

    tag(scene, 'fire_button', {
      name: 'Encrypted Safe Console',
      interactable: true,
      onInteract: () => {
        const { hasItem, setActivePuzzle, setMessage } = useGameStore.getState();
        if (hasItem('Master Key')) {
          setMessage('The containment safe is unlocked. You already extracted the Master Key.');
        } else if (hasItem('Gold Key')) {
          setActivePuzzle(2);
        } else {
          setMessage('The encrypted safe requires a Gold Key to activate its cryptographic keypad.');
        }
      },
    });

    tag(scene, 'double_door', {
      name: 'Containment Blast Door',
      interactable: true,
      onInteract: () => {
        const { hasItem, setActivePuzzle, setMessage, escaped } = useGameStore.getState();
        if (escaped) {
          setMessage('Containment Sector breached. Proceed through the open door.');
          return;
        }
        if (hasItem('Master Key')) {
          setActivePuzzle(3);
        } else {
          setMessage('Sector 1 Exit is sealed by lockdown protocol. A Master Key is required.');
        }
      },
    });
  }, [scene]);

  return (
    // No collider for the double_door hotspot — that's the level's exit and
    // must stay walkable, same as the rest of the corridor's real geometry.
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider args={[0.4, 0.5, 0.1]} position={[-9.02, 1.63, -1.57]} />
      <CuboidCollider args={[0.3, 0.5, 0.2]} position={[-7.48, 0.58, 1.25]} />
      <CuboidCollider args={[0.5, 0.6, 0.15]} position={[-4.23, 1.83, -1.58]} />
      <CuboidCollider args={[0.2, 0.3, 0.1]} position={[3.83, 1.42, 1.25]} />
    </RigidBody>
  );
}

useGLTF.preload(MODEL_PATH);
