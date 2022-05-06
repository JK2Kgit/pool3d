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
    const triangleTop: Vector2 = {x: 0, y: -1.8}
    const whitePos: Vector2 = {x: 0, y: 3}
    const white = [1.0, 1.0, 1.0, 1.0]
    const black = [0.0, 0.0, 0.0, 1.0]
    const red = [0.41, 0.22, 0.17, 1.0]
    // 0 - white;  1 - color;  2 - grid;  3 - black    (type)
    return [
        new Ball(gl, pi, white, V23(whitePos, 0), 0),
        new Ball(gl, pi, red, V23(triangleTop, 0), 2), // TOP

        new Ball(gl, pi, red, V23(V2A(triangleTop, {x: .22, y: -.4}), 0), 2),
        new Ball(gl, pi, red, V23(V2A(triangleTop, {x: -.22, y: -.4}), 0), 1),

        new Ball(gl, pi, red, V23(V2A(triangleTop, {x: .44, y: -.8}), 0), 1),
        new Ball(gl, pi, black, V23(V2A(triangleTop, {x: 0, y: -.8}), 0), 3),
        new Ball(gl, pi, red, V23(V2A(triangleTop, {x: -.44, y: -.8}), 0), 2),

        new Ball(gl, pi, red, V23(V2A(triangleTop, {x: .66, y: -1.2}), 0), 2),
        new Ball(gl, pi, red, V23(V2A(triangleTop, {x: .22, y: -1.2}), 0), 1),
        new Ball(gl, pi, red, V23(V2A(triangleTop, {x: -.22, y: -1.2}), 0), 2),
        new Ball(gl, pi, red, V23(V2A(triangleTop, {x: -.66, y: -1.2}), 0), 1),

        new Ball(gl, pi, red, V23(V2A(triangleTop, {x: .88, y: -1.6}), 0), 1),
        new Ball(gl, pi, red, V23(V2A(triangleTop, {x: .44, y: -1.6}), 0), 1),
        new Ball(gl, pi, red, V23(V2A(triangleTop, {x: 0, y: -1.6}), 0), 2),
        new Ball(gl, pi, red, V23(V2A(triangleTop, {x: -.44, y: -1.6}), 0), 1),
        new Ball(gl, pi, red, V23(V2A(triangleTop, {x: -.88, y: -1.6}), 0), 2),



    ]
}

export function Vector3Angle(vec: Vector3){
    return Math.atan2(vec.x, vec.z) - Math.atan2(0, 1)
}

export enum STATE{
    sliding,
    rolling,
    spining,
    stationary
}
