import {Ball} from "./GameObjects/Ball";
import {Hit} from "./helpers/Hit";
import {
  V3Add,
  V3AbsLessThan,
  V3Sub,
  V3TimeScalar,
  V3Val,
  Vector3,
  V3Cross,
  V3,
  V3Rotate, V3ToUnit, V3Mul
} from "./helpers/Vector3";
import {BALL_SIZE, EPSILON} from "./helpers/Constants";
import {STATE, Vector3Angle} from "./helpers/helpers";

const g = 9.81 // gravity
const R = BALL_SIZE
const u_s = 0.04 // 0.2 sliding friction
const u_r = 0.02 // 0.01 rolling friction
const u_sp = 10 * 2/5*R/9 // spinning friction


export class Physics {
  balls: Ball[] // [0] is white
  ballsCopy: Ball[] = []
  calculating: boolean = false
  hitTime: number = 0

  constructor(balls: Ball[]) {
    this.balls = balls
  }

  getPositions(time: number): Ball[]{
    const t = (time - this.hitTime) / 1000
    if(!this.calculating) return this.balls


    const states = this.ballsCopy.map((ball, i) => Physics.calculateBall(ball, this.balls[i], t))


    const finished  = this.ballsCopy.every((ball) => V3AbsLessThan(ball.velocity, EPSILON) && V3AbsLessThan(ball.spin, EPSILON))
    if(finished){
      this.calculating = false
      this.balls = this.ballsCopy
    }
    //console.log(states)
    return this.ballsCopy
  }

  hit(hit: Hit){
    if(this.calculating) return;
    this.calculating = true
    this.hitTime = Date.now()
    this.ballsCopy = this.balls.map((ball) => ball.clone())
    this.balls[0].velocity = V3TimeScalar(hit.direction, hit.strength)
    this.balls[0].spin = {x: 0, y: 0, z: Math.PI*4}
  }

  private static getRelativeVelocity(vel: Vector3, spin: Vector3){
    return V3Add(V3TimeScalar(V3Cross(V3(0,1,0), spin) , R), vel)
  }

  private static getSlideTime(vel: Vector3, spin: Vector3){
    return (2*V3Val(this.getRelativeVelocity(vel, spin)))/(7*u_s*g)
  }

  private static getRollTime(vel: Vector3){
    return V3Val(vel) / (u_r * g)
  }
  private static getSpinTime(spin: Vector3){
    return Math.abs(spin.y) * (2/5)*((R/u_sp)/g)
  }

  private static calculateBall(nBall: Ball, ball: Ball, t: number): STATE{// Spin along y axis
    if(t < 0) throw Error("Negative time")
    const t_slide = this.getSlideTime(ball.velocity, ball.spin)
    if(t < t_slide){
      this.apply_ball_slide(nBall, ball, t)
      return STATE.sliding
    }else {
      this.apply_ball_slide(nBall, ball, t_slide)
      t -= t_slide
    }
    ball = nBall.clone()
    const t_roll = this.getRollTime(ball.velocity)
    if(t < t_roll){
      this.apply_ball_roll(nBall, ball, t)
      return STATE.rolling
    }else {
      this.apply_ball_roll(nBall, ball, t_roll)
      t -= t_roll
    }
    ball = nBall.clone()
    const t_spin = this.getSpinTime(ball.spin)
    if(t < t_spin){
      this.apply_ball_spin(nBall, ball, t)
      return STATE.spining
    }else {
      this.apply_ball_spin(nBall, ball, t_spin)
      return STATE.stationary
    }



    /*
    if(t <= ((2*R)/(5*u_sp*g))*ball.spin.y)
      nBall.spin.y = ball.spin.y - ((5*u_sp*g)/(2*R))*t
    else
      nBall.spin.y = 0

    //console.log(t, V3Val(ball.velocity), 1/(u_r*g*t), V3TimeScalar(ball.velocity, u_r*g*t))
    if(t <= 1/(u_r*g)){
      nBall.velocity =
      nBall.position = V3Sub(V3Add(ball.position, V3TimeScalar(ball.velocity, t)), V3TimeScalar(ball.velocity, u_r*g*t*t*0.5))
    }
    else{
      let t = 1/(u_r*g)
      nBall.velocity = V3Z()
      nBall.position = V3Sub(V3Add(ball.position, V3TimeScalar(ball.velocity, t)), V3TimeScalar(ball.velocity, u_r*g*t*t*0.5))
    }
    nBall.spin.z = nBall.velocity.x / R*/
  }

  private static apply_ball_slide(nBall: Ball, ball: Ball, t: number){
    const phi = Vector3Angle(ball.velocity)
    const vel_R = V3Rotate(ball.velocity, phi)
    const spin_R = V3Rotate(ball.spin, phi)

    // relative velocity unit vector ball frame
    let vel_U = V3Rotate(V3ToUnit(this.getRelativeVelocity(ball.velocity, ball.spin)), -phi)

    const pos_B = V3Mul(V3(-0.5*u_s*g*t*t, 0, -vel_R.z*t + .5*u_s*g*t*t), vel_U)
    const vel_B = V3Sub(vel_R, V3TimeScalar(vel_U, u_s*g*t))

    const spin_B = V3Sub(spin_R, V3TimeScalar(V3Cross(V3(0,1,0), vel_U),(5/2)/(R*u_s*g*t)))
    spin_B.y = this.get_perpendicular_spin_state(ball.spin, t).y

    //console.log(phi, vel_R, vel_U, vel_B)
    //console.log(V3(vel_R.x*t - .5*u_s*g*t*t, 0, -0.5*u_s*g*t*t), vel_U, pos_B)
    nBall.position = V3Add(V3Rotate(pos_B, phi), ball.position)
    nBall.velocity = V3Rotate(vel_B, phi)
    nBall.spin = V3Rotate(spin_B, phi)
  }

  private static apply_ball_roll(nBall: Ball, ball: Ball, t: number){
    const vel_Unit = V3ToUnit(ball.velocity)

    const pos_T = V3Sub(V3Add(ball.position, V3TimeScalar(ball.velocity, t)), V3TimeScalar(vel_Unit, u_r*g*t*t*0.5))
    const vel_T = V3Sub(ball.velocity, V3TimeScalar(vel_Unit, u_r*g*t))
    const spin_T = V3Rotate(V3TimeScalar(vel_T, 1/R), Math.PI / 2)

    spin_T.y = this.get_perpendicular_spin_state(ball.spin, t).y
    nBall.position = pos_T
    nBall.velocity = vel_T
    nBall.spin = spin_T
  }

  private static apply_ball_spin(nBall: Ball, ball: Ball, t: number): Vector3 {
    nBall.spin.y = this.get_perpendicular_spin_state(ball.spin, t).y
  }

  private static get_perpendicular_spin_state(spin: Vector3, t: number): Vector3{
    spin.y -= (spin.y > 0 ? 1 : -1) * Math.min(Math.abs(spin.y) ,(5/2)/(R*u_sp*g*t))
    return spin
  }
}