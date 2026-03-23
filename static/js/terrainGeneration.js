// Terrain Generation — Diamond-Square algorithm, multi-layer parallax landscape.
// Auto-scrolls right; includes sky/stars, mountain layers, trees, and animated water.
function startTerrainGeneration(canvas, ctx) {
    let running = true;
    const W = canvas.width, H = canvas.height;

    // ---- Diamond-Square midpoint displacement ----
    function diamondSquare(size, roughness) {
        // size must be 2^n + 1
        const arr = new Float32Array(size * size);
        arr[0] = Math.random();
        arr[size - 1] = Math.random();
        arr[(size - 1) * size] = Math.random();
        arr[size * size - 1] = Math.random();

        let step = size - 1, scale = roughness;
        while (step > 1) {
            const half = step >> 1;
            // Diamond
            for (let y = 0; y < size - 1; y += step) {
                for (let x = 0; x < size - 1; x += step) {
                    const avg = (arr[y*size+x] + arr[y*size+x+step] +
                                 arr[(y+step)*size+x] + arr[(y+step)*size+x+step]) / 4;
                    arr[(y+half)*size+(x+half)] = avg + (Math.random()*2-1)*scale;
                }
            }
            // Square
            for (let y = 0; y < size; y += half) {
                for (let x = (y + half) % step; x < size; x += step) {
                    let count = 0, sum = 0;
                    if (y - half >= 0)      { sum += arr[(y-half)*size+x]; count++; }
                    if (y + half < size)    { sum += arr[(y+half)*size+x]; count++; }
                    if (x - half >= 0)      { sum += arr[y*size+(x-half)]; count++; }
                    if (x + half < size)    { sum += arr[y*size+(x+half)]; count++; }
                    arr[y*size+x] = sum/count + (Math.random()*2-1)*scale;
                }
            }
            step = half; scale *= 0.58;
        }
        return arr;
    }

    const TSIZE = 513;  // 2^9 + 1
    const hmap = diamondSquare(TSIZE, 0.7);

    // Sample a row from the heightmap at given scroll offset and y-fraction
    function getRow(scrollFrac, rowY, amplitude) {
        const mapY = Math.floor(rowY * (TSIZE - 1)) * TSIZE;
        const heights = new Float32Array(W);
        for (let x = 0; x < W; x++) {
            const frac = ((scrollFrac + x / W) % 1 + 1) % 1;
            const mapX = frac * (TSIZE - 1);
            const xi = Math.floor(mapX), t = mapX - xi;
            const xi2 = Math.min(xi + 1, TSIZE - 1);
            const v = hmap[mapY + xi] * (1 - t) + hmap[mapY + xi2] * t;
            heights[x] = (1 - v) * amplitude;
        }
        return heights;
    }

    // ---- Stars ----
    const stars = Array.from({ length: 200 }, () => ({
        x: Math.random() * W, y: Math.random() * H * 0.55,
        r: Math.random() * 1.2 + 0.3,
        alpha: Math.random() * 0.7 + 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.015 + 0.003
    }));

    // ---- Trees (cached sprites) ----
    function drawTree(x, y, h) {
        // Trunk
        ctx.fillStyle = '#3d1f0a';
        ctx.fillRect(x - 3, y - h * 0.3, 6, h * 0.3);
        // Canopy layers
        const layers = 3;
        for (let i = 0; i < layers; i++) {
            const ly = y - h * 0.3 - (i + 1) * h * 0.22;
            const lw = h * (0.55 - i * 0.1);
            ctx.fillStyle = `hsl(${125 + i * 8}, 55%, ${22 + i * 5}%)`;
            ctx.beginPath();
            ctx.moveTo(x, ly - h * 0.22);
            ctx.lineTo(x + lw, ly);
            ctx.lineTo(x - lw, ly);
            ctx.closePath();
            ctx.fill();
        }
    }

    let scroll = 0, t = 0, lastTime = 0;

    function drawFrame(ts) {
        if (!running) return;
        const dt = Math.min(ts - lastTime, 50);
        lastTime = ts;
        t += dt * 0.001;
        scroll = (scroll + dt * 0.00008) % 1;

        // Sky gradient (night-ish)
        const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.65);
        skyGrad.addColorStop(0, '#04040f');
        skyGrad.addColorStop(0.6, '#0c1230');
        skyGrad.addColorStop(1, '#1a2040');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, W, H);

        // Stars (twinkle)
        for (const s of stars) {
            const tw = Math.sin(t * s.speed * 6 + s.phase) * 0.2 + 0.8;
            ctx.globalAlpha = s.alpha * tw;
            ctx.fillStyle = '#ddeeff';
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Moon
        const moonX = W * 0.82, moonY = H * 0.12;
        ctx.fillStyle = '#fffde0';
        ctx.beginPath();
        ctx.arc(moonX, moonY, 32, 0, Math.PI * 2);
        ctx.fill();
        const moonGlow = ctx.createRadialGradient(moonX, moonY, 30, moonX, moonY, 80);
        moonGlow.addColorStop(0, 'rgba(255,255,200,0.15)');
        moonGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = moonGlow;
        ctx.beginPath();
        ctx.arc(moonX, moonY, 80, 0, Math.PI * 2);
        ctx.fill();

        // Far mountains (very slow parallax)
        const mtnFar = getRow((scroll * 0.18) % 1, 0.1, H * 0.42);
        const mtnBase = H * 0.52;
        ctx.fillStyle = '#151b35';
        ctx.beginPath();
        ctx.moveTo(0, H);
        ctx.lineTo(0, mtnBase - mtnFar[0]);
        for (let x = 1; x < W; x++) ctx.lineTo(x, mtnBase - mtnFar[x]);
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fill();

        // Snow caps on far mountains
        ctx.fillStyle = 'rgba(230,240,255,0.5)';
        ctx.beginPath();
        ctx.moveTo(0, mtnBase - mtnFar[0]);
        for (let x = 0; x < W; x++) {
            const h2 = mtnFar[x];
            if (h2 > H * 0.26) ctx.lineTo(x, mtnBase - h2);
            else ctx.moveTo(x, mtnBase - mtnFar[x]);
        }
        ctx.stroke && ctx.stroke();
        // simpler: draw snow where tall enough
        for (let x = 0; x < W - 1; x++) {
            if (mtnFar[x] > H * 0.26) {
                ctx.fillStyle = 'rgba(230,240,255,0.55)';
                ctx.fillRect(x, mtnBase - mtnFar[x], 1, 8);
            }
        }

        // Near hills (medium parallax)
        const hills = getRow((scroll * 0.55) % 1, 0.3, H * 0.32);
        const hillBase = H * 0.64;
        const hillGrad = ctx.createLinearGradient(0, hillBase - H*0.32, 0, hillBase);
        hillGrad.addColorStop(0, '#1a3a1a');
        hillGrad.addColorStop(1, '#0f280f');
        ctx.fillStyle = hillGrad;
        ctx.beginPath();
        ctx.moveTo(0, H);
        ctx.lineTo(0, hillBase - hills[0]);
        for (let x = 1; x < W; x++) ctx.lineTo(x, hillBase - hills[x]);
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fill();

        // Tree line on hills (fast parallax)
        const treeScroll = (scroll * 1.4) % 1;
        const treeLine = getRow(treeScroll, 0.35, H * 0.28);
        const treeBase = H * 0.68;
        // Forest silhouette
        ctx.fillStyle = '#0d200d';
        ctx.beginPath();
        ctx.moveTo(0, H);
        ctx.lineTo(0, treeBase - treeLine[0]);
        for (let x = 1; x < W; x++) {
            const fy = treeBase - treeLine[x];
            // jagged treetops
            const jag = Math.sin(x * 0.18 + treeScroll * Math.PI * 2 * 10) * 8;
            ctx.lineTo(x, fy + jag);
        }
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fill();

        // Ground (fastest parallax)
        const ground = getRow((scroll * 2.5) % 1, 0.5, H * 0.15);
        const groundBase = H * 0.80;
        const groundGrad = ctx.createLinearGradient(0, groundBase - H*0.15, 0, H);
        groundGrad.addColorStop(0, '#1e3a0e');
        groundGrad.addColorStop(0.4, '#15280a');
        groundGrad.addColorStop(1, '#0c1808');
        ctx.fillStyle = groundGrad;
        ctx.beginPath();
        ctx.moveTo(0, H);
        ctx.lineTo(0, groundBase - ground[0]);
        for (let x = 1; x < W; x++) ctx.lineTo(x, groundBase - ground[x]);
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fill();

        // Animated water / river at bottom
        const waterY = H * 0.86;
        const waterGrad = ctx.createLinearGradient(0, waterY, 0, H);
        waterGrad.addColorStop(0, '#0a2040');
        waterGrad.addColorStop(1, '#061020');
        ctx.fillStyle = waterGrad;
        ctx.fillRect(0, waterY, W, H - waterY);

        // Water ripples
        ctx.strokeStyle = 'rgba(80,160,220,0.22)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
            const wy = waterY + 8 + i * 12;
            const phase = t * 1.8 + i * 0.7;
            ctx.beginPath();
            for (let x = 0; x < W; x++) {
                const y2 = wy + Math.sin(x * 0.03 + phase) * 3;
                x === 0 ? ctx.moveTo(x, y2) : ctx.lineTo(x, y2);
            }
            ctx.stroke();
        }

        // Water reflection shimmer
        ctx.fillStyle = `rgba(80,160,255,${0.04 + Math.sin(t * 2) * 0.02})`;
        ctx.fillRect(0, waterY, W, 4);

        // HUD
        ctx.fillStyle = 'rgba(5,5,20,0.6)';
        ctx.fillRect(0, 0, W, 30);
        ctx.fillStyle = '#86efac';
        ctx.font = '13px "Space Grotesk",sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Terrain · Diamond-Square Algorithm · Parallax Scrolling', 12, 20);

        requestAnimationFrame(drawFrame);
    }

    window.__currentDemoStop = function () { running = false; };
    requestAnimationFrame(drawFrame);
}
window.startTerrainGeneration = startTerrainGeneration;
