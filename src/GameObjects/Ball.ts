import {GameObject} from "./GameObject";
import {V3TimeScalar, V3ToArrayWebgl, Vector3} from "../helpers/Vector3";
import {BallPosVelSpin, BallState, pointsOnCircle} from "../helpers/helpers";
import {BALL_SIZE, FOV, PHYSICS_SCALE, WHITE} from "../helpers/Constants";
import * as mat4 from "../matrix/mat4";
import {Transform} from "./Transform";
import {IAgent} from "../Physics/IAgent";

const SCALE = 1
const SIZE = BALL_SIZE

export class Ball extends GameObject implements IAgent{
  id: number = -Infinity
  position: Vector3 = {x: 0, y: 0, z: 0}
  //positionHistory: Vector3[] = []
  color: number[] = []
  type: number = 0 // 0 - white;  1 - color;  2 - grid;  3 - black
  velocity: Vector3 = {x: 0, y: 0, z: 0}
  //velocityHistory: Vector3[] = []
  spin: Vector3 = {x: 0, y:0, z:0} // podkręcenie
  //spinHistory: Vector3[] = []
  indices2Length: number = 0
  state: BallState = BallState.stationary


  constructor(gl: WebGL2RenderingContext, programInfo: any, color: number[], position: Vector3, type: number = 0, id:number, skip: boolean = false) {
    super(gl, programInfo);
    if(skip) return;
    this.color = color
    this.position = position
    this.type = type
    this.buffers = this.initBuffers();
    this.indices2Length = Ball.getIndices(2).length
    this.id = id
  }

  clone(): Ball{
    const ball = new Ball(this.gl, this.programInfo, this.color, this.position, this.type, this.id, true)
    ball.color = this.color
    ball.position = {...this.position} // deep
    ball.type = this.type
    ball.buffers = this.buffers
    ball.indices2Length = this.indices2Length
    ball.velocity = {...this.velocity} // deep
    ball.spin = {...this.spin} // deep
    ball.state = this.state
    ball.id = this.id
    //ball.positionHistory = this.positionHistory
    //ball.velocityHistory = this.velocityHistory
    //ball.spinHistory = this.spinHistory
    return ball
  }

  setPosVelSpinState(x: BallPosVelSpin, s: BallState){
    this.position = x.pos
    this.velocity = x.vel
    this.spin = x.spin
    this.state = s
  }

