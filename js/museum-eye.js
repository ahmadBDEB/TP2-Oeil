async function startMuseumEye() {
    const eye = document.querySelector(".museum-eye");
    const drawEye = await mountEye(eye);
    const aimLight = createEyeLight(document.querySelector(".museum"), eye, 0.5);
    const gap = 150;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

    let x = innerWidth * 0.25;
    let y = innerHeight * 0.3;
    let mouseX = x, mouseY = y;
    let frame = null;
    let previousTime = 0;

    function placeEye() {
        eye.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    }

    function moveEye(time) {
        const dx = mouseX - x;
        const dy = mouseY - y;
        const distance = Math.hypot(dx, dy);
        const directionX = distance ? dx / distance : 1;
        const directionY = distance ? dy / distance : 0;
        const edge = eye.clientWidth / 2;

        const targetX = Math.max(edge, Math.min(innerWidth - edge, mouseX - directionX * gap));
        const targetY = Math.max(edge, Math.min(innerHeight - edge, mouseY - directionY * gap));

        const settled = Math.hypot(targetX - x, targetY - y) < 0.5;
        const amount = settled || reducedMotion.matches
            ? 1
            : 1 - Math.exp(-Math.max(0, time - previousTime) / 120);
        previousTime = time;

        x += (targetX - x) * amount;
        y += (targetY - y) * amount;
        placeEye();

        const gazeX = mouseX - x;
        const gazeY = mouseY - y;
        const scale = (Math.PI / 2) / Math.max(gap, Math.hypot(gazeX, gazeY));
        drawEye(gazeX * scale, -gazeY * scale);
        aimLight(mouseX, mouseY);

        frame = settled ? null : requestAnimationFrame(moveEye);
    }

    placeEye();

    window.addEventListener("pointermove", (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;

        if (frame === null) {
            previousTime = performance.now();
            frame = requestAnimationFrame(moveEye);
        }
    });
}

startMuseumEye().catch(console.error);