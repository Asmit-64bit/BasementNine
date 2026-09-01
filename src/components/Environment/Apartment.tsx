import { useGLTF } from '@react-three/drei';

export function Model(props: JSX.IntrinsicElements['group']) {
  const { scene } = useGLTF('/Abandoned-hospital-corridor-map.glb');
  return (
    <group {...props} dispose={null}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload('/Abandoned-hospital-corridor-map.glb');
