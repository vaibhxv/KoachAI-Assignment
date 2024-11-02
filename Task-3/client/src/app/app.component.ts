// shape-drawer.component.ts
import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import * as BABYLON from 'babylonjs';
import { GameService } from './services/game.service';
import { Subject } from 'rxjs';
import { GridMaterial } from 'babylonjs-materials';

interface ShapeData {
  points: BABYLON.Vector2[];
  type: 'extrusion' | 'sphere';
  position?: BABYLON.Vector3;
}


@Component({
  selector: 'app-root',
  template: `
    <div class="container p-4">
      <div class="drawing-area mb-4">
        <canvas #drawCanvas class="draw-canvas"></canvas>
        <canvas #renderCanvas class="render-canvas"></canvas>
      </div>
      
      <div class="controls">
        <div class="buttons mb-4">
          <button class="btn primary mr-2" (click)="clearCanvas()">Clear Canvas</button>
          <button class="btn success mr-2" (click)="convertTo3D()">Convert to 3D</button>
          <button class="btn info" (click)="joinMultiplayerSession()">Join Session</button>
        </div>

        <div *ngIf="currentShape" class="movement-controls">
          <h3>Move Shape</h3>
          <div class="grid grid-cols-3 gap-2 w-32 mx-auto">
            <button (click)="moveShape('left')" class="btn">←</button>
            <button (click)="moveShape('forward')" class="btn">↑</button>
            <button (click)="moveShape('right')" class="btn">→</button>
            <div></div>
            <button (click)="moveShape('backward')" class="btn">↓</button>
            <div></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .drawing-area {
      display: flex;
      gap: 20px;
    }

    .draw-canvas, .render-canvas {
      width: 400px;
      height: 400px;
      border: 2px solid #ccc;
    }

    .draw-canvas {
      cursor: crosshair;
    }

    .controls {
      width: 100%;
      max-width: 820px;
      text-align: center;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .primary { background-color: #007bff; color: white; }
    .success { background-color: #28a745; color: white; }
    .info { background-color: #17a2b8; color: white; }

    .movement-controls {
      margin-top: 20px;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('drawCanvas', { static: true }) drawCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('renderCanvas', { static: true }) renderCanvasRef!: ElementRef<HTMLCanvasElement>;

  private destroy$ = new Subject<void>();
  private ctx!: CanvasRenderingContext2D;
  private engine!: BABYLON.Engine;
  private scene!: BABYLON.Scene;
  private camera!: BABYLON.ArcRotateCamera;
  private points: BABYLON.Vector2[] = [];
  private isDrawing = false;
  private shapes: Map<string, BABYLON.Mesh> = new Map();
  currentShape?: BABYLON.Mesh;

  constructor(private gameService: GameService) {}

  ngOnInit() {
    this.initializeDrawingCanvas();
    this.initializeBabylonScene();
    this.setupMultiplayerListeners();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.engine.dispose();
  }

  private initializeDrawingCanvas() {
    const canvas = this.drawCanvasRef.nativeElement;
    canvas.width = 400;
    canvas.height = 400;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = '#000';

    canvas.addEventListener('mousedown', this.startDrawing.bind(this));
    canvas.addEventListener('mousemove', this.draw.bind(this));
    canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
    canvas.addEventListener('mouseleave', this.stopDrawing.bind(this));
  }

  private initializeBabylonScene() {
    const canvas = this.renderCanvasRef.nativeElement;
    canvas.width = 400;
    canvas.height = 400;
    
    this.engine = new BABYLON.Engine(canvas, true);
    this.scene = new BABYLON.Scene(this.engine);

    // Camera setup
    this.camera = new BABYLON.ArcRotateCamera(
      'camera',
      0,
      Math.PI / 3,
      10,
      BABYLON.Vector3.Zero(),
      this.scene
    );
    this.camera.attachControl(canvas, true);

    // Lighting
    const hemisphericLight = new BABYLON.HemisphericLight(
      'light',
      new BABYLON.Vector3(0, 1, 0),
      this.scene
    );
    
    const directionalLight = new BABYLON.DirectionalLight(
      'dirLight', 
      new BABYLON.Vector3(-1, -2, -1), 
      this.scene
    );
    directionalLight.position = new BABYLON.Vector3(20, 40, 20);

    // Ground
    const ground = BABYLON.MeshBuilder.CreateGround(
      'ground',
      { width: 20, height: 20 },
      this.scene
    );
    const groundMaterial = new BABYLON.StandardMaterial('groundMat', this.scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);
    ground.material = groundMaterial;

    // Grid
    const gridMaterial = new GridMaterial("gridMat", this.scene);
    gridMaterial.majorUnitFrequency = 5;
    gridMaterial.minorUnitVisibility = 0.45;
    gridMaterial.gridRatio = 1;
    gridMaterial.backFaceCulling = false;
    gridMaterial.mainColor = new BABYLON.Color3(1, 1, 1);
    gridMaterial.lineColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    gridMaterial.opacity = 0.98;

    ground.material = gridMaterial;

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });

    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }

  private startDrawing(event: MouseEvent) {
    this.isDrawing = true;
    this.points = [];
    this.ctx.beginPath();
    const { x, y } = this.getCanvasPosition(event);
    this.ctx.moveTo(x, y);
    this.points.push(new BABYLON.Vector2(x, y));
  }

  private draw(event: MouseEvent) {
    if (!this.isDrawing) return;
    
    const { x, y } = this.getCanvasPosition(event);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.points.push(new BABYLON.Vector2(x, y));
  }

  private stopDrawing() {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    this.ctx.closePath();
  }

  private getCanvasPosition(event: MouseEvent) {
    const rect = this.drawCanvasRef.nativeElement.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  clearCanvas() {
    this.ctx.clearRect(
      0,
      0,
      this.drawCanvasRef.nativeElement.width,
      this.drawCanvasRef.nativeElement.height
    );
    this.points = [];
    if (this.currentShape) {
      this.currentShape.dispose();
      this.currentShape = undefined;
    }
  }

  async joinMultiplayerSession() {
    try {
      await this.gameService.joinGame();
    } catch (error) {
      console.error('Failed to join multiplayer session:', error);
    }
  }

  private setupMultiplayerListeners() {
    if (!this.gameService.room) return;

    this.gameService.room.onMessage("new_shape", (data: ShapeData) => {
      this.create3DShape(data);
    });

    this.gameService.room.onMessage("shape_moved", (data: {
      id: string,
      position: BABYLON.Vector3
    }) => {
      const shape = this.shapes.get(data.id);
      if (shape) {
        shape.position.set(data.position.x, data.position.y, data.position.z);
      }
    });
  }

  moveShape(direction: 'left' | 'right' | 'forward' | 'backward') {
    if (!this.currentShape) return;

    const MOVE_DISTANCE = 1;
    const movement = new BABYLON.Vector3();

    switch (direction) {
      case 'left':
        movement.x = -MOVE_DISTANCE;
        break;
      case 'right':
        movement.x = MOVE_DISTANCE;
        break;
      case 'forward':
        movement.z = -MOVE_DISTANCE;
        break;
      case 'backward':
        movement.z = MOVE_DISTANCE;
        break;
    }

    this.currentShape.position.addInPlace(movement);

    // Sync movement with other players
    if (this.gameService.room) {
      this.gameService.moveShape({
        id: this.currentShape.id,
        position: this.currentShape.position
      });
    }
  }

  convertTo3D() {
    if (this.points.length < 3) return;

    const shapeData: ShapeData = {
      points: this.points,
      type: this.isShapeCircular() ? 'sphere' : 'extrusion',
      position: new BABYLON.Vector3(0, 0.5, 0)
    };

    this.create3DShape(shapeData);

    // Sync with other players
    if (this.gameService.room) {
      this.gameService.room.send("new_shape", shapeData);
    }
  }

  private create3DShape(shapeData: ShapeData) {
    if (this.currentShape) {
      this.currentShape.dispose();
    }

    if (shapeData.type === 'sphere') {
      const radius = this.calculateRadius() / 100;
      this.currentShape = BABYLON.MeshBuilder.CreateSphere(
        'sphere',
        { diameter: radius * 2 },
        this.scene
      );
    } else {
      const shape3D = this.normalizePoints();
      this.currentShape = BABYLON.MeshBuilder.CreateRibbon(
        'polygon',
        {
          pathArray: [
            shape3D.map(p => new BABYLON.Vector3(p.x, 0, p.y)),
            shape3D.map(p => new BABYLON.Vector3(p.x, 1, p.y))
          ],
          closePath: true
        },
        this.scene
      );
    }

    const material = new BABYLON.StandardMaterial('shapeMat', this.scene);
    material.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.8);
    this.currentShape.material = material;
    
    if (shapeData.position) {
      this.currentShape.position.copyFrom(shapeData.position);
    }

    this.shapes.set(this.currentShape.id, this.currentShape);
  }

  private isShapeCircular(): boolean {
    if (this.points.length < 8) return false;

    const center = this.calculateCenter();
    const distances = this.points.map(point => 
      Math.sqrt(
        Math.pow(point.x - center.x, 2) + 
        Math.pow(point.y - center.y, 2)
      )
    );

    const avgRadius = distances.reduce((a, b) => a + b) / distances.length;
    const variance = distances.reduce((acc, dist) => 
      acc + Math.pow(dist - avgRadius, 2), 0
    ) / distances.length;

    return variance < avgRadius * 0.15;
  }

  private calculateCenter(): BABYLON.Vector2 {
    const x = this.points.reduce((sum, p) => sum + p.x, 0) / this.points.length;
    const y = this.points.reduce((sum, p) => sum + p.y, 0) / this.points.length;
    return new BABYLON.Vector2(x, y);
  }

  private calculateRadius(): number {
    const center = this.calculateCenter();
    return this.points.reduce((maxDist, point) => {
      const dist = Math.sqrt(
        Math.pow(point.x - center.x, 2) + 
        Math.pow(point.y - center.y, 2)
      );
      return Math.max(maxDist, dist);
    }, 0) * 2;
  }

  private normalizePoints(): BABYLON.Vector2[] {
    const simplified = this.simplifyPoints(this.points, 10);
    
    const minX = Math.min(...simplified.map(p => p.x));
    const maxX = Math.max(...simplified.map(p => p.x));
    const minY = Math.min(...simplified.map(p => p.y));
    const maxY = Math.max(...simplified.map(p => p.y));
    
    return simplified.map(point => new BABYLON.Vector2(
      (point.x - minX) / (maxX - minX) * 2 - 1,
      (point.y - minY) / (maxY - minY) * 2 - 1
    ));
  }

  private simplifyPoints(points: BABYLON.Vector2[], tolerance: number): BABYLON.Vector2[] {
    if (points.length < 3) return points;
    
    const simplified: BABYLON.Vector2[] = [points[0]];
    let prevPoint = points[0];
    
    for (let i = 1; i < points.length - 1; i++) {
      const point = points[i];
      const dist = Math.sqrt(
        Math.pow(point.x - prevPoint.x, 2) + 
        Math.pow(point.y - prevPoint.y, 2)
      );
      
      if (dist > tolerance) {
        simplified.push(point);
        prevPoint = point;
      }
    }
    
    simplified.push(points[points.length - 1]);
    return simplified;
  }
}