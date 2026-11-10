const player = document.querySelector(".stair-player");
let route, length;
let x = 720, y = 746;
let progress = 0;
let held = false;
let frame = null;
let lastTime;

function scheduleMove() {
    if (frame !== null) return;
    lastTime = performance.now();
    frame = requestAnimationFrame(move);
}

function selectRoute(path) {
    if (held || route === path) return;
    route = path;
    length = path.getTotalLength();
    progress = 0;
    scheduleMove();
}

function move(time) {
    frame = null;
    const elapsed = Math.min(time - lastTime, 50);
    lastTime = time;
    const start = route.getPointAtLength(0);
    const approaching = progress === 0 && Math.hypot(x - start.x, y - start.y) > 1;

    if (approaching) {
        const amount = 1 - Math.exp(-elapsed / 75);
        x += (start.x - x) * amount;
        y += (start.y - y) * amount;
    } else {
        if (held) progress = Math.min(1, progress + elapsed / 10_000);
        ({ x, y } = route.getPointAtLength(progress * length));
    }

    player.style.left = `${x / 1440 * 100}%`;
    player.style.top = `${y / 810 * 100}%`;
    player.style.transform = `translate(-50%, -50%) rotate(${45 + progress * 720}deg)`;

    if (held && progress === 1) {
        const door = document.getElementById(route.dataset.door);
        door.style.fill = door.id === "door-right" ? "#fff" : "#b01824";
        if (door.id === "door-right") {
            document.querySelector(".maze-door").hidden = false;
        }
        held = false;
    }

    if (approaching || held) frame = requestAnimationFrame(move);
}

function pauseClimb() {
    held = false;
}

for (const path of document.querySelectorAll(".stair-paths path")) {
    path.addEventListener("pointerenter", () => selectRoute(path));

    path.addEventListener("pointerdown", (event) => {
        if (event.button !== 0 || held) return;
        selectRoute(path);
        if (progress === 1) return;
        path.setPointerCapture(event.pointerId);
        held = true;
        scheduleMove();
    });

    path.addEventListener("lostpointercapture", pauseClimb);
}

window.addEventListener("blur", pauseClimb);