import * as mat4 from "../matrix/mat4";
import {FOV, HEIGHT, MULTIPLAYER, WIDTH} from "../helpers/Constants";
import {GameObject} from "./GameObject";

export class SkyBox extends GameObject{
  constructor(gl: WebGL2RenderingContext, programInfo: any) {
    super(gl, programInfo);
    this.buffers = this.initBuffers();
  }
  initBuffers() {
    const gl = this.gl

    const positionBuffer1 = gl.createBuffer();
    const positions1 = SkyBox.getPositions(0)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer1);
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array(positions1),
      gl.STATIC_DRAW);

    const colors1 = [];
    for (let i = 0; i < positions1.length / 3; i++) {
      colors1.push([1, 1, 1, 1]);
    }
    const colorBuffer1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer1);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors1.flat()), gl.STATIC_DRAW);

    const indexBuffer1 = gl.createBuffer();
    const indices1 = SkyBox.getIndices(0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer1);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices1), gl.STATIC_DRAW);



    const positionBuffer2 = gl.createBuffer();
    const positions2 = SkyBox.getPositions(1)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer2);
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array(positions2),
      gl.STATIC_DRAW);

    const colors2 = [];
    for (let i = 0; i < positions2.length / 3; i++) {
      colors2.push([0.41, 0.22, 0.17, 1]);
    }
    const colorBuffer2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer2);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors2.flat()), gl.STATIC_DRAW);

    const indexBuffer2 = gl.createBuffer();
    const indices2 = SkyBox.getIndices(1);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer2);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices2), gl.STATIC_DRAW);

    return [
      {
        position: positionBuffer1,
        color: colorBuffer1,
        indices: indexBuffer1,
      },
      {
        position: positionBuffer2,
        color: colorBuffer2,
        indices: indexBuffer2,
      }
    ]
  }

  draw(x: number) {
    const gl = this.gl
    const buffers = this.buffers
    const programInfo = this.programInfo

    gl.clearDepth(1.0);
    gl.clearColor(1.0, 1.0, 1.0, 1.0)
    gl.enable(gl.DEPTH_TEST);

    gl.depthFunc(gl.LEQUAL)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniform4fv(programInfo.uniformLocations.accentColor, [0.0, 0.0, 0.0, 1.0])

    drawPart(x, 0)
    drawPart(x, 1)

    function drawPart(x: number, i: number) {

      const fieldOfView = FOV * Math.PI / 180;
      const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
      const zNear = 0.1;
      const zFar = 1000.0;
      const projectionMatrix = mat4.create();

      mat4.perspective(projectionMatrix,
        fieldOfView,
        aspect,
        zNear,
        zFar);
      const modelViewMatrix = mat4.create();

      mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, -5, -40])
      mat4.scale(modelViewMatrix, modelViewMatrix, [40.0, 40.0, 40.0])
      mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, x * MULTIPLAYER, 0.0])
      {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers[i].position);
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
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers[i].color);
        gl.vertexAttribPointer(
          programInfo.attribLocations.vertexColor,
          numComponents,
          type,
          normalize,
          stride,
          offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
      }

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers[i].indices);

      gl.useProgram(programInfo.program);

      gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);

      gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);

      gl.uniform1i(programInfo.uniformLocations.modelTextureType, [1, 2][i]);
      gl.uniform2iv(programInfo.uniformLocations.resolution, [WIDTH, HEIGHT]);

      {
        const offset = 0;
        const vertexCount = SkyBox.getIndices(i).length;
        const type = gl.UNSIGNED_SHORT;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
      }
    }
  }

  static getPositions(i: number) {
    return [[
      -1.0, 1.0, 0.0,
      1.0, 1.0, 0.0,
      1.0, 0.0, 0.0,
      -1.0, 0.0, 0.0],

      [1.0, 0.0, 0.0,
        1.0, -1.0, 0.0,
        -1.0, -1.0, 0.0,
        -1.0, 0.0, 0.0]
    ][i]
  }

  static getIndices(i: number) {
    return [
      [0, 1, 2,
        0, 2, 3],
      [0, 1, 2,
        0, 2, 3],
    ][i]
  }
}