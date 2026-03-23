// Mandelbrot Set — pre-compute smooth iteration counts, animate color palette each frame.
// Tap to zoom in; double-tap to reset.
function startFractal(canvas, ctx) {
    let running = false;
    const W = canvas.width, H = canvas.height;
    // Render at half resolution for performance
    const rW = Math.floor(W / 2), rH = Math.floor(H / 2);
    const smoothIter = new Float32Array(rW * rH);

    let viewCX = -0.5, viewCY = 0, viewR = 1.6;
    const MAX_ITER = 60;
    let colorT = 0, lastTap = 0;

    const off = document.createElement('canvas');
    off.width = rW; off.height = rH;
    const offCtx = off.getContext('2d');
    const img = offCtx.createImageData(rW, rH);
    const d = img.data;

    function computeMandelbrot() {
        const aspect = rH / rW;
        for (let px = 0; px < rW; px++) {
            for (let py = 0; py < rH; py++) {
                const cx = viewCX + (px / rW - 0.5) * 2 * viewR;
                const cy = viewCY + (py / rH - 0.5) * 2 * viewR * aspect;
                let zx = 0, zy = 0, i = 0;
                while (zx * zx + zy * zy < 4 && i < MAX_ITER) {
                    const tmp = zx * zx - zy * zy + cx;
                    zy = 2 * zx * zy + cy;
                    zx = tmp;
                    i++;
                }
                const idx = px + py * rW;
                if (i === MAX_ITER) {
                    smoothIter[idx] = -1;
                } else {
                    // Smooth (continuous) iteration count removes banding
                    const m = zx * zx + zy * zy;
                    smoothIter[idx] = i + 1 - Math.log2(Math.log2(m < 1e-10 ? 1e-10 : m));
                }
            }
        }
    }

    function drawFrame() {
        if (!running) return;
        colorT += 0.007;

        for (let i = 0; i < rW * rH; i++) {
            const v = smoothIter[i], p = i * 4;
            if (v < 0) {
                d[p] = 2; d[p + 1] = 2; d[p + 2] = 18; d[p + 3] = 255;
            } else {
                const s = v * 0.14 + colorT;
                d[p]     = (Math.sin(s)         * 0.5 + 0.5) * 255 | 0;
                d[p + 1] = (Math.sin(s + 2.094) * 0.5 + 0.5) * 255 | 0;
                d[p + 2] = (Math.sin(s + 4.189) * 0.5 + 0.5) * 255 | 0;
                d[p + 3] = 255;
            }
        }
        offCtx.putImageData(img, 0, 0);
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(off, 0, 0, W, H);

        ctx.fillStyle = 'rgba(5,5,20,0.6)';
        ctx.fillRect(0, 0, W, 30);
        ctx.fillStyle = '#a5b4fc';
        ctx.font = '13px "Space Grotesk",sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(
            `Mandelbrot Set · Zoom ${(1.6 / viewR).toFixed(1)}×  ·  Tap to zoom · Double-tap to reset`,
            12, 20
        );
        requestAnimationFrame(drawFrame);
    }

    function zoomTo(px, py) {
        const now = Date.now();
        const isDouble = (now - lastTap) < 350;
        lastTap = now;
        running = false;

        if (isDouble) {
            viewCX = -0.5; viewCY = 0; viewR = 1.6;
        } else {
            const aspect = rH / rW;
            viewCX += (px / W - 0.5) * 2 * viewR;
            viewCY += (py / H - 0.5) * 2 * viewR * aspect;
            viewR *= 0.28;
            if (viewR < 1e-9) { viewCX = -0.5; viewCY = 0; viewR = 1.6; }
        }

        ctx.fillStyle = '#05050f';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#818cf8';
        ctx.font = '18px "Space Grotesk",sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Computing\u2026', W / 2, H / 2);

        setTimeout(() => {
            if (window.__currentDemoStop !== stopFn) return;
            computeMandelbrot();
            running = true;
            drawFrame();
        }, 30);
    }

    function clickHandler(e) {
        const r = canvas.getBoundingClientRect();
        zoomTo((e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height);
    }
    function touchHandler(e) {
        e.preventDefault();
        const r = canvas.getBoundingClientRect(), t0 = e.changedTouches[0];
        zoomTo((t0.clientX - r.left) * W / r.width, (t0.clientY - r.top) * H / r.height);
    }
    canvas.addEventListener('click', clickHandler);
    canvas.addEventListener('touchend', touchHandler, { passive: false });

    const stopFn = function () {
        running = false;
        canvas.removeEventListener('click', clickHandler);
        canvas.removeEventListener('touchend', touchHandler);
    };
    window.__currentDemoStop = stopFn;

    ctx.fillStyle = '#05050f';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#818cf8';
    ctx.font = '18px "Space Grotesk",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Computing Mandelbrot Set\u2026', W / 2, H / 2);
    setTimeout(() => {
        if (window.__currentDemoStop !== stopFn) return;
        computeMandelbrot();
        running = true;
        drawFrame();
    }, 30);
}
window.startFractal = startFractal;
