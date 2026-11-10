async function enableMouseLook(canvas) {
    const drawEye = await mountEye(canvas);

    let gazeX = 0, gazeY = 0;
    let targetX = 0, targetY = 0;

    let frame = null;
    let previousTime = 0;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

    function animateGaze(time) {
        const elapsed = Math.max(0, time - previousTime);
        const amount = reducedMotion.matches ? 1 : 1 - Math.exp(-elapsed / 48);
        previousTime = time;

        gazeX += (targetX - gazeX) * amount;
        gazeY += (targetY - gazeY) * amount;

        const settled = Math.hypot(targetX - gazeX, targetY - gazeY) < 0.001;

        if (settled) {
            gazeX = targetX;
            gazeY = targetY;
        }

        frame = settled ? null : requestAnimationFrame(animateGaze);

        drawEye(gazeX, gazeY)
    }

    function followPointer(event) {
        const bounds = canvas.getBoundingClientRect();
        const x = event.clientX - (bounds.left + bounds.width / 2);
        const y = event.clientY - (bounds.top + bounds.height / 2);
        const distance = Math.hypot(x, y);
        const sensitivity = Math.min(
            1.12 / (bounds.width * 0.82),
            (Math.PI / 2) / (distance || 1)
        );

        targetX = x * sensitivity;
        targetY = -y * sensitivity;

        if (frame === null) {
            previousTime = performance.now();
            frame = requestAnimationFrame(animateGaze);
        }
    }

    window.addEventListener("pointermove", followPointer);
}

document.querySelectorAll("canvas.eye.look-at-mouse").forEach((canvas) => {
    enableMouseLook(canvas).catch(console.error);
});