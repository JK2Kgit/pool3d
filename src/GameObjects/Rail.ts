import {Vector2} from "../helpers/Vector2";

export type Rail = {
  lx: number
  ly: number
  lo: number
  id: RAIL_ID
}

export enum RAIL_ID {
  LEFT,
  RIGHT,
  BOTTOM,
  TOP
}

export function RV2(r: Rail): Vector2{
  return {x: r.lx, y: r.ly}
}