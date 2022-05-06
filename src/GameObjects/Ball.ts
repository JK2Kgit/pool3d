import {GameObject} from "./GameObject";
import {Vector3, V3TimeScalar, V3ToArray} from "../helpers/Vector3";
import {pointsOnCircle} from "../helpers/helpers";
import {BALL_SIZE, FOV, WHITE} from "../helpers/Constants";
import * as mat4 from "../matrix/mat4";
import {Transform} from "./Transform";

const SCALE = 1
const SIZE = BALL_SIZE

export class Ball extends GameObject{
  position: Vector3
  color: number[]
  type: number = 0 // 0 - white;  1 - color;  2 - grid;  3 - black
  velocity: Vector3 = {x: 0, y: 0, z: 0}
  spin: Vector3 = {x: 0, y:0, z:0} // podkręcenie


  constructor(gl: WebGL2RenderingContext, programInfo: any, color: number[], position: Vector3, type: number = 0) {
    super(gl, programInfo);
    this.color = color
    this.position = position
    this.type = type
    this.buffers = this.initBuffers();
  }

  clone(): Ball{
    const ball = new Ball(this.gl, this.programInfo, this.color, this.position, this.type)
    ball.velocity = this.velocity
    ball.spin = this.spin
    return ball
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
    const position = this.position

    const fieldOfView = FOV * Math.PI / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;

    const projectionMatrix = mat4.create();

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
        V3ToArray(tablePosition))
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
        V3ToArray(cameraTransform.position))

      mat4.translate(modelViewMatrix,
        modelViewMatrix,
        V3ToArray(V3TimeScalar(position, SCALE)))

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
        const vertexCount = Ball.getIndices(2).length;
        const type = gl.UNSIGNED_SHORT;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
      }

    }

    function drawPart(i: number, type: number) {

      const modelViewMatrix = mat4.create();
      mat4.translate(modelViewMatrix,
        modelViewMatrix,
        V3ToArray(tablePosition))
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
        V3ToArray(cameraTransform.position))

      mat4.translate(modelViewMatrix,
        modelViewMatrix,
        V3ToArray(V3TimeScalar(position, SCALE)))

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
        const vertexCount = Ball.getIndices(i).length;
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