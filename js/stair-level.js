const level = document.querySelector(".stair-level");
const player = level.querySelector(".stair-player");
let activeRoute;
let climb;

function chooseRoute(route) {
    if (route === activeRoute || climb?.playState === "running") return;

    climb?.cancel();
    climb = null;
    activeRoute = route;
    player.style.left = `${route.offsetLeft + route.offsetWidth / 2}px`;
}

function startClimb(route) {
    chooseRoute(route);
    if (route !== activeRoute) return;

    if (!climb || climb.playState === "finished") {
        const frames = Array.from({ length: 21 }, (_, step) => {
            const progress = step / 20;
            const hop = step % 2 ? 12 : 0;
            const height = route.offsetHeight * progress + hop;
            return {
                transform: `translate(-50%, ${-height}px) rotate(${45 + progress * 720}deg)`
            };
        });

        climb = player.animate(frames, { duration: 10_000, fill: "forwards" });
    }

    climb.play();
}

function pauseClimb() {
    if (climb?.playState === "running") climb.pause();
}

for (const route of level.querySelectorAll(".stair-route")) {
    route.addEventListener("pointerenter", () => chooseRoute(route));
    route.addEventListener("focus", () => chooseRoute(route));

    route.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) return;
        route.setPointerCapture(event.pointerId);
        startClimb(route);
    });

    route.addEventListener("lostpointercapture", pauseClimb);
}

window.addEventListener("blur", pauseClimb);