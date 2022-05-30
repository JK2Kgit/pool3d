import {Transform} from "../GameObjects/Transform";
import {V3, V3TimeScalar, Vector3} from "../helpers/Vector3";
import {Hit} from "../helpers/Hit";
import {GameStage} from "../helpers/helpers";
import {Vector2} from "../helpers/Vector2";
import {Game} from "../Game";

export abstract class IPlayer{
  on: boolean = false
  ballPos: Vector3 = V3(0,Math.random() - .5,0)
  cameraTransformInv: Transform = new Transform({x: 0, y: 0, z: 0}, {x: 0, y: 0, z: Math.PI/ 5.7}) // roattion ok , position inverted
  game: Game | undefined
  hitCallback: (hit: Hit) => void = (_hit: Hit) => {}
  placeCallback: (pos: Vector3) => void = (_pos: Vector3) => {}
  switchCallback: () => void = () => {}
  public setTransform(t: Transform): void{
    this.cameraTransformInv = new Transform(V3TimeScalar(t.position, -1), t.rotation)
  }
  public referenceGame(game: Game){
    this.game = game
  }
  public abstract handleInput(dt:number, stage:GameStage): {T: Transform, C: boolean, ballPos: Vector3, hitPlace: Vector2}
  public abstract getStrength(): number
  public abstract isAi(): boolean
}