import {Ball} from "../GameObjects/Ball";
import {Vector2, Vector2Add} from "./Vector2";

export function createProgramInfo(gl: WebGL2RenderingContext, ids: string[]) {
    const programs = ids.map((id) => (document.getElementById(id) as HTMLScriptElement).text)

    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, programs[0]);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, programs[1]);

    const shaderProgram = gl.createProgram()!;
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        throw Error
    }

    return {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            modelTextureType: gl.getUniformLocation(shaderProgram, 'uModelTextureType'),
            resolution: gl.getUniformLocation(shaderProgram, 'uResolution'),
            accentColor: gl.getUniformLocation(shaderProgram, 'uAccentColor'),
        },
    };
}


function loadShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        throw Error()
    }

    return shader;
}
export const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

export function pointsOnCircle(radius: number, angle: number){
    angle = angle * ( Math.PI / 180 );
    const x = radius * Math.sin(angle);
    const y = radius * Math.cos(angle);
    return [ x, y, 0.0 ];
}

export function round(n: number, d: number){
    return Math.round(n*Math.pow(10, d))/Math.pow(10, d)
}

export function getStartingBalls(gl: WebGL2RenderingContext, pi: any){
    const V2A = Vector2Add
    const triangleTop: Vector2 = {x: 0, y: -1.8}
    const whitePos: Vector2 = {x: 0, y: 3}
    const white = [1.0, 1.0, 1.0, 1.0]
    const black = [0.0, 0.0, 0.0, 1.0]
    const red = [0.41, 0.22, 0.17, 1.0]
    // 0 - white;  1 - color;  2 - grid;  3 - black    (type)
    return [
        new Ball(gl, pi, white, whitePos, 0),
        new Ball(gl, pi, red, triangleTop, 2), // TOP

        new Ball(gl, pi, red, V2A(triangleTop, {x: .22, y: -.4}), 2),
        new Ball(gl, pi, red, V2A(triangleTop, {x: -.22, y: -.4}), 1),

        new Ball(gl, pi, red, V2A(triangleTop, {x: .44, y: -.8}), 1),
        new Ball(gl, pi, black, V2A(triangleTop, {x: 0, y: -.8}), 3),
        new Ball(gl, pi, red, V2A(triangleTop, {x: -.44, y: -.8}), 2),

        new Ball(gl, pi, red, V2A(triangleTop, {x: .66, y: -1.2}), 2),
        new Ball(gl, pi, red, V2A(triangleTop, {x: .22, y: -1.2}), 1),
        new Ball(gl, pi, red, V2A(triangleTop, {x: -.22, y: -1.2}), 2),
        new Ball(gl, pi, red, V2A(triangleTop, {x: -.66, y: -1.2}), 1),

        new Ball(gl, pi, red, V2A(triangleTop, {x: .88, y: -1.6}), 1),
        new Ball(gl, pi, red, V2A(triangleTop, {x: .44, y: -1.6}), 1),
        new Ball(gl, pi, red, V2A(triangleTop, {x: 0, y: -1.6}), 2),
        new Ball(gl, pi, red, V2A(triangleTop, {x: -.44, y: -1.6}), 1),
        new Ball(gl, pi, red, V2A(triangleTop, {x: -.88, y: -1.6}), 2),



    ]
}