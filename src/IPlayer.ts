export abstract class IPlayer{
  public abstract getInput(): PlayerInput
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
