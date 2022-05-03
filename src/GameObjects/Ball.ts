import {GameObject} from "./GameObject";
import {Vector3} from "../helpers/Vector3";

export class Ball extends GameObject{
  position: Vector3 = {x:0, y: 0, z: 0}

  initBuffers() {
    const gl = this.gl
    const positionBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions = Ball.getPositions()
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array(positions),
      gl.STATIC_DRAW);

    const gr = [0.35, 0.55, 0.26, 1.0]
    //const bl = [0.0, 0.0, 0.0, 1.0]
    const faceColors = [
      gr, gr, // TOP
    ];
    let colors: number[] = [];

    for (let j = 0; j < faceColors.length; ++j) {
      const c = faceColors[j];
      colors = colors.concat(c, c, c, c);
    }

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    const indices = Ball.getIndices();

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices), gl.STATIC_DRAW);
    return [{
      position: positionBuffer,
      color: colorBuffer,
      indices: indexBuffer,
    }]
  }




  static getPositions() {
    return []
  }

  static getIndices() {
    return []
  }
}