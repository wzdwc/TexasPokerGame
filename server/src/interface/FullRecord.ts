interface Player {
  userId: string;
  nickName: string;
  position: string;
  handCard: string;
  buyIn: number;
  counter: number;
}

interface Action {
  userId: string;
  commonCard: string[];
  // utc
  time: string;
  command: string;
  size?: number;
}

export interface FullRecord {
  players: Player[];
  actions: Action[];
}
