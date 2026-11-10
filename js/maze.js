const board = document.querySelector(".maze-board");

const size = 64;
const maze = Array.from({ length: size }, () => Array(size).fill("#"));
const directions = [[2, 0], [-2, 0], [0, 2], [0, -2]];

const stack = [[1, 61]];
maze[61][1] = "S";

while (stack.length > 0) {
    const [x, y] = stack.at(-1);
    const choices = directions
        .map(([dx, dy]) => [x + dx, y + dy])
        .filter(([nx, ny]) =>
            nx > 0 && nx < 62 && ny > 0 && ny < 62 && maze[ny][nx] === "#"
        );

    if (choices.length === 0) {
        stack.pop();
        continue;
    }

    const [nx, ny] = choices[Math.floor(Math.random() * choices.length)];
    maze[(y + ny) / 2][(x + nx) / 2] = ".";
    maze[ny][nx] = ".";
    stack.push([nx, ny]);
}

for (let y = 1; y < 62; y++) {
    for (let x = 1; x < 62; x++) {
        const betweenCorridors = x % 2 !== y % 2;
        if (betweenCorridors && maze[y][x] === "#" && Math.random() < 0.08) {
            maze[y][x] = ".";
        }
    }
}

maze[31][31] = "G";
maze[31][32] = "G";
maze[32][31] = "G";
maze[32][32] = "G";

for (const row of maze) {
    for (const cell of row) {
        const tile = document.createElement("div");
        tile.className = "maze-tile";
        if (cell === "#") tile.classList.add("maze-wall");
        if (cell === "S") tile.classList.add("maze-start");
        if (cell === "G") tile.classList.add("maze-goal");
        board.append(tile);
    }
}

const view = document.querySelector(".maze-view");
const eye = view.querySelector(".maze-eye");
const player = view.querySelector(".maze-player");
const mazeTurn = 120 * Math.PI / 180;
const aimMazeLight = createEyeLight(view, eye, 1.4, {
    reach: 64,
    maxTurn: mazeTurn,
});

mountEye(eye).then((drawEye) => {
    function aimAtPlayer() {
        const target = player.getBoundingClientRect();
        const source = eye.getBoundingClientRect();
        const x = target.left + target.width / 2;
        const y = target.top + target.height / 2;
        const dx = x - (source.left + source.width / 2);
        const dy = y - (source.top + source.height / 2);
        const distance = Math.hypot(dx, dy);
        const sensitivity = Math.min(
            1.12 / (source.width * 0.82),
            (Math.PI / 2) / (distance || 1)
        );

        drawEye(dx * sensitivity, -dy * sensitivity);
        aimMazeLight(x, y);
    }

    aimAtPlayer();
    window.addEventListener("resize", aimAtPlayer);
}).catch(console.error);

let playerX = 1.5;
let playerY = 61.5;
let velocityX = 0;
let velocityY = 0;
let pointer = null;
let previousTime = 0;
let movementFrame = null;

function isOpen(x, y) {
    const tile = maze[Math.floor(y)]?.[Math.floor(x)];
    return tile !== undefined && tile !== "#";
}

function canMoveTo(x, y) {
    const radius = 0.31;
    return isOpen(x - radius, y - radius)
        && isOpen(x + radius, y - radius)
        && isOpen(x - radius, y + radius)
        && isOpen(x + radius, y + radius);
}

function moveDiamond(time) {
    movementFrame = null;
    const dt = Math.min((time - previousTime) / 1000, 0.04);
    previousTime = time;

    const distance = pointer ? Math.hypot(pointer.x, pointer.y) : 0;
    const speed = Math.min(4.5, Math.max(0, distance - 12) / 24);
    const pull = speed / (distance || 1);
    const ease = 1 - Math.exp(-dt * 12);

    velocityX += ((pointer?.x ?? 0) * pull - velocityX) * ease;
    velocityY += ((pointer?.y ?? 0) * pull - velocityY) * ease;

    const nextX = playerX + velocityX * dt;
    if (canMoveTo(nextX, playerY)) playerX = nextX;
    else velocityX = 0;

    const nextY = playerY + velocityY * dt;
    if (canMoveTo(playerX, nextY)) playerY = nextY;
    else velocityY = 0;

    view.style.setProperty("--player-x", playerX);
    view.style.setProperty("--player-y", playerY);

    if (speed > 0 || Math.hypot(velocityX, velocityY) > 0.02) {
        movementFrame = requestAnimationFrame(moveDiamond);
    }
}

view.addEventListener("pointermove", (event) => {
    const bounds = view.getBoundingClientRect();
    pointer = {
        x: event.clientX - bounds.left - bounds.width / 2,
        y: event.clientY - bounds.top - bounds.height / 2,
    };

    if (movementFrame === null) {
        previousTime = performance.now();
        movementFrame = requestAnimationFrame(moveDiamond);
    }
});

view.addEventListener("pointerleave", () => { pointer = null; });
window.addEventListener("blur", () => { pointer = null; });