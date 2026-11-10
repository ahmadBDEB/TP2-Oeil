const museum = document.querySelector(".museum");
const visuals = museum.querySelectorAll(".exhibit-visual");
const cutouts = museum.querySelectorAll(".case-cutout");

function alignCaseLights() {
    const room = museum.getBoundingClientRect();

    visuals.forEach((visual, index) => {
        const box = visual.getBoundingClientRect();
        const x = box.left - room.left;
        const y = box.top - room.top;

        cutouts[index].setAttribute("points", [
            `${x + box.width * 0.49},${y}`,
            `${x + box.width * 0.51},${y}`,
            `${x + box.width},${y + box.height}`,
            `${x},${y + box.height}`
        ].join(" "));
    });
}

const galleryResize = new ResizeObserver(alignCaseLights);
galleryResize.observe(museum);
visuals.forEach((visual) => galleryResize.observe(visual));
alignCaseLights();