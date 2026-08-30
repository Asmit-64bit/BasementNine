import { useGameStore } from '../store/gameStore';
import { Laboratory } from './Environment/Laboratory';
import { ServerRoom } from './Environment/ServerRoom';
import { ReactorCore } from './Environment/ReactorCore';
import { AbandonedSchoolRoom } from './Environment/AbandonedSchoolRoom';
import { AbandonedOffice } from './Environment/AbandonedOffice';
import { Desk } from './Objects/Desk';
import { Computer } from './Objects/Computer';
import { Painting } from './Objects/Painting';
import { Bookshelf } from './Objects/Bookshelf';
import { LockedDrawer } from './Objects/LockedDrawer';
import { ExitDoor } from './Objects/ExitDoor';

export const LevelManager = () => {
  const { currentLevel } = useGameStore();

  switch (currentLevel) {
    case 1:
      return (
        <>
          <Laboratory />
          <Desk />
          <Computer />
          <Painting />
          <Bookshelf />
          <LockedDrawer />
          <ExitDoor />
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
