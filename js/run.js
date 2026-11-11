const hall = document.querySelector(".run-hall");
const runner = hall.querySelector(".run-player");
const chaser = hall.querySelector(".run-eye");
const aimRunLight = createEyeLight(hall, chaser, 1.1, { reach: 100 });
const keys = new Set();
const controls = ["w", "a", "s", "d", "arrowup", "arrowleft", "arrowdown", "arrowright"];

let x = hall.clientWidth / 2;
let y = hall.clientHeight * 0.58;
let eyeX = x;
let floorOffset = 0;
let lastTime = performance.now();
let drawChaser;

const scrollSpeed = 180;
const obstacles = [];
let started = false;
let runTime = 0;
let nextWave = 0.8;
const runDuration = 30;
const countdown = document.querySelector(".run-countdown");

mountEye(chaser).then((drawEye) => {
    drawChaser = drawEye;
}).catch(console.error);

window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (!controls.includes(key)) return;
    event.preventDefault();
    keys.add(key);
    started = true;
});

function moveObstacles(dt) {
    runTime += dt;
    const remaining = `${Math.max(0, Math.ceil(runDuration - runTime))} s`;
    if (countdown.textContent !== remaining) countdown.textContent = remaining;

    if (runTime >= nextWave) {
        const openLane = Math.floor(Math.random() * 3);

        for (let lane = 0; lane < 3; lane++) {
            if (lane === openLane) continue;

            const element = document.createElement("div");
            const laneCenter = (lane + 0.5) / 3;
            element.className = "run-obstacle";
            element.style.left = `${laneCenter * 100}%`;
            hall.append(element);
            obstacles.push({ element, laneCenter, y: -15 });
        }

        nextWave += 1.35;
    }

    const width = hall.clientWidth;
    const height = hall.clientHeight;
    const hitWidth = (width / 3 - 4) / 2 + 13;
    const hitHeight = 15 + 13;

    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.y += scrollSpeed * dt;

        if (obstacle.y > height + 15) {
            obstacle.element.remove();
            obstacles.splice(i, 1);
            continue;
        }

        obstacle.element.style.top = `${obstacle.y}px`;

        const obstacleX = obstacle.laneCenter * width;
        if (Math.abs(x - obstacleX) < hitWidth && Math.abs(y - obstacle.y) < hitHeight) {
            y = Math.min(height - 13, obstacle.y + hitHeight);
        }
    }
}

window.addEventListener("keyup", (event) => {
    keys.delete(event.key.toLowerCase());
});

window.addEventListener("blur", () => keys.clear());

function pressed(letter, arrow) {
    return Number(keys.has(letter) || keys.has(arrow));
}

function moveRunner(time) {
    const dt = Math.min((time - lastTime) / 1000, 0.04);
    lastTime = time;

    const dx = pressed("d", "arrowright") - pressed("a", "arrowleft");
    const dy = pressed("s", "arrowdown") - pressed("w", "arrowup");
    const step = 200 * dt / (Math.hypot(dx, dy) || 1);

    x = Math.max(16, Math.min(hall.clientWidth - 16, x + dx * step));
    y = Math.max(16, Math.min(hall.clientHeight - 16, y + dy * step));
    if (started) moveObstacles(dt);
    runner.style.left = `${x}px`;
    runner.style.top = `${y}px`;

    floorOffset = (floorOffset + 180 * dt) % 48;
    hall.style.backgroundPositionY = `${floorOffset}px`;

    const eyeY = hall.clientHeight - 44;
    eyeX += (x - eyeX) * (1 - Math.exp(-dt * 3));
    chaser.style.left = `${eyeX}px`;
    chaser.style.top = `${eyeY}px`;

    const gazeScale = Math.min(1 / 100, 1.25 / (Math.hypot(x - eyeX, y - eyeY) || 1));
    drawChaser?.((x - eyeX) * gazeScale, (eyeY - y) * gazeScale);
    const bounds = hall.getBoundingClientRect();
    aimRunLight(bounds.left + x, bounds.top + y);

    requestAnimationFrame(moveRunner);

    if (started && Math.hypot(x - eyeX, y - eyeY) < 48) {
        window.location.reload();
        return;
    }

    if (runTime >= runDuration) {
        window.location.assign("ending.html");
        return;
    }
}

requestAnimationFrame(moveRunner);