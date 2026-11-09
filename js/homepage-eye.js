const canvas = document.querySelector(".eye");

window.addEventListener("pointermove", (event) => {
    const bounds = canvas.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;

    const x = event.clientX - centerX
    const y = event.clientY - centerY

    // quick check yk b4 adding eye
    console.log(x, y)
})