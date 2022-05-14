import {Ball} from "../GameObjects/Ball";
import {Hit} from "../helpers/Hit";
import {V3, V3Add, V3Cross, V3RotateOn2D, V3Sub, V3TimeScalar, V3ToUnit, V3Val, Vector3} from "../helpers/Vector3";
import {BALL_SIZE} from "../helpers/Constants";
import {BallState, Vector3Angle} from "../helpers/helpers";
import {EventType, PoolEvent} from "./Event";

const g = 9.81 // gravity
const R = BALL_SIZE
const u_s = 0.2 // 0.2 sliding friction
const u_r = 0.01 // 0.01 rolling friction
const u_sp = 10 * 2/5*R/9 // spinning friction


export class Physics {
  balls: Ball[] // [0] is white
  calculating: boolean = false
  time: number = 0
  lastTime: number = 0
  eventIndex: number = 0
  ballsFuture: Ball[][] = []
  counter = 0
  deb = false

  constructor(balls: Ball[]) {
    this.balls = balls
  }

  getPositions(): Ball[]{
    if(this.ballsFuture.length < 2) return this.ballsFuture[0]
    return this.ballsFuture.shift()!
  }

  physicsLoop(){
    const dt = (Date.now() - this.lastTime) / 1000
    //if(this.balls[0].state != BallState.stationary)
      //console.log(JSON.parse(JSON.stringify(this.balls[0])))
    this.lastTime = Date.now()

    this.evolve(dt)
    let events = this.detectEvents()
    events.forEach((ev) => {
      this.counter+=1
      this.deb = true
      this.resolve(ev)
    })
  }

  simulateEvents(){

  }

  evolve(dt: number){

    this.balls.forEach((ball) => Physics.evolveBall(ball, dt))

    const finished = this.balls.every((ball) => ball.state == BallState.stationary)
    if(finished){
      this.calculating = false
    }
  }

  resolve(event: PoolEvent){
    if(event.type == EventType.BallBall){
      let ball1 = this.balls[event.agentsIds[0]]
      let ball2 = this.balls[event.agentsIds[1]]

      Physics.applyBallBallCollision(ball1, ball2)
    }
  }

  detectEvents(): PoolEvent[] {
    let events: PoolEvent[] = []
    this.balls.forEach((ball1, i1) => {
      this.balls.forEach((ball2, i2) => {
        if (i1 >= i2) {
          return
        }
        if (ball1.state == BallState.stationary && ball2.state == BallState.stationary) {
          return;
        }
        //console.log(V3Val(V3Sub(ball1.position, ball2.position)), 0.4)
        if (V3Val(V3Sub(ball1.position, ball2.position)) < R * 2) {
          events.push(new PoolEvent(EventType.BallBall, [ball1.id, ball2.id], 0))
        }
      })
    })

    return events
  }

  hit(hit: Hit){
    if(this.calculating) return;
    this.calculating = true
    this.time = Date.now()
    this.balls[0].velocity = V3TimeScalar(hit.direction, hit.strength)
    this.balls[0].spin = {x: 0, y: 0, z: 0} // MAth.Pi*4
    this.balls[0].state = BallState.sliding// MAth.Pi*4
    this.lastTime = Date.now()
    this.simulateEvents()
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
    const phi = Vector3Angle(ball.velocity)
    const vel_R = V3RotateOn2D(ball.velocity, -phi)
    const spin_R = V3RotateOn2D(ball.spin, -phi)

    // relative velocity unit vector ball frame
    const rel = this.getRelativeVelocity(ball.velocity, ball.spin)
    const rel_U = V3ToUnit(rel)

    let vel_U = V3RotateOn2D(rel_U, -phi)



    const pos_B = {
      x: vel_R.x*t - .5*u_s*g*t*t * vel_U.x,
      y: .5*u_s*g*t*t* vel_U.y,
      z: 0
    }
    const vel_B = V3Sub(vel_R, V3TimeScalar(vel_U, u_s*g*t))

    const cross = V3Cross(vel_U, V3(0,0,1))
    const scal = (2.5/R)*u_s*g*t
    const spin_B = V3Sub(spin_R, V3TimeScalar(cross, scal))
    spin_B.z = this.get_perpendicular_spin_state(ball.spin, t).z

    ball.position = V3Add(ball.position, V3RotateOn2D(pos_B, -phi))
    ball.velocity = V3RotateOn2D(vel_B, phi)
    ball.spin = V3RotateOn2D(spin_B, phi)
  }

  private static apply_ball_roll(ball: Ball, t: number){
    const vel_Unit = V3ToUnit(ball.velocity)

    const pos_T = V3Sub(V3Add(ball.position, V3TimeScalar(ball.velocity, t)), V3TimeScalar(vel_Unit, u_r*g*t*t*0.5))
    const vel_T = V3Sub(ball.velocity, V3TimeScalar(vel_Unit, u_r*g*t))
    const spin_not_R = V3TimeScalar(vel_T, 1/R)
    const spin_T = V3RotateOn2D(spin_not_R, Math.PI / 2)

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
    const n = V3ToUnit(V3Sub(ball1.position, ball2.position))
    const t = V3RotateOn2D(n, -Math.PI/2)

    const beta = Vector3Angle(velRelative, n)


    ball1.velocity = V3Add(V3TimeScalar(t, velValue*Math.sin(beta)), v2)
    ball2.velocity = V3Add(V3TimeScalar(n, velValue*Math.cos(beta)), v2)

    ball1.state = BallState.sliding
    ball2.state = BallState.sliding
  }
}