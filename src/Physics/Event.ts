export class PoolEvent{
  public type: EventType
  public agentsIds: number[]
  public tau: number
  public sound: string | undefined
  constructor(type: EventType, agentsIds: number[], tau: number, sound: string | undefined = undefined) {
    this.type = type
    this.agentsIds = agentsIds
    this.tau = tau
    this.sound = sound
  }
}

export enum EventType{
  None,
  BallBall,
  BallRail,
  RollingSpinning,
  RollingStationary,
  SlidingRolling,
  SpinningStationary
}