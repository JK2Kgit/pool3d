import {Transform} from "../GameObjects/Transform";
import {V3TimeScalar} from "../helpers/Vector3";
import {Hit} from "../helpers/Hit";

export abstract class IPlayer{
  cameraTransformInv: Transform = new Transform({x: 0, y: 0, z: 0}, {x: 0, y: 0, z: Math.PI/ 5.7}) // roattion ok , position inverted
  hitCallback: (hit: Hit) => void = (_hit: Hit) => {}
  public setTransform(t: Transform): void{
    this.cameraTransformInv = new Transform(V3TimeScalar(t.position, -1), t.rotation)
  }
  public abstract handleInput(dt:number): {T: Transform, C: boolean}
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
