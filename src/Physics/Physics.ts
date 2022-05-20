import {Ball} from "../GameObjects/Ball";
import {Hit} from "../helpers/Hit";
import {V3, V3Add, V3Cross, V3RotateOn2D, V3Sub, V3TimeScalar, V3ToUnit, V3Val, Vector3} from "../helpers/Vector3";
import {BALL_SIZE, TOL, UPS} from "../helpers/Constants";
import {BallState} from "../helpers/helpers";
import {EventType, PoolEvent} from "./Event";
import {V2, V2Angle} from "../helpers/Vector2";
import {solveQuartic} from "../helpers/Polynomia";

const g = 9.81 // gravity
const R = BALL_SIZE
const u_s = 0.2 // 0.2 sliding friction
const u_r = 0.01 // 0.01 rolling friction
const u_sp = 10 * 2/5*R/9 // spinning friction


export class Physics {
  balls: Ball[] // [0] is white
  time: number = 0
  ballsFuture: Ball[][] = []
  history: {balls: Ball[][], index: number[], time: number[], event: (PoolEvent | undefined)[]} = {balls: [], event: [], index: [], time: []}
  frames = 0
  n = -1
  lastEvenet: PoolEvent | undefined = undefined

  constructor(balls: Ball[], frames: number) {
    this.balls = balls
    this.frames = frames
    this.ballsFuture.push(this.balls.map((b) => b.clone()))
  }

  isCalculating(): boolean{
    return this.ballsFuture.length > 1
  }

  getPositionsNew(): Ball[]{
    console.log(this.ballsFuture[0][0].state)
    if(this.ballsFuture.length < 2){
      this.balls = this.ballsFuture[0]
      return this.ballsFuture[0]
    }
    return this.ballsFuture.shift()!
  }

  timestamp(dt: number, event: PoolEvent | undefined = undefined){
    this.n+=1
    this.time += dt

    this.history.time.push(this.time)
    this.history.index.push(this.n)

    this.history.event.push(event)

    this.history.balls.push(this.balls.map((b) => b.clone()))


  }

  generatePositions(dt: number){
    console.log("AAAAAAAAAAAAAAAAA")
    const oldHistory = this.history
    this.history = {balls: [], event: [], index: [], time: []}
    this.n = -1
    this.time = 0
    this.balls = oldHistory.balls[0]
    this.timestamp(0)
    let dtPrime = dt
    for (let i = 0; i < oldHistory.event.length; i++) {
      const event = oldHistory.event[oldHistory.index[i]]
      const o1 = JSON.parse(JSON.stringify(this.balls))
      if(event == undefined)
        continue

      if(event.tau == Infinity)
        break;

      let evenetTime = 0
      while (evenetTime < (event.tau - dtPrime)){
        this.balls = oldHistory.balls[oldHistory.index[i - 1]].map((b) => b.clone())
        this.evolve(evenetTime + dtPrime)
        this.timestamp(evenetTime + dtPrime, event)
        evenetTime += dtPrime
        dtPrime = dt
      }

      dtPrime = dt - (event.tau - evenetTime)
      //console.log(event, o1, JSON.parse(JSON.stringify(this.balls)))
      this.balls = oldHistory.balls[oldHistory.index[i]]
    }

    this.ballsFuture = this.history.balls
  }

  simulateEvents(){
    let event = new PoolEvent(EventType.None, [], 0)
    this.timestamp(0)

    while (event.tau < Infinity){
      event = this.getNextEvent()
      this.evolve(event.tau)

      this.resolve(event)
      this.timestamp(event.tau, event)
    }
    console.log(JSON.parse(JSON.stringify(this.history)))
    this.generatePositions(1/ UPS)


  }

  getNextEvent(): PoolEvent{
    let eventMin = new PoolEvent(EventType.None, [], Infinity)
    {
      let ev = this.getMinMotionEvent()
      if(ev.tau < eventMin.tau)
        eventMin = ev
    }
    {
      let ev = this.getMinBallBallEvent()
      if(ev.tau < eventMin.tau){
        eventMin = ev
        console.log(ev)
      }
    }
    //console.log(JSON.parse(JSON.stringify(eventMin)))

    return eventMin
  }

  getMinMotionEvent(): PoolEvent{
    let tauMin = Infinity
    let agentIds: number[] = []
    let typeMin: EventType = EventType.None
    this.balls.forEach((ball) => {
      let tau = 0
      let type: EventType = EventType.None
      if(ball.state == BallState.stationary){
        return
      }
      else if(ball.state == BallState.rolling){
        tau = Physics.getRollTime(ball.velocity)
        const tau_spin = Physics.getSpinTime(ball.spin)
        type = tau_spin > tau ? EventType.RollingSpinning : EventType.RollingStationary
      }
      else if(ball.state == BallState.sliding){
        tau = Physics.getSlideTime(ball.velocity, ball.spin)
        type = EventType.SlidingRolling
      }
      else if(ball.state == BallState.spining){
        tau = Physics.getSpinTime(ball.spin)
        type = EventType.SpinningStationary
      }
      if(tau < tauMin){
        tauMin = tau
        agentIds = [ball.id]
        typeMin = type
      }
    })

    return new PoolEvent(typeMin, agentIds, tauMin)
  }

