export type Vector3 = {
  x: number
  y: number
  z: number
}

export function Vector3ToArray(vec: Vector3): number[]{
  return [vec.x, vec.y, vec.z]
}
export function Vector3TimeScalar(vec: Vector3, k: number): Vector3{
  return {x: vec.x * k, y: vec.y * k, z: vec.z * k}
}