  initBuffers() {
    const gl = this.gl
    function genBuffer(i: number, color: number[]){
      const positionBuffer = gl.createBuffer();

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

      const positions = Ball.getPositions(i)
      const indices = Ball.getIndices(i);
      gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array(positions),
        gl.STATIC_DRAW);
      let colors: number[] = [];

      for (let j = 0; j < indices.length; ++j) {
        colors = colors.concat(color);
      }

      const colorBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

      const indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices), gl.STATIC_DRAW);
      return {
        position: positionBuffer,
        color: colorBuffer,
        indices: indexBuffer,
      }
    }
    return [genBuffer(0, this.color), genBuffer(1, WHITE), genBuffer(2, [0.0, 0.0, 0.0, 1])]
  }

  draw(cameraTransform: Transform, tablePosition: Vector3){
    const gl = this.gl
    const buffersArr = this.buffers
    const programInfo = this.programInfo
    const position = V3TimeScalar(this.position, PHYSICS_SCALE)

    const fieldOfView = FOV * Math.PI / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;

    const projectionMatrix = mat4.create();

    const indices2Length = this.indices2Length

    mat4.perspective(projectionMatrix,
      fieldOfView,
      aspect,
      zNear,
      zFar);




/*    mat4.rotate(modelViewMatrix,
      modelViewMatrix,
      cameraTransform.rotation.x,
      [1, 0, 0])
    mat4.rotate(modelViewMatrix,
      modelViewMatrix,
      cameraTransform.rotation.y,
      [0, 1, 0])
*/

    drawShadow()
    drawPart(0, this.type)
    drawPart(1, 0)

    function drawShadow(){

      const modelViewMatrix = mat4.create();
      mat4.translate(modelViewMatrix,
        modelViewMatrix,
        V3ToArrayWebgl(tablePosition))
      mat4.translate(modelViewMatrix,
        modelViewMatrix,
        [0.0, 0.001, 0.0])



      mat4.rotate(modelViewMatrix,
        modelViewMatrix,
        cameraTransform.rotation.x,
        [1, 0, 0])
      mat4.rotate(modelViewMatrix,
        modelViewMatrix,
        cameraTransform.rotation.y,
        [0, 1, 0])

      mat4.translate(modelViewMatrix,
        modelViewMatrix,
        V3ToArrayWebgl(cameraTransform.position))

      mat4.translate(modelViewMatrix,
        modelViewMatrix,
        V3ToArrayWebgl(V3TimeScalar(position, SCALE)))

      mat4.rotate(modelViewMatrix,
        modelViewMatrix,
        -cameraTransform.rotation.y,
        [0, 1, 0])
      mat4.scale(modelViewMatrix,modelViewMatrix, [SIZE*.9, SIZE, SIZE*.4])
      mat4.rotate(modelViewMatrix,
        modelViewMatrix,
        - Math.PI/2,
        [1, 0, 0])
      const buffers = buffersArr[2]

      {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
          programInfo.attribLocations.vertexPosition,
          numComponents,
          type,
          normalize,
          stride,
          offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
      }

      {
        const numComponents = 4;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
        gl.vertexAttribPointer(
          programInfo.attribLocations.vertexColor,
          numComponents,
          type,
          normalize,
          stride,
          offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
      }

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

      gl.useProgram(programInfo.program);


      gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
      gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);
      gl.uniform4fv(programInfo.uniformLocations.accentColor, [0.0, 0.0, 0.0, 1])
      gl.uniform1i(programInfo.uniformLocations.modelTextureType, 0);

      {
        const offset = 0;
        const vertexCount = indices2Length;
        const type = gl.UNSIGNED_SHORT;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
      }

    }

    function drawPart(i: number, type: number) {

      const modelViewMatrix = mat4.create();
      mat4.translate(modelViewMatrix,
        modelViewMatrix,
        V3ToArrayWebgl(tablePosition))
      mat4.translate(modelViewMatrix,
        modelViewMatrix,
        [0.0, SIZE, 0.0])



      mat4.rotate(modelViewMatrix,
        modelViewMatrix,
        cameraTransform.rotation.x,
        [1, 0, 0])
      mat4.rotate(modelViewMatrix,
        modelViewMatrix,
        cameraTransform.rotation.y,
        [0, 1, 0])

      mat4.translate(modelViewMatrix,
        modelViewMatrix,
        V3ToArrayWebgl(cameraTransform.position))

      mat4.translate(modelViewMatrix,
        modelViewMatrix,
        V3ToArrayWebgl(V3TimeScalar(position, SCALE)))

      mat4.scale(modelViewMatrix,modelViewMatrix, [SIZE, SIZE, SIZE])
      mat4.rotate(modelViewMatrix,
        modelViewMatrix,
        -cameraTransform.rotation.y,
        [0, 1, 0])
      mat4.rotate(modelViewMatrix,
        modelViewMatrix,
        -cameraTransform.rotation.x,
        [1, 0, 0])
      const buffers = buffersArr[i]

      {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
          programInfo.attribLocations.vertexPosition,
          numComponents,
          type,
          normalize,
          stride,
          offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
      }

      {
        const numComponents = 4;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
        gl.vertexAttribPointer(
          programInfo.attribLocations.vertexColor,
          numComponents,
          type,
          normalize,
          stride,
          offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
      }

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

      gl.useProgram(programInfo.program);


      gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
      gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);
      gl.uniform4fv(programInfo.uniformLocations.accentColor, [0.0, 0.0, 0.0, 1])
      gl.uniform1i(programInfo.uniformLocations.modelTextureType, [0, 0, 1, 0][type]);

      {
        const offset = 0;
        const vertexCount = indices2Length;
        const type = gl.UNSIGNED_SHORT;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
      }

    }
  }

  static getPositions(i: number) {
    const points = [...Array(31).keys()].map((i) => pointsOnCircle(1, (360/30)*i)).flat()
    return [
      [0.0, 0.0, 0.0, ...points],
      [
        -.6, 0.7, 0.0,
        -.6, 0.45, 0.0,
        -0, 0.45, 0.0,
        -0, 0.7, 0.0
      ],
      [0.0, 0.0, 0.0, ...points]
    ][i]
  }

  static getIndices(i: number) {
    return [
      [...Array(31).keys()].map((i) => [0, i, i + 1]).flat(),
      [
        0, 1, 2,
        0, 2, 3
      ],
      [...Array(31).keys()].map((i) => [0, i, i + 1]).flat(),
    ][i]
  }
}