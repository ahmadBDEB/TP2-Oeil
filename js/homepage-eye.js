const canvas = document.querySelector(".eye");

const gl = canvas.getContext("webgl");

if (!gl) {
    throw new Error("boi webgl kinda sussy rn (plz add ptit message to go on a regular browser lol moment)")
}
// shaders for sphere
const vertexSource = `
    attribute vec2 aPosition;
    varying vec2 vPoint;

    void main() {
        vPoint = aPosition;
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`;

const fragmentSource = `
    precision mediump float;
    varying vec2 vPoint;

    void main() {
        vec2 point = vPoint / 0.88;
        float radiusSquared = dot(point, point);

        if (radiusSquared >= 1.0) {
            gl_FragColor = vec4(0.0);
            return;
        }

        float z = sqrt(1.0 - radiusSquared);
        vec3 normal = vec3(point, z);
        vec3 light = normalize(vec3(-0.5, 0.6, 0.7));
        float brightness = 0.3 + 0.7 * max(dot(normal, light), 0.0);

        gl_FragColor = vec4(vec3(0.72, 0.57, 0.48) * brightness, 1.0);
    }
`;

function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader));
    }

    return shader;
}

const program = gl.createProgram();
gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vertexSource));
gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fragmentSource));
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
}

gl.useProgram(program);

const corners = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, corners, gl.STATIC_DRAW);

const position = gl.getAttribLocation(program, "aPosition");
gl.enableVertexAttribArray(position);
gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

gl.viewport(0, 0, canvas.width, canvas.height);
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

window.addEventListener("pointermove", (event) => {
    const bounds = canvas.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;

    const x = event.clientX - centerX
    const y = event.clientY - centerY

    // quick check yk b4 adding eye
    console.log(x, y)
})