export class PoolEvent{
  public type: EventType
  public agentsIds: number[]
  public tau: number
  constructor(type: EventType, agentsIds: number[], tau: number) {
    this.type = type
    this.agentsIds = agentsIds
    this.tau = tau
  }
}

export enum EventType{
  None,
  BallBall,
  BallRail
}