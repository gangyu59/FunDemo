// Storybook — "The Birth of a Star" animated story, drawn entirely on canvas.
// No image loading needed. Auto-advances through 5 scenes with transitions.
function startStorybook(canvas, ctx) {
    let running = true;
    const W = canvas.width, H = canvas.height;

    const SCENE_DUR = 7000;   // ms per scene
    const FADE_DUR  = 800;    // ms fade between scenes
    const NUM_SCENES = 5;

    let sceneIdx = 0;
    let sceneTimer = 0;
    let fadeAlpha = 0;        // 0 = visible, 1 = black (mid-transition)
    let fading = false, fadingIn = false;
    let lastTime = 0;

    // ---- Shared star data ----
    const bgStars = Array.from({ length: 280 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1.4 + 0.3,
        alpha: Math.random() * 0.7 + 0.15,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.004
    }));

    // ---- Per-scene drawing functions ----

    // Scene 0: Empty dark universe, stars appear
    function scene0(t, progress) {
        ctx.fillStyle = '#01010a';
        ctx.fillRect(0, 0, W, H);
        // Stars fade in
        const starAlpha = Math.min(1, progress * 2);
        for (const s of bgStars) {
            const tw = Math.sin(t * s.speed * 4 + s.phase) * 0.12 + 0.88;
            ctx.globalAlpha = s.alpha * tw * starAlpha;
            ctx.fillStyle = '#cce8ff';
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        narrate(ctx, W, H, '"In the beginning, there was only darkness and gas…"', progress);
    }

    // Scene 1: Nebula gas cloud forming
    function scene1(t, progress) {
        ctx.fillStyle = '#01010a';
        ctx.fillRect(0, 0, W, H);

        for (const s of bgStars) {
            ctx.globalAlpha = s.alpha * 0.5;
            ctx.fillStyle = '#cce8ff';
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Nebula cloud (multiple overlapping radial gradients)
        const puffs = [
            { cx: W*0.5,  cy: H*0.48, r: 180, hue: 260 },
            { cx: W*0.38, cy: H*0.42, r: 130, hue: 230 },
            { cx: W*0.62, cy: H*0.52, r: 140, hue: 280 },
            { cx: W*0.5,  cy: H*0.62, r: 110, hue: 200 },
        ];
        for (const p of puffs) {
            const grow = Math.min(1, progress * 1.5);
            const grad = ctx.createRadialGradient(p.cx, p.cy, 0, p.cx, p.cy, p.r * grow);
            grad.addColorStop(0, `hsla(${p.hue},80%,55%,0.28)`);
            grad.addColorStop(0.5, `hsla(${p.hue},70%,40%,0.12)`);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, H);
        }
        // Drifting dust particles
        const N = 120;
        for (let i = 0; i < N; i++) {
            const angle = (i / N) * Math.PI * 2 + t * 0.05;
            const r = 40 + Math.sin(i * 2.1 + t * 0.3) * 80 + progress * 50;
            const px = W/2 + Math.cos(angle) * r * (1 + Math.sin(i * 0.7) * 0.4);
            const py = H/2 + Math.sin(angle) * r * 0.6;
            ctx.globalAlpha = 0.35 * progress;
            ctx.fillStyle = `hsl(${240 + i},60%,70%)`;
            ctx.beginPath();
            ctx.arc(px, py, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        narrate(ctx, W, H, '"A vast cloud of hydrogen gas drifts through space…"', progress);
    }

    // Scene 2: Gravity pulls gas inward — proto-star
    function scene2(t, progress) {
        ctx.fillStyle = '#01010a';
        ctx.fillRect(0, 0, W, H);

        for (const s of bgStars) {
            ctx.globalAlpha = s.alpha * 0.4;
            ctx.fillStyle = '#cce8ff';
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        const cx = W / 2, cy = H * 0.47;
        const maxR = 120 - progress * 80;   // cloud shrinks
        const coreR = 8 + progress * 32;    // core grows

        // Infalling gas streams
        const streams = 24;
        for (let i = 0; i < streams; i++) {
            const angle = (i / streams) * Math.PI * 2;
            const phase = t * 0.8 + i;
            const startR = maxR + 60 + Math.sin(phase) * 20;
            const x1 = cx + Math.cos(angle) * startR;
            const y1 = cy + Math.sin(angle) * startR * 0.6;
            const cp1x = cx + Math.cos(angle + 0.8) * maxR * 0.5;
            const cp1y = cy + Math.sin(angle + 0.8) * maxR * 0.35;
            const grad = ctx.createLinearGradient(x1, y1, cx, cy);
            grad.addColorStop(0, 'transparent');
            grad.addColorStop(0.6, `hsla(${180 + i * 5},80%,60%,0.15)`);
            grad.addColorStop(1, `hsla(40,100%,70%,0.3)`);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.quadraticCurveTo(cp1x, cp1y, cx, cy);
            ctx.stroke();
        }

        // Proto-star glow
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 3);
        glow.addColorStop(0, `rgba(255,200,80,0.9)`);
        glow.addColorStop(0.3, `rgba(255,120,30,0.4)`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, coreR * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fffde0';
        ctx.beginPath();
        ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
        ctx.fill();

        narrate(ctx, W, H, '"Gravity pulls the gas inward. A protostar is born!"', progress);
    }

    // Scene 3: Star ignites — nuclear fusion begins
    function scene3(t, progress) {
        const cx = W / 2, cy = H * 0.45;
        const R = 45 + progress * 20;

        ctx.fillStyle = '#01010a';
        ctx.fillRect(0, 0, W, H);

        for (const s of bgStars) {
            ctx.globalAlpha = s.alpha * 0.5;
            ctx.fillStyle = '#cce8ff';
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Stellar wind / corona
        const rays = 20;
        for (let i = 0; i < rays; i++) {
            const angle = (i / rays) * Math.PI * 2 + t * 0.15;
            const len = R * (1.4 + Math.sin(t * 2 + i) * 0.5) * (0.5 + progress * 0.6);
            const x1 = cx + Math.cos(angle) * R, y1 = cy + Math.sin(angle) * R;
            const x2 = cx + Math.cos(angle) * (R + len), y2 = cy + Math.sin(angle) * (R + len);
            const rayGrad = ctx.createLinearGradient(x1, y1, x2, y2);
            rayGrad.addColorStop(0, `rgba(255,200,60,${0.5 * progress})`);
            rayGrad.addColorStop(1, 'transparent');
            ctx.strokeStyle = rayGrad;
            ctx.lineWidth = 2.5 + Math.sin(t + i) * 1;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }

        // Outer corona glow
        const corona = ctx.createRadialGradient(cx, cy, R, cx, cy, R * 4);
        corona.addColorStop(0, `rgba(255,180,30,${0.4 * progress})`);
        corona.addColorStop(0.5, `rgba(255,80,10,${0.12 * progress})`);
        corona.addColorStop(1, 'transparent');
        ctx.fillStyle = corona;
        ctx.beginPath();
        ctx.arc(cx, cy, R * 4, 0, Math.PI * 2);
        ctx.fill();

        // Star body
        const starGrad = ctx.createRadialGradient(cx - R*0.3, cy - R*0.3, 0, cx, cy, R);
        starGrad.addColorStop(0, '#fffde0');
        starGrad.addColorStop(0.4, '#ffe060');
        starGrad.addColorStop(0.8, '#ff8020');
        starGrad.addColorStop(1, '#ff4010');
        ctx.fillStyle = starGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fill();

        // Surface granulation (convection cells)
        for (let i = 0; i < 12; i++) {
            const gAngle = i * 0.52 + t * 0.1;
            const gr = R * 0.65;
            const gx = cx + Math.cos(gAngle) * gr * 0.7;
            const gy = cy + Math.sin(gAngle) * gr * 0.7;
            ctx.fillStyle = 'rgba(255,120,0,0.3)';
            ctx.beginPath();
            ctx.arc(gx, gy, 8, 0, Math.PI * 2);
            ctx.fill();
        }

        narrate(ctx, W, H, '"Nuclear fusion ignites! The star blazes to life!"', progress);
    }

    // Scene 4: Solar system forms — planets orbit the star
    function scene4(t, progress) {
        const cx = W / 2, cy = H * 0.47;

        ctx.fillStyle = '#01010a';
        ctx.fillRect(0, 0, W, H);

        for (const s of bgStars) {
            ctx.globalAlpha = s.alpha * 0.5;
            ctx.fillStyle = '#cce8ff';
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        const planets = [
            { a: 70,  b: 28, speed: 1.8,  r: 7,  color: '#c0a060', offset: 0 },
            { a: 115, b: 48, speed: 1.1,  r: 10, color: '#4488ff', offset: 1.2 },
            { a: 165, b: 68, speed: 0.7,  r: 13, color: '#e07030', offset: 2.4 },
            { a: 225, b: 90, speed: 0.38, r: 18, color: '#d8b060', offset: 0.7, rings: true },
        ];

        // Star glow (small, stable)
        const starglow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 55);
        starglow.addColorStop(0, '#fffde0');
        starglow.addColorStop(0.35, '#ffe060aa');
        starglow.addColorStop(1, 'transparent');
        ctx.fillStyle = starglow;
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#fffde0';
        ctx.beginPath();
        ctx.arc(cx, cy, 26, 0, Math.PI * 2);
        ctx.fill();

        for (const p of planets) {
            const appear = Math.min(1, (progress - 0.1) * 1.5);
            if (appear <= 0) continue;

            // Orbit path
            ctx.strokeStyle = `rgba(255,255,255,${0.08 * appear})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.ellipse(cx, cy, p.a, p.b, 0, 0, Math.PI * 2);
            ctx.stroke();

            // Planet position
            const angle = t * p.speed + p.offset;
            const px2 = cx + Math.cos(angle) * p.a;
            const py2 = cy + Math.sin(angle) * p.b;

            // Rings (Saturn-like)
            if (p.rings) {
                ctx.save();
                ctx.translate(px2, py2);
                ctx.globalAlpha = 0.55 * appear;
                ctx.strokeStyle = '#c8a040';
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.ellipse(0, 0, p.r * 2.2, p.r * 0.6, 0.3, 0, Math.PI * 2);
                ctx.stroke();
                ctx.globalAlpha = 1;
                ctx.restore();
            }

            // Planet
            const pGrad = ctx.createRadialGradient(px2 - p.r*0.3, py2 - p.r*0.3, 0, px2, py2, p.r);
            pGrad.addColorStop(0, '#ffffff88');
            pGrad.addColorStop(0.3, p.color);
            pGrad.addColorStop(1, darkenHex(p.color, 40));
            ctx.globalAlpha = appear;
            ctx.fillStyle = pGrad;
            ctx.beginPath();
            ctx.arc(px2, py2, p.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        narrate(ctx, W, H, '"From the dust and gas, a solar system is born. Welcome home!"', progress);
    }

    function darkenHex(hex, amt) {
        const n = parseInt(hex.slice(1), 16);
        const r = Math.max(0, ((n>>16)&255) - amt);
        const g = Math.max(0, ((n>>8)&255) - amt);
        const b = Math.max(0, (n&255) - amt);
        return `rgb(${r},${g},${b})`;
    }

    // ---- Narration text ----
    function narrate(ctx, W, H, text, progress) {
        const alpha = Math.sin(Math.min(progress, 1) * Math.PI) * 0.9;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = 'rgba(5,5,20,0.6)';
        ctx.fillRect(0, H * 0.77, W, H * 0.23);
        ctx.fillStyle = '#e8e8f0';
        ctx.font = '16px "Space Grotesk",sans-serif';
        ctx.textAlign = 'center';
        // Simple word-wrap
        const words = text.split(' ');
        let line = '', lines = [], maxW = W - 60;
        for (const w of words) {
            const test = line + (line ? ' ' : '') + w;
            if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
            else line = test;
        }
        if (line) lines.push(line);
        const lineH = 22, startY = H * 0.81 + (H * 0.19 - lines.length * lineH) / 2;
        lines.forEach((l, i) => ctx.fillText(l, W / 2, startY + i * lineH));
        ctx.globalAlpha = 1;
    }

    const sceneFns = [scene0, scene1, scene2, scene3, scene4];

    function drawFrame(ts) {
        if (!running) return;
        const dt = Math.min(ts - lastTime, 50);
        lastTime = ts;

        if (!fading) {
            sceneTimer += dt;
            if (sceneTimer >= SCENE_DUR) {
                fading = true; fadingIn = false; fadeAlpha = 0; sceneTimer = 0;
            }
        }

        const t = ts * 0.001;
        const progress = Math.min(1, sceneTimer / SCENE_DUR);
        sceneFns[sceneIdx](t, progress);

        // Fade overlay
        if (fading) {
            fadeAlpha += dt / FADE_DUR * (fadingIn ? -1 : 1);
            if (!fadingIn && fadeAlpha >= 1) {
                sceneIdx = (sceneIdx + 1) % NUM_SCENES;
                fadingIn = true;
            }
            if (fadingIn && fadeAlpha <= 0) {
                fading = false; fadeAlpha = 0;
            }
            fadeAlpha = Math.max(0, Math.min(1, fadeAlpha));
            ctx.fillStyle = `rgba(0,0,0,${fadeAlpha.toFixed(3)})`;
            ctx.fillRect(0, 0, W, H);
        }

        // HUD
        ctx.fillStyle = 'rgba(5,5,20,0.6)';
        ctx.fillRect(0, 0, W, 30);
        ctx.fillStyle = '#fbbf24';
        ctx.font = '13px "Space Grotesk",sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`The Birth of a Star  ·  Scene ${sceneIdx + 1}/${NUM_SCENES}`, 12, 20);

        requestAnimationFrame(drawFrame);
    }

    window.__currentDemoStop = function () { running = false; };

    ctx.fillStyle = '#01010a';
    ctx.fillRect(0, 0, W, H);
    requestAnimationFrame(drawFrame);
}
window.startStorybook = startStorybook;
