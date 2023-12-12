import { Context } from '@midwayjs/web';
import { IGameRoom } from '../../../interface/IGameRoom';
import { IPlayer } from '../../core/Player';

export default () => {
  function sendMsgToClients({
    roomNumber,
    players,
    action,
    nsp,
  }: {
    roomNumber: string;
    players: any;
    action: string;
    nsp: any;
  }) {
    // 在线列表
    nsp.adapter.clients([roomNumber], (err: any, clients: any) => {
      // 更新在线用户列表
      nsp.to(roomNumber).emit('online', {
        clients,
        action,
        target: 'participator',
        data: { players },
      });
    });
  }

  return async (ctx: Context, next: () => Promise<any>) => {
    const socket = ctx.socket as any;
    const id = socket.id;
    const app = ctx.app as any;
    const nsp = app.io.of('/socket');
    const query = socket.handshake.query;
    const { room, roomConfig } = query;
    console.log('socket-----join', id);
    console.log('roomConfig-----roomConfig', JSON.parse(roomConfig));
    // room缓存信息是否存在
    if (!nsp.gameRooms) {
      nsp.gameRooms = [];
    }

    try {
      const cachedRoom: IGameRoom | null = nsp.gameRooms.find((r: IGameRoom) => r.number === room);
      const { user } = ctx.state;
      socket.join(room);
      await socket.emit(id, ctx.helper.parseMsg('userInfo', { userInfo: user }));
      const player: IPlayer = {
        ...user,
        socketId: id,
        counter: 0,
        buyIn: 0,
        delayCount: 3,
        reBuy: 0,
        voluntaryActionCountAtPreFlop: 0,
        totalActionCountAtPreFlop: 0,
        vpip: 0,
      };

      if (!cachedRoom) {
        // current room is not cached in the nsp
        const gameRoom: IGameRoom = {
          number: room,
          roomInfo: {
            sit: [],
            players: [player],
            game: null,
            sitLink: null,
            config: JSON.parse(roomConfig) || {
              isShort: false,
              smallBlind: 1,
            },
          },
        };
        nsp.gameRooms.push(gameRoom);
        console.debug('...room not cached in nsp, create a new one');
        console.debug(
          '...current cached rooms: ' + JSON.stringify(nsp.gameRooms.map((room: IGameRoom) => room.number)),
        );
        sendMsgToClients({
          roomNumber: room,
          players: gameRoom.roomInfo.players,
          action: 'players',
          nsp,
        });
        console.debug('...update game room with players: ', JSON.stringify(gameRoom.roomInfo.players));
      } else {
        // current room is cached in the nsp
        // 判断当前用户在不在nsp缓存的room的players列表里
        const currentPlayerInRoom = cachedRoom.roomInfo.players.find(
          (player: IPlayer) => player.userId === user.userId,
        );
        // 不在则发消息告诉所有人, 更新 players
        if (!currentPlayerInRoom) {
          // game ready
          cachedRoom.roomInfo.players.push(player);
          sendMsgToClients({
            roomNumber: room,
            players: cachedRoom.roomInfo.players,
            action: 'players',
            nsp,
          });
        } else {
          // gaming, update hand cards
          currentPlayerInRoom.socketId = id;
          const gamePlayer = cachedRoom.roomInfo.game?.allPlayer.find((player) => player.userId === user.userId);

          if (gamePlayer) {
            // in the game, get hand card
            const msg = ctx.helper.parseMsg('handCard', { handCard: gamePlayer.getHandCard() }, { client: id });
            socket.emit(id, msg);
          }

          if (cachedRoom.roomInfo) {
            const roomInfo = cachedRoom.roomInfo;
            const gameInfo = {
              players: roomInfo.players.map((p) => {
                const currPlayer = roomInfo.game?.allPlayer.find((player) => player.userId === p.userId);
                console.log('currPlayer ========== ', currPlayer);
                return Object.assign(
                  {},
                  {
                    counter: currPlayer?.counter || p.counter,
                    actionSize: currPlayer?.actionSize || 0,
                    actionCommand: currPlayer?.actionCommand || '',
                    nickName: p.nickName,
                    type: currPlayer?.type || '',
                    userId: p.userId,
                    status: p.status,
                    buyIn: p.buyIn || 0,
                    voluntaryActionCountAtPreFlop:
                      currPlayer?.voluntaryActionCountAtPreFlop || p.voluntaryActionCountAtPreFlop,
                    totalActionCountAtPreFlop: currPlayer?.totalActionCountAtPreFlop || p.totalActionCountAtPreFlop,
                    vpip: currPlayer?.vpip || p.vpip,
                  },
                  {},
                );
              }),
              commonCard: roomInfo.game?.commonCard || [],
              pot: roomInfo.game?.pot || 0,
              prevSize: roomInfo.game?.prevSize || 0,
              currPlayer: { userId: roomInfo.game?.currPlayer.node.userId },
              smallBlind: roomInfo.config.smallBlind,
              actionEndTime: roomInfo.game?.actionEndTime || 0,
            };
            const game = ctx.helper.parseMsg('gameInfo', { data: gameInfo }, { client: id });
            socket.emit(id, game);
          }
        }

        // get sitList
        const msg = ctx.helper.parseMsg('sitList', { sitList: cachedRoom.roomInfo.sit }, { client: id });
        socket.emit(id, msg);
      }
      sendMsgToClients({
        roomNumber: room,
        players: `User(${user.nickName}) joined.`,
        action: 'join',
        nsp,
      });
      await next();
    } catch (e) {
      throw e;
    }
  };
};
