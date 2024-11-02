import { Room, Client } from 'colyseus';

interface ShapeState {
  x: number;
  y: number;
  z: number;
  playerId: string;
}

export class GameRoom extends Room {
  shapes: { [key: string]: ShapeState } = {};

  onCreate() {
    this.onMessage("move_shape", (client, message) => {
      const shape = this.shapes[client.sessionId];
      if (shape) {
        shape.x += message.x;
        shape.y += message.y;
        shape.z += message.z;
        this.broadcast("shape_moved", { id: client.sessionId, ...shape });
      }
    });
  }

  onJoin(client: Client) {
    this.shapes[client.sessionId] = { x: 0, y: 0, z: 0, playerId: client.sessionId };
    this.broadcast("new_shape", { id: client.sessionId, ...this.shapes[client.sessionId] });
  }

  onLeave(client: Client) {
    delete this.shapes[client.sessionId];
    this.broadcast("remove_shape", { id: client.sessionId });
  }
}
