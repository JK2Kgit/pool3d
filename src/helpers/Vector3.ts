import {clamp} from "./helpers";

export type Vector3 = {
  x: number
  y: number
  z: number
}

export function V3(x: number, y: number, z: number){
  return {x: x, y: y, z: z}
}

export function V3ToArrayWebgl(a: Vector3): number[]{
  return [a.y, a.z, -a.x]
}
export function V3TimeScalar(a: Vector3, k: number): Vector3{
  return {x: a.x * k, y: a.y * k, z: a.z * k}
}
export function V3Add(a: Vector3, b: Vector3): Vector3 {
  return {x: a.x + b.x, y: a.y + b.y, z: a.z + b.z}
}
export function V3Sub(a: Vector3, b: Vector3): Vector3 {
  return {x: a.x - b.x, y: a.y - b.y, z: a.z - b.z}
}
export function V3Mul(a: Vector3, b: Vector3): Vector3 {
  return {x: a.x * b.x, y: a.y * b.y, z: a.z * b.z}
}
export function V3Div(a: Vector3, b: Vector3): Vector3 {
  return {x: a.x / b.x, y: a.y / b.y, z: a.z / b.z}
}
export function V3AbsLessThan(a: Vector3, value: number): boolean{
  if(isNaN(a.x) || isNaN(a.y) || isNaN(a.z))
    return true
  let val = Math.abs(value)
  return Math.abs(a.x) < val && Math.abs(a.y) < val && Math.abs(a.z) < val
}
export function V3Clamp(a: Vector3, min: number, max: number): Vector3{
  return {x: clamp(a.x, min, max), y: clamp(a.y, min, max), z: clamp(a.z, min, max)}
}
export function V3Val(a: Vector3): number{
  return Math.sqrt(a.x*a.x + a.y*a.y + a.z*a.z)
}
export function V3Z(): Vector3{
  return {x: 0, y: 0, z: 0}
}
export function V3Cross(a: Vector3, b: Vector3){
  return {x: a.y*b.z - a.z*b.y, y: a.z*b.x-a.x*b.z, z: a.x*b.y - a.y*b.x};
}
export function V3RotateOn2D(a: Vector3, phi: number){
  const rotation = [
    Math.cos(phi), - Math.sin(phi), 0,
    Math.sin(phi), Math.cos(phi), 0,
    0, 0, 1
  ]
  //console.log(rotation)
  return multiplyMat3Vec3(rotation, a)
}
export function V3ToUnit(a: Vector3): Vector3{
  if(a.x == 0  && a.y == 0 && a.z == 0){
    return a
  }
  return V3TimeScalar(a, 1 / V3Val(a))
}


export function multiplyMat3Vec3(a: number[], b: Vector3): Vector3 {
  const x = b.x * a[0] + b.y * a[1] + b.z * a[2];
  const y = b.x * a[3] + b.y * a[4] + b.z * a[5];
  const z = b.x * a[6] + b.y * a[7] + b.z * a[8];
  return {x: x, y: y, z: z};
}