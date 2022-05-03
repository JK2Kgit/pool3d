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