import { useGameStore } from '../store/gameStore';
import { OfficeRoom } from './Environment/OfficeRoom';
import { ServerRoom } from './Environment/ServerRoom';
import { ReactorCore } from './Environment/ReactorCore';
import { DebugWing } from './Environment/DebugWing';
import { TheNexus } from './Environment/TheNexus';

export const LevelManager = () => {
  const { currentLevel } = useGameStore();

  switch (currentLevel) {
    case 1:
      return <OfficeRoom />;
    case 2:
      return <ServerRoom />;
    case 3:
      return <ReactorCore />;
    case 4:
      return <DebugWing />;
    case 5:
      return <TheNexus />;
    default:
      return null;
  }
};
