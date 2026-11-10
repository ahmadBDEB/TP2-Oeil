function enablePlayerCursor(sprite) {
    const root = document.documentElement;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    let x = 0, y = 0;
    let targetX = 0, targetY = 0;
    let frame = null;
    let previousTime = 0;

    function animate(time) {
        const elapsed = Math.max(0, time - previousTime);
        const amount = reducedMotion.matches ? 1 : 1 - Math.exp(-elapsed / 28);
        previousTime = time;

        x += (targetX - x) * amount;
        y += (targetY - y) * amount;

        const settled = Math.hypot(targetX - x, targetY - y) < 0.5;
        if (settled) {
            x = targetX;
            y = targetY;
        }

        sprite.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
        frame = settled ? null : requestAnimationFrame(animate);
    }

    window.addEventListener("pointermove", (event) => {
        if (event.pointerType !== "mouse") return;

        targetX = event.clientX;
        targetY = event.clientY;

        if (sprite.hidden) {
            x = targetX;
            y = targetY;
            sprite.hidden = false;
            root.classList.add("has-player-cursor");
        }

        if (frame === null) {
            previousTime = performance.now();
            frame = requestAnimationFrame(animate);
        }
    });

    function hidePlayer() {
        cancelAnimationFrame(frame);
        frame = null;
        sprite.hidden = true;
        root.classList.remove("has-player-cursor");
    }

    root.addEventListener("pointerleave", hidePlayer);
    window.addEventListener("blur", hidePlayer);
}

const playerSprite = document.querySelector(".player-sprite");
if (playerSprite) enablePlayerCursor(playerSprite);