import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useGameStore } from '../store/gameStore';
import { Model as Apartment } from './Environment/Apartment';
import { ServerRoom } from './Environment/ServerRoom';
import { ReactorCore } from './Environment/ReactorCore';
import { AbandonedSchoolRoom } from './Environment/AbandonedSchoolRoom';
import { AbandonedOffice } from './Environment/AbandonedOffice';
import { HospitalHotspots } from './Objects/HospitalHotspots';

export const LevelManager = () => {
  const { currentLevel } = useGameStore();

  switch (currentLevel) {
    case 1:
      return (
        <>
          {/* Visual only — the source scan is a dense mesh, far too heavy
              for a trimesh collider (it hangs Rapier's cooking step). Player
              containment uses an invisible boundary shell instead, sized to
              the scanned corridor's real bounding box (floor ~y=0 after the
              +0.1 offset below) so the player can roam the whole corridor
              rather than being boxed into the old apartment's footprint. */}
          <Apartment position={[0, 0.1, 0]} />
          <RigidBody type="fixed">
            <CuboidCollider args={[15.9, 0.1, 6.1]} position={[0.46, -0.1, -0.17]} />
            <CuboidCollider args={[15.9, 0.1, 6.1]} position={[0.46, 2.85, -0.17]} />
            <CuboidCollider args={[15.9, 1.4, 0.1]} position={[0.46, 1.4, 5.85]} />
            <CuboidCollider args={[15.9, 1.4, 0.1]} position={[0.46, 1.4, -6.19]} />
            <CuboidCollider args={[0.1, 1.4, 6.1]} position={[16.29, 1.4, -0.17]} />
            <CuboidCollider args={[0.1, 1.4, 6.1]} position={[-15.38, 1.4, -0.17]} />
          </RigidBody>
          <HospitalHotspots />
        </>
      );
    case 2:
      return <ServerRoom />;
    case 3:
      return <ReactorCore />;
    case 4:
      return <AbandonedSchoolRoom />;
    case 5:
      return <AbandonedOffice />;
    default:
      return null;
  }
};