  getMinBallBallEvent(): PoolEvent{
    let tauMin = Infinity
    let agentIds: number[] = []
    this.balls.forEach((ball1, i1) => {
      this.balls.forEach((ball2, i2) => {
        if (i1 >= i2)
          return;

        if (ball1.state == BallState.stationary && ball2.state == BallState.stationary)
          return;

        let tau = Physics.getCollisionTime(ball1, ball2);

        if(tau < tauMin){
          tauMin = tau
          agentIds = [ball1.id, ball2.id]
        }
      })
    })

    return new PoolEvent(EventType.BallBall, agentIds, tauMin)
  }

  evolve(dt: number){
    this.balls.forEach((ball) => Physics.evolveBall(ball, dt))

  }

  resolve(event: PoolEvent){
    if(event.type == EventType.BallBall){
      let ball1 = this.balls[event.agentsIds[0]]
      let ball2 = this.balls[event.agentsIds[1]]

      Physics.applyBallBallCollision(ball1, ball2)
    }
  }

  hit(hit: Hit){
    if(this.isCalculating()) return;
    this.balls[0].velocity = V3TimeScalar(hit.direction, hit.strength)
    this.balls[0].spin = {x: Math.PI*0, y: 0, z: 0} // MAth.Pi*4
    this.balls[0].state = BallState.sliding// MAth.Pi*4
    this.history = {balls: [], event: [], index: [], time: []}
    console.log("start")
    this.simulateEvents()
    console.log(JSON.parse(JSON.stringify(this.history)))
  }

  private static getCollisionTime(ball1: Ball, ball2: Ball): number {
    let c1 = ball1.position
    let c2 = ball2.position
    let lg = [JSON.parse(JSON.stringify( ball1)), JSON.parse(JSON.stringify( ball2))]

    let a1 = V2(0, 0)
    let b1 = V2(0, 0)
    if(ball1.state == BallState.rolling || ball1.state == BallState.sliding){
      const phi = V2Angle(ball1.velocity)
      const vVal = V3Val(ball1.velocity)

      const u = ball1.state == BallState.rolling ? V3(1,0,0) : V3RotateOn2D(V3ToUnit(Physics.getRelativeVelocity(ball1.velocity, ball1.spin)), -phi)
      const friction = ball1.state == BallState.rolling ? u_r : u_s

      a1.x = -0.5* friction*g*(u.x*Math.cos(phi) - u.y*Math.sin(phi))
      a1.y = -0.5* friction*g*(u.x*Math.sin(phi) + u.y*Math.cos(phi))

      b1.x = vVal*Math.cos(phi)
      b1.y = vVal*Math.sin(phi)
    }

    let a2 = V2(0, 0)
    let b2 = V2(0, 0)
    if(ball2.state == BallState.rolling || ball2.state == BallState.sliding){
      const phi = V2Angle(ball2.velocity)
      const vVal = V3Val(ball2.velocity)

      const u = ball2.state == BallState.rolling ? V3(1,0,0) : V3RotateOn2D(V3ToUnit(Physics.getRelativeVelocity(ball2.velocity, ball2.spin)), -phi)
      const friction = ball2.state == BallState.rolling ? u_r : u_s

      a2.x = -0.5* friction*g*(u.x*Math.cos(phi) - u.y*Math.sin(phi))
      a2.y = -0.5* friction*g*(u.x*Math.sin(phi) + u.y*Math.cos(phi))

      b2.x = vVal*Math.cos(phi)
      b2.y = vVal*Math.sin(phi)
    }
    //console.log(a1, a2,b1,b2,c1,c2)

    const A = V2(a2.x-a1.x, a2.y-a1.y)
    const B = V2(b2.x-b1.x, b2.y-b1.y)
    const C = V2(c2.x-c1.x, c2.y-c1.y)

    //console.log(A,B,C)

    //OK
    const a = A.x*A.x  +  A.y*A.y
    const b = 2*A.x*B.x  +  2*A.y*B.y
    const c = B.x*B.x  +  2*A.x*C.x  +  2*A.y*C.y  +  B.y*B.y
    const d = 2*B.x*C.x  +  2*B.y*C.y
    const e = C.x*C.x  +  C.y*C.y  -  4*R*R

    let result = solveQuartic(a,b,c,d,e).filter((res)=> Math.abs(res.im) < TOL && res.re > TOL).map((res) => res.re)
    //console.log(result, a,b,c,d,e, A, B, C)
    if(lg[0].position.x == 1.8279699037845252)
      console.log(result.length > 0 ? Math.min(...result) : Infinity, lg, a1, a2,b1,b2,c1,c2,result, a,b,c,d,e, A, B, C)
    return result.length > 0 ? Math.min(...result) : Infinity
  }

  private static getRelativeVelocity(vel: Vector3, spin: Vector3){
    const v3 = V3(0,0,1)
    const v3cross = V3Cross(v3, spin)
    const scaled = V3TimeScalar(v3cross , R)
    return V3Add(scaled, vel)
  }

