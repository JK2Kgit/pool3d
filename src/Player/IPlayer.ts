import {Transform} from "../GameObjects/Transform";
import {V3, V3TimeScalar, Vector3} from "../helpers/Vector3";
import {Hit} from "../helpers/Hit";
import {GameStage} from "../helpers/helpers";
import {Vector2} from "../helpers/Vector2";

export abstract class IPlayer{
  on: boolean = false
  ballPos: Vector3 = V3(0,0,0)
  cameraTransformInv: Transform = new Transform({x: 0, y: 0, z: 0}, {x: 0, y: 0, z: Math.PI/ 5.7}) // roattion ok , position inverted
  hitCallback: (hit: Hit) => void = (_hit: Hit) => {}
  placeCallback: (pos: Vector3) => void = (_pos: Vector3) => {}
  public setTransform(t: Transform): void{
    this.cameraTransformInv = new Transform(V3TimeScalar(t.position, -1), t.rotation)
  }
  public abstract handleInput(dt:number, stage:GameStage): {T: Transform, C: boolean, ballPos: Vector3, hitPlace: Vector2}
  public abstract getStrength(): number
}

export class PlayerInput {
  x: number // horizontal
  y: number // vertical
  z: number // zoom

  xm: number // ball Horozinal
  ym: number // ball Vertical
  zm: number // ball strenght

  constructor(x: number, y: number, z: number, xm: number, ym: number, zm: number){
    this.x = x;
    this.y = y;
    this.z = z;
    this.xm = xm;
    this.ym = ym;
    this.zm = zm;
  }

  multipleDt(dt: number): PlayerInput{
    this.x *= dt
    this.y *= dt
    this.z *= dt
    this.xm *= dt
    this.ym *= dt
    this.zm *= dt

    return this
  }
}
