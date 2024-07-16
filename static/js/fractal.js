function startFractal(canvas, ctx, clearCanvasAndStop) {
    let maxIterations = 1000;

    clearCanvasAndStop();

    function drawFractal() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const imgData = ctx.createImageData(canvas.width, canvas.height);
        const data = imgData.data;

        const scale = 1.5;
        const offsetX = canvas.width * 0.02;
        const offsetY = -canvas.height * 0.3;

        for (let x = 0; x < canvas.width; x++) {
            for (let y = 0; y < canvas.height; y++) {
                let zx = ((x - offsetX) / canvas.width) * 4 / scale - 2;
                let zy = ((y - offsetY) / canvas.height) * 4 / scale - 2;
                let i = 0;

                while (zx * zx + zy * zy < 4 && i < maxIterations) {
                    const tmp = zx * zx - zy * zy + ((x - offsetX) / canvas.width) * 4 / scale - 2;
                    zy = 2 * zx * zy + ((y - offsetY) / canvas.height) * 4 / scale - 2;
                    zx = tmp;
                    i++;
                }

                const p = (x + y * canvas.width) * 4;
                data[p] = i % 256;
                data[p + 1] = (i * 5) % 256;
                data[p + 2] = (i * 10) % 256;
                data[p + 3] = 255;
            }
        }

        ctx.putImageData(imgData, 0, 0);
    }

    function updateIterations() {
        maxIterations = (maxIterations + 1000) % 9000 || 1000;
        drawFractal();
    }

    animationFrameId = requestAnimationFrame(function draw() {
        updateIterations();
        animationFrameId = requestAnimationFrame(draw);
    });
}

window.startFractal = startFractal;