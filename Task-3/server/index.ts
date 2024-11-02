import express from 'express';
import { Server } from 'colyseus';
import { createServer } from 'http';
import { GameRoom } from './GameRoom';

const app = express();
const port = 2567;
const httpServer = createServer(app);

const gameServer = new Server({
  server: httpServer,
});

gameServer.define('game', GameRoom);
gameServer.listen(port);
console.log(`Game server listening on ws://localhost:${port}`);
