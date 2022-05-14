import {Ball} from "../GameObjects/Ball";
import {Vector2, Vector2Add, Vector2ToVector3} from "./Vector2";
import {Vector3} from "./Vector3";

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
    const V23 = Vector2ToVector3
    const triangleTop: Vector2 = {x: 1.8, y: 0}
    const whitePos: Vector2 = {x: -3, y: 0}
    const white = [1.0, 1.0, 1.0, 1.0]
    const black = [0.0, 0.0, 0.0, 1.0]
    const red = [0.41, 0.22, 0.17, 1.0]
    // 0 - white;  1 - color;  2 - grid;  3 - black    (type)
    return [
        new Ball(gl, pi, white, V23(whitePos, 0), 0, 0),
        new Ball(gl, pi, red, V23(triangleTop, 0), 2, 1), // TOP

        new Ball(gl, pi, red, V23(V2A(triangleTop, {x: .4, y: .22}), 0), 2, 2),
        new Ball(gl, pi, red, V23(V2A(triangleTop, {x: .4, y: -.22}), 0), 1, 3),

        new Ball(gl, pi, red, V23(V2A(triangleTop, {x: .8, y: .44}), 0), 1, 4),
        new Ball(gl, pi, black, V23(V2A(triangleTop, {x: .8, y: 0}), 0), 3, 5),
        new Ball(gl, pi, red, V23(V2A(triangleTop, {x: .8, y: -.44}), 0), 2, 6),

        /*new Ball(gl, pi, red, V23(V2A(triangleTop, {x: .66, y: -1.2}), 0), 2, 7),
        new Ball(gl, pi, red, V23(V2A(triangleTop, {x: .22, y: -1.2}), 0), 1, 8),
        new Ball(gl, pi, red, V23(V2A(triangleTop, {x: -.22, y: -1.2}), 0), 2, 9),
        new Ball(gl, pi, red, V23(V2A(triangleTop, {x: -.66, y: -1.2}), 0), 1, 10),

        new Ball(gl, pi, red, V23(V2A(triangleTop, {x: .88, y: -1.6}), 0), 1, 11),
        new Ball(gl, pi, red, V23(V2A(triangleTop, {x: .44, y: -1.6}), 0), 1, 12),
        new Ball(gl, pi, red, V23(V2A(triangleTop, {x: 0, y: -1.6}), 0), 2, 13),
        new Ball(gl, pi, red, V23(V2A(triangleTop, {x: -.44, y: -1.6}), 0), 1, 14),
        new Ball(gl, pi, red, V23(V2A(triangleTop, {x: -.88, y: -1.6}), 0), 2, 15),
*/


    ]
}

export function Vector3Angle(vec: Vector2, vec2: Vector2 = {x: 1, y: 0}){
    return Math.atan2(vec.y, vec.x) - Math.atan2(vec2.y, vec2.x)
}

export enum BallState{
    sliding,
    rolling,
    spining,
    stationary
}

export type BallPosVelSpin = {
    pos: Vector3
    vel: Vector3
    spin: Vector3
}
