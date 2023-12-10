import request from "../utils/request";

export default {
  register: ({ userAccount = "", password = "", nickName = "" }) =>
    request({
      url: "/user/register",
      body: { userAccount, password, nickName },
    }),
  login: (userAccount: string, password: string) =>
    request({
      url: "/user/login",
      body: { userAccount, password },
    }),
  checkLogin: () =>
    request({
      url: "/user",
      body: {},
    }),
  createRoom: (isShort: boolean, smallBlind: number, time: number) =>
    request({
      url: "/game/room",
      body: { isShort, smallBlind, time },
    }),
  findRoom: (roomNumber: string) =>
    request({
      url: "/game/room/find",
      body: { roomNumber },
    }),
  getRooms: () =>
    request({
      method: "GET",
      url: "/game/room",
    }),
  buyIn: (buyInSize: number) =>
    request({
      url: "/game/buyIn",
      body: { buyInSize },
    }),
  commandRecordList: (roomNumber: string, gameId: number) =>
    request({
      url: "/game/record/find/commandRecord",
      body: { roomNumber, gameId },
    }),
  gameRecordList: (roomNumber: string) =>
    request({
      url: "/game/record/find/gameRecord",
      body: { roomNumber },
    }),
  selfPast7DayGame: (userID: number) =>
    request({
      url: "/game/record/find/selfPast7DayGame",
      body: { userID },
    }),
};
