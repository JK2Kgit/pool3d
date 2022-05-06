import {Vector3} from "./Vector3";
import {Vector2} from "./Vector2";

export type Hit = {
  direction: Vector3,
  positionOnBall: Vector2
  strength: number
}