import {Vector3} from "./Vector3";

export type Vector2 = {
  x: number
  y: number
}

export function Vector2ToVector3(vec: Vector2, y: number): Vector3 {
  return {x: vec.x, y: y, z: vec.y}
}

export function Vector2Add(vec: Vector2, vec2: Vector2): Vector2 {
  return {x: vec.x + vec2.x, y: vec.y + vec2.y}
}