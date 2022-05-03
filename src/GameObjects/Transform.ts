import { Vector3 } from "../helpers/Vector3";

export class Transform{
  position: Vector3
  rotation: Vector3

  constructor(position: Vector3, rotation: Vector3) {
    this.position = position;
    this.rotation = rotation;
  }
}
