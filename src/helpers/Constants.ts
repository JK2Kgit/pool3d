import {Vector2} from "./Vector2";
import {Vector3} from "./Vector3";

export const EPSILON = 0.000001
export const WIDTH = 1124
export const HEIGHT = (WIDTH*160)/281
export const SIZE_MULT = WIDTH / 562
export const COORDS: Vector2[][] = [[{x: 0, y: 0}, {x: WIDTH - 50*SIZE_MULT*.5, y: 0}],[{x: 50*SIZE_MULT*.5, y: 0}, {x: WIDTH - 100*SIZE_MULT*.5, y: 0}]]
export const FOV = 50
export const TABLE_WIDTH = 5
export const TABLE_DEPTH = 10
export const MULTIPLAYER = 0.6
export const WHITE = [1.0, 1.0, 1.0, 1.0]
export const BALL_SIZE = .2
export const WHITE_BALL_POS: Vector3 = {x: -3, y: 0, z: 0}
export const UPS = 144
export const FLICKER = UPS
export const TOL = 1e-8
export const PHYSICS_SCALE = 1
export const STRENGTH_MIN = 1
export const STRENGTH_MAX = 11
