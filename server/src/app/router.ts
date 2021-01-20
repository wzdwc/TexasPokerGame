import { Application } from 'midway';

export default function (app: Application) {
  app.io.of('/socket').route('exchange', app.io.controller.nsp.exchange);
  app.io.of('/socket').route('broadcast', app.io.controller.nsp.broadcast);
  app.io.of('/socket').route('buyIn', app.io.controller.game.buyIn);
  app.io.of('/socket').route('playGame', app.io.controller.game.playGame);
  app.io.of('/socket').route('action', app.io.controller.game.action);
  app.io.of('/socket').route('sitDown', app.io.controller.game.sitDown);
  app.io.of('/socket').route('standUp', app.io.controller.game.standUp);

}
