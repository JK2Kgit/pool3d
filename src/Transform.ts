import { Vector3 } from "./Vector3";

export class Transform{
  position: Vector3
  rotation: Vector3

  context: CanvasRenderingContext2D

  constructor(position: Vector3, rotation: Vector3, context: CanvasRenderingContext2D) {
    this.position = position;
    this.rotation = rotation;
    this.context = context;
  }
}
