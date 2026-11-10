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
    uniform vec2 uGaze;
    uniform sampler2D uIris;
    uniform sampler2D uSclera;
    uniform sampler2D uVeins;

    void main() {
        vec2 point = vPoint / 0.88;
        float radiusSquared = dot(point, point);

        if (radiusSquared >= 1.0) {
            gl_FragColor = vec4(0.0);
            return;
        }

        float z = sqrt(1.0 - radiusSquared);
        vec3 normal = vec3(point, z);
        vec3 light = normalize(vec3(-0.58, 0.72, 0.40));
        float diffuse = max(dot(normal, light), 0.0);
        vec3 illumination = vec3(0.067, 0.073, 0.092) + diffuse * vec3(0.58, 0.53, 0.48);

        float turn = length(uGaze);
        vec2 direction = uGaze / max(turn, 0.0001);
        float along = dot(normal.xy, direction);
        float c = cos(turn);
        float s = sin(turn);

        vec2 rotatedXY = normal.xy + direction * ((c - 1.0) * along - s * normal.z);
        vec3 surface = vec3(rotatedXY, s * along + c * normal.z);

        float front = step(0.0, surface.z);
        float radius = length(surface.xy);
        float irisMask = front * (1.0 - smoothstep(0.39, 0.42, radius));

        vec2 irisUV = vec2(0.5) + surface.xy * vec2(0.45, -0.45) / 0.42;
        vec3 iris = texture2D(uIris, irisUV).rgb;

        vec2 sphereUV = vec2(
            0.5 + atan(surface.x, surface.z) / 6.283185,
            acos(clamp(surface.y, -1.0, 1.0)) / 3.141593
        );
        vec3 sclera = texture2D(uSclera, sphereUV).rgb;
        vec3 veins = texture2D(uVeins, sphereUV).rgb;

        vec3 color = mix(sclera * veins, iris, irisMask);
        gl_FragColor = vec4(color * illumination, 1.0);
    }
`;

async function createEyeRenderer(canvas) {
    const gl = canvas.getContext("webgl");

    if (!gl) {
        throw new Error("boi webgl kinda sussy rn (plz add ptit message to go on a regular browser lol moment)")
    }

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

    const gazeLocation = gl.getUniformLocation(program, "uGaze");

    const corners = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, corners, gl.STATIC_DRAW);

    const position = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    gl.viewport(0, 0, canvas.width, canvas.height);
    async function loadTexture(source, unit, uniformName) {
        const image = new Image();
        image.src = source;
        await image.decode();

        const texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.uniform1i(gl.getUniformLocation(program, uniformName), unit);
    }

    await Promise.all([
        loadTexture(eyeTextures.iris, 0, "uIris"),
        loadTexture(eyeTextures.eyetexture, 1, "uSclera"),
        loadTexture(eyeTextures.veins, 2, "uVeins")
    ]);

    return function drawEye(gazeX, gazeY) {
        gl.uniform2f(gazeLocation, gazeX, gazeY);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
}

const mountedEyes = new WeakMap();

function mountEye(canvas) {
    if (!mountedEyes.has(canvas)) {
        const ready = createEyeRenderer(canvas).then((draw) => {
            draw(0, 0);
            return draw;
        });

        mountedEyes.set(canvas, ready);
    }

    return mountedEyes.get(canvas);
}

document.querySelectorAll("canvas.eye").forEach((canvas) => {
    mountEye(canvas).catch(console.error);
});