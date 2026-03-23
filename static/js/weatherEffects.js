// Weather Effects — realistic Rain, Thunderstorm, and Snow cycling every 8 s.
function startWeatherEffects(canvas, ctx) {
    let running = true;
    const W = canvas.width, H = canvas.height;

    const MODES = ['rain', 'thunder', 'snow'];
    let modeIdx = 0;
    let modeTimer = 0;
    let transAlpha = 0;          // fade-in alpha for new mode
    const MODE_DUR = 8000;       // ms per weather
    let lastTime = 0;

    // ---- Rain ----
    const raindrops = Array.from({ length: 250 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        len: Math.random() * 18 + 8,
        speed: Math.random() * 8 + 10,
        alpha: Math.random() * 0.4 + 0.2
    }));

    // ---- Snow ----
    const snowflakes = Array.from({ length: 180 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 4 + 1.5,
        speed: Math.random() * 1.2 + 0.4,
        drift: (Math.random() - 0.5) * 0.6,
        phase: Math.random() * Math.PI * 2,
        alpha: Math.random() * 0.5 + 0.4
    }));
    const accumulation = new Float32Array(W).fill(H); // snow surface height per x

    // ---- Thunder ----
    let lightning = null, flashAlpha = 0;
    let nextLightning = 800 + Math.random() * 2000;

    function makeLightning() {
        const x0 = W * 0.2 + Math.random() * W * 0.6;
        const segs = [];
        let cx = x0, cy = 0;
        while (cy < H * 0.85) {
            const dx = (Math.random() - 0.5) * 80;
            const dy = 35 + Math.random() * 45;
            segs.push({ x1: cx, y1: cy, x2: cx + dx, y2: cy + dy });
            cx += dx; cy += dy;
        }
        return { segs, life: 1.0 };
    }

    // ---- Cloud drawing ----
    function drawCloud(x, y, w, h, darkness) {
        const puffs = [
            { dx: 0,     dy: 0,    r: h * 0.6 },
            { dx: w*0.27, dy: h*0.1, r: h * 0.52 },
            { dx: -w*0.25, dy: h*0.12, r: h * 0.48 },
            { dx: w*0.5,  dy: h*0.2, r: h * 0.38 },
            { dx: -w*0.48, dy: h*0.22, r: h * 0.34 }
        ];
        const grey = Math.floor(darkness * 255);
        ctx.fillStyle = `rgb(${grey},${grey},${Math.floor(grey * 1.05)})`;
        for (const p of puffs) {
            ctx.beginPath();
            ctx.arc(x + p.dx, y + p.dy, p.r, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // ---- Sky gradient ----
    function drawSky(mode) {
        let top, bot;
        if (mode === 'snow') {
            top = '#0a0a2a'; bot = '#1a1a3a';
        } else if (mode === 'thunder') {
            top = '#050508'; bot = '#0d0d18';
        } else {
            top = '#0a0a20'; bot = '#151530';
        }
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, top);
        grad.addColorStop(1, bot);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
    }

    // ---- Rain frame ----
    function drawRain(dt) {
        drawSky('rain');

        // Clouds
        ctx.globalAlpha = 0.75;
        drawCloud(W * 0.15, 60,  220, 80, 0.22);
        drawCloud(W * 0.55, 40,  280, 90, 0.20);
        drawCloud(W * 0.80, 75,  180, 70, 0.24);
        ctx.globalAlpha = 1;

        // Rain streaks (angled 20° with wind)
        const windX = 0.35;
        for (const d of raindrops) {
            ctx.strokeStyle = `rgba(174,210,240,${d.alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(d.x + windX * d.len, d.y + d.len);
            ctx.stroke();
            d.x += windX * d.speed * dt * 0.06;
            d.y += d.speed * dt * 0.06;
            if (d.y > H) { d.y = -d.len; d.x = Math.random() * W; }
            if (d.x > W) d.x -= W;

            // Splash at ground
            if (d.y > H - 4) {
                ctx.strokeStyle = `rgba(174,210,240,${d.alpha * 0.5})`;
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.ellipse(d.x, H - 2, 6, 2, 0, 0, Math.PI);
                ctx.stroke();
            }
        }

        // Puddle ripples on ground
        ctx.strokeStyle = 'rgba(174,210,240,0.15)';
        ctx.lineWidth = 0.8;
        for (let rx = 60; rx < W - 60; rx += 120) {
            const phase = (Date.now() * 0.002 + rx * 0.01) % 1;
            const maxR = 25;
            ctx.globalAlpha = 1 - phase;
            ctx.beginPath();
            ctx.ellipse(rx + Math.sin(rx) * 20, H - 8, maxR * phase, maxR * phase * 0.35, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }

    // ---- Thunder frame ----
    function drawThunder(dt) {
        drawSky('thunder');

        // Dark storm clouds
        ctx.globalAlpha = 0.9;
        drawCloud(W * 0.1,  50, 280, 100, 0.14);
        drawCloud(W * 0.45, 30, 320, 110, 0.13);
        drawCloud(W * 0.78, 60, 240, 90,  0.15);
        ctx.globalAlpha = 1;

        // Rain (heavier during thunder)
        const windX = 0.45;
        for (const d of raindrops) {
            ctx.strokeStyle = `rgba(140,175,210,${d.alpha * 0.8})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(d.x + windX * d.len * 1.3, d.y + d.len * 1.3);
            ctx.stroke();
            d.x += windX * d.speed * dt * 0.07;
            d.y += d.speed * dt * 0.075;
            if (d.y > H) { d.y = -d.len; d.x = Math.random() * W; }
            if (d.x > W) d.x -= W;
        }

        // Lightning bolt
        nextLightning -= dt;
        if (nextLightning <= 0) {
            lightning = makeLightning();
            flashAlpha = 0.35;
            nextLightning = 900 + Math.random() * 2500;
        }

        // Screen flash
        if (flashAlpha > 0) {
            ctx.fillStyle = `rgba(200,220,255,${flashAlpha.toFixed(2)})`;
            ctx.fillRect(0, 0, W, H);
            flashAlpha *= 0.82;
        }

        if (lightning) {
            lightning.life -= dt * 0.008;
            if (lightning.life <= 0) {
                lightning = null;
            } else {
                // Outer glow
                ctx.shadowColor = '#aad4ff';
                ctx.shadowBlur = 20;
                ctx.strokeStyle = `rgba(200,230,255,${lightning.life * 0.4})`;
                ctx.lineWidth = 8;
                ctx.beginPath();
                for (let i = 0; i < lightning.segs.length; i++) {
                    const s = lightning.segs[i];
                    if (i === 0) ctx.moveTo(s.x1, s.y1);
                    ctx.lineTo(s.x2, s.y2);
                }
                ctx.stroke();
                // Core bolt
                ctx.strokeStyle = `rgba(255,255,255,${lightning.life})`;
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                for (let i = 0; i < lightning.segs.length; i++) {
                    const s = lightning.segs[i];
                    if (i === 0) ctx.moveTo(s.x1, s.y1);
                    ctx.lineTo(s.x2, s.y2);
                }
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
        }
    }

    // ---- Snow frame ----
    function drawSnow(dt) {
        drawSky('snow');

        // Clouds
        ctx.globalAlpha = 0.6;
        drawCloud(W * 0.2,  55, 250, 85, 0.28);
        drawCloud(W * 0.65, 40, 300, 95, 0.25);
        ctx.globalAlpha = 1;

        // Snowfall accumulation (smooth)
        ctx.fillStyle = 'rgba(230,240,255,0.7)';
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let x = 0; x < W; x++) {
            ctx.lineTo(x, accumulation[x]);
        }
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fill();

        // Flakes
        for (const f of snowflakes) {
            const tw = Math.sin(f.phase + Date.now() * 0.001) * 0.15 + 0.85;
            ctx.globalAlpha = f.alpha * tw;
            ctx.fillStyle = '#ddeeff';
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
            ctx.fill();

            f.phase += 0.02;
            f.x += f.drift + Math.sin(f.phase) * 0.4;
            f.y += f.speed * dt * 0.04;

            if (f.y > accumulation[Math.floor(f.x) % W] - f.r) {
                // Settle: lower the accumulation surface
                const xi = Math.floor(f.x) % W;
                for (let dx = -3; dx <= 3; dx++) {
                    const xi2 = (xi + dx + W) % W;
                    accumulation[xi2] = Math.max(H * 0.3, accumulation[xi2] - 0.4 * (1 - Math.abs(dx) / 4));
                }
                f.y = 0 - f.r;
                f.x = Math.random() * W;
            }
            if (f.x < 0) f.x += W;
            if (f.x > W) f.x -= W;
        }
        ctx.globalAlpha = 1;
    }

    function drawFrame(ts) {
        if (!running) return;
        const dt = Math.min(ts - lastTime, 50);
        lastTime = ts;
        modeTimer += dt;

        if (modeTimer >= MODE_DUR) {
            modeTimer = 0;
            modeIdx = (modeIdx + 1) % MODES.length;
            // Reset snow accumulation on weather change
            if (MODES[modeIdx] === 'snow') {
                for (let i = 0; i < W; i++) accumulation[i] = H;
            }
        }

        const mode = MODES[modeIdx];
        if (mode === 'rain')   drawRain(dt);
        if (mode === 'thunder') drawThunder(dt);
        if (mode === 'snow')   drawSnow(dt);

        // Mode badge
        const labels = { rain: '🌧 Heavy Rain', thunder: '⛈ Thunderstorm', snow: '❄ Snowfall' };
        const nextIn = ((MODE_DUR - modeTimer) / 1000).toFixed(0);
        ctx.fillStyle = 'rgba(5,5,20,0.6)';
        ctx.fillRect(0, 0, W, 30);
        ctx.fillStyle = '#7dd3fc';
        ctx.font = '13px "Space Grotesk",sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${labels[mode]}  ·  Next weather in ${nextIn}s`, 12, 20);

        requestAnimationFrame(drawFrame);
    }

    window.__currentDemoStop = function () { running = false; };
    requestAnimationFrame(drawFrame);
}
window.startWeatherEffects = startWeatherEffects;
