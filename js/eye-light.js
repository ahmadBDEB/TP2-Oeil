const beam = document.querySelector("#beam-shape");
const beamEye = scene.querySelector("canvas.eye");
const beamFade = document.querySelector("#beam-fade");

function coneOutline(length, radius, depthRadius) {
    if (depthRadius < 0.5) {
        return `M 0 0 L ${length} ${-radius} L ${length} ${radius} Z`;
    }

    if (length <= depthRadius) {
        const diameter = 2 * depthRadius;
        return `M ${length - depthRadius} 0
            a ${depthRadius} ${radius} 0 1 0 ${diameter} 0
            a ${depthRadius} ${radius} 0 1 0 ${-diameter} 0 Z`;
    }

    const ratio = depthRadius / length;
    const joinX = length - depthRadius * ratio;
    const joinY = radius * Math.sqrt(1 - ratio * ratio);

    return `M 0 0 L ${joinX} ${-joinY}
        A ${depthRadius} ${radius} 0 1 1 ${joinX} ${joinY} Z`;
}

function moveLight(event) {
    const sceneBounds = scene.getBoundingClientRect();

    const eyeBounds = beamEye.getBoundingClientRect();
    const startX = eyeBounds.left + eyeBounds.width / 2 - sceneBounds.left;
    const startY = eyeBounds.top + eyeBounds.height / 2 - sceneBounds.top;
    const endX = event.clientX - sceneBounds.left;
    const endY = event.clientY - sceneBounds.top;

    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.hypot(dx, dy);

    const turn = Math.min(Math.PI / 2, distance * 1.12 / (eyeBounds.width * 0.82));
    const eyeRadius = eyeBounds.width * 0.44;
    const pupilOffset = Math.min(distance, eyeRadius * Math.sin(turn));
    const offsetScale = pupilOffset / (distance || 1);

    const apexX = startX + dx * offsetScale;
    const apexY = startY + dy * offsetScale;
    const beamLength = distance - pupilOffset;
    const radius = Math.min(75, 44 + distance * 0.12);
    const depthRadius = radius * Math.cos(turn);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

    beam.setAttribute("d", coneOutline(beamLength, radius, depthRadius));
    beam.setAttribute("transform", `translate(${apexX} ${apexY}) rotate(${angle})`);
    beamFade.setAttribute("x2", Math.max(1, beamLength + depthRadius));
}

window.addEventListener("pointermove", moveLight);