  private static getSlideTime(vel: Vector3, spin: Vector3){
    return (2*V3Val(this.getRelativeVelocity(vel, spin)))/(7*u_s*g)
  }

  private static getRollTime(vel: Vector3){
    return V3Val(vel) / (u_r * g)
  }
  private static getSpinTime(spin: Vector3){
    return Math.abs(spin.z) * (2/5)*((R/u_sp)/g)
  }

  private static evolveBall(ball: Ball, t: number){// Spin along y axis
    if(t < 0) throw Error("Negative time")

    if(ball.state == BallState.stationary)
      return ball

    if(ball.state == BallState.sliding){
      const t_slide = this.getSlideTime(ball.velocity, ball.spin)
      if(t < t_slide){
        this.apply_ball_slide(ball, t)
        ball.state = BallState.sliding
        return ball
      }else if(t_slide > 0){
        this.apply_ball_slide(ball, t_slide)
        t -= t_slide
        ball.state = BallState.rolling
      }

    }
    if(ball.state == BallState.rolling){
      const t_roll = this.getRollTime(ball.velocity)
      if(t < t_roll){
        this.apply_ball_roll(ball, t)
        ball.state = BallState.rolling
        return ball
      }else if (t_roll > 0){
        this.apply_ball_roll(ball, t_roll)
        t -= t_roll
        ball.state = BallState.spining
      }

    }
    if(ball.state == BallState.spining){
      const t_spin = this.getSpinTime(ball.spin)
      if(t < t_spin){
        this.apply_ball_spin( ball, t)
        ball.state = BallState.spining
        return ball
      }else if (t_spin > 0){
        this.apply_ball_spin( ball, t_spin)
        ball.state = BallState.stationary
        return ball
      }

    }
    ball.state = BallState.stationary
    return ball
  }

  private static apply_ball_slide(ball: Ball, t: number){
    const phi = V2Angle(ball.velocity)

    const pos_R = V3RotateOn2D(ball.position, -phi)
    const vel_R = V3RotateOn2D(ball.velocity, -phi)
    const spin_R = V3RotateOn2D(ball.spin, -phi)

    // relative velocity unit vector ball frame
    const rel = this.getRelativeVelocity(ball.velocity, ball.spin)
    const rel_U = V3ToUnit(rel)
    let vel_U = V3RotateOn2D(rel_U, -phi)


    const pos_B = {
      x: vel_R.x*t - .5*u_s*g*t*t * vel_U.x,
      y: -.5*u_s*g*t*t*vel_U.y,
      z: 0
    }
    const vel_B = V3Sub(vel_R, V3TimeScalar(vel_U, u_s*g*t))

    const cross = V3Cross(vel_U, V3(0,0,1))
    const scal = (2.5/R)*u_s*g*t
    const spin_B = V3Sub(spin_R, V3TimeScalar(cross, scal))
    spin_B.z = this.get_perpendicular_spin_state(ball.spin, t).z

    const pos_Debug =V3RotateOn2D(pos_B, phi)

    ball.position = V3Add(ball.position, pos_Debug)
    ball.velocity = V3RotateOn2D(vel_B, phi)
    ball.spin = V3RotateOn2D(spin_B, phi)
  }

  private static apply_ball_roll(ball: Ball, t: number){
    const vel_Unit = V3ToUnit(ball.velocity)

    const pos_T = V3Sub(V3Add(ball.position, V3TimeScalar(ball.velocity, t)), V3TimeScalar(vel_Unit, u_r*g*t*t*0.5))
    const vel_T = V3Sub(ball.velocity, V3TimeScalar(vel_Unit, u_r*g*t))
    const spin_not_R = V3TimeScalar(vel_T, 1/R)
    const spin_T = V3RotateOn2D(spin_not_R, Math.PI *.5)

    spin_T.z = this.get_perpendicular_spin_state(ball.spin, t).z
    ball.position = pos_T
    ball.velocity = vel_T
    ball.spin = spin_T
  }

  private static apply_ball_spin(ball: Ball, t: number) {
    ball.spin.z = this.get_perpendicular_spin_state(ball.spin, t).z
  }

  private static get_perpendicular_spin_state(spin: Vector3, t: number): Vector3{
    spin.z -= (spin.z > 0 ? 1 : -1) * Math.min(Math.abs(spin.z) ,(5/2)/(R*u_sp*g*t))
    return spin
  }

  private static applyBallBallCollision(ball1: Ball, ball2: Ball){
    const v2 = {...ball2.velocity}
    const velRelative = V3Sub(ball1.velocity, ball2.velocity)
    const velValue = V3Val(velRelative)
    const n = V3ToUnit(V3Sub(ball2.position, ball1.position))
    const t = V3RotateOn2D(n, Math.PI/2)

    const beta = V2Angle(velRelative, n)

    const s1 = velValue*Math.sin(beta)
    const s2 = velValue*Math.cos(beta)

    ball1.velocity = V3Add(V3TimeScalar(t, s1), v2)
    ball2.velocity = V3Add(V3TimeScalar(n, s2), v2)

    ball1.state = BallState.sliding
    ball2.state = BallState.sliding
  }
}