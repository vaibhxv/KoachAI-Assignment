import { Injectable } from '@angular/core';
import { Client, Room } from 'colyseus.js';

@Injectable({ providedIn: 'root' })
export class GameService {
  client = new Client('ws://localhost:2567');
  public room!: Room;

  async joinGame() {
    this.room = await this.client.joinOrCreate('game');
    this.room.onMessage("new_shape", (message) => this.onNewShape(message));
    this.room.onMessage("shape_moved", (message) => this.onShapeMoved(message));
  }

  moveShape(direction:any) {
    this.room.send("move_shape", direction);
  }

  onNewShape(shapeData:any) { /* Update local game state with new shape */ }
  onShapeMoved(shapeData:any) { /* Update local game state with moved shape */ }
}
