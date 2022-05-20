import {Vector3} from "./Vector3";

export type Vector2 = {
  x: number
  y: number
}

export function V2(x: number, y:number){
  return{x,y}
}

export function Vector2ToVector3(vec: Vector2, z: number): Vector3 {
  return {x: vec.x, y: vec.y, z: z}
}

export function Vector2Add(vec: Vector2, vec2: Vector2): Vector2 {
  return {x: vec.x + vec2.x, y: vec.y + vec2.y}
}

export function V2Angle(vec: Vector2, vec2: Vector2 = {x: 1, y: 0}){
  const ang = Math.atan2(vec.y, vec.x) - Math.atan2(vec2.y, vec2.x)
  if(ang < 0){
    return Math.PI*2 + ang;
  }
  return ang
}