const beam = document.querySelector("#beam-shape");
const beamEye = scene.querySelector("canvas.eye");
const beamFade = document.querySelector("#beam-fade");

function moveLight(event) {
    const sceneBounds = scene.getBoundingClientRect();

    const eyeBounds = beamEye.getBoundingClientRect();
    const startX = eyeBounds.left + eyeBounds.width / 2 - sceneBounds.left;
    const startY = eyeBounds.top + eyeBounds.height / 2 - sceneBounds.top;
    const endX = event.clientX - sceneBounds.left;
    const endY = event.clientY - sceneBounds.top;

    beamFade.setAttribute("x1", startX);
    beamFade.setAttribute("y1", startY);
    beamFade.setAttribute("x2", endX);
    beamFade.setAttribute("y2", endY);

    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const halfWidth = Math.min(75, distance * 0.23);
    const offsetX = -dy / distance * halfWidth;
    const offsetY = dx / distance * halfWidth;

    beam.setAttribute("points", [
        `${startX},${startY}`,
        `${endX + offsetX},${endY + offsetY}`,
        `${endX - offsetX},${endY - offsetY}`
    ].join(" "));
}

window.addEventListener("pointermove", moveLight);