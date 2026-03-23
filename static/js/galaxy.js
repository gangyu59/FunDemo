// Spiral Galaxy — 2,500 stars in logarithmic spiral arms, rotating core glow, shooting stars.
function startGalaxy(canvas, ctx) {
    let running = true;
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const R = Math.min(W, H) * 0.44;

    // ---------- build star field ----------
    const bgStars = [];    // fixed background
    const galStars = [];   // rotating galaxy

    // Distant background stars
    for (let i = 0; i < 350; i++) {
        const bri = Math.random() * 180 + 60 | 0;
        bgStars.push({
            x: Math.random() * W, y: Math.random() * H,
            size: Math.random() * 0.9 + 0.2,
            alpha: Math.random() * 0.5 + 0.1,
            r: bri, g: bri, b: Math.min(255, bri + 25),
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.03 + 0.005
        });
    }

    // Galaxy core — warm yellow-white
    for (let i = 0; i < 500; i++) {
        const rr = Math.pow(Math.random(), 2.5) * R * 0.18;
        const θ = Math.random() * Math.PI * 2;
        const bri = Math.random() * 60 + 195 | 0;
        galStars.push({
            x: cx + rr * Math.cos(θ),
            y: cy + rr * Math.sin(θ) * 0.52,
            size: Math.random() * 1.8 + 0.4,
            alpha: Math.random() * 0.5 + 0.5,
            r: bri, g: Math.max(0, bri - 10), b: Math.max(0, bri - 45),
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.03 + 0.005
        });
    }

    // Two spiral arms
    for (let arm = 0; arm < 2; arm++) {
        const armOff = arm * Math.PI;
        for (let i = 0; i < 825; i++) {
            const t = Math.pow(Math.random(), 0.6);
            const radius = t * R * 0.88 + R * 0.06;
            const windAngle = t * 3.3 + armOff;
            const spread = (0.22 - t * 0.12) * (Math.random() * 2 - 1);
            const θ = windAngle + spread;
            // arm 0 = blue-ish; arm 1 = cyan-ish
            const rr = arm === 0 ? (100 + Math.random() * 80 | 0) : (80 + Math.random() * 100 | 0);
            const gg = 150 + Math.random() * 80 | 0;
            galStars.push({
                x: cx + radius * Math.cos(θ),
                y: cy + radius * Math.sin(θ) * 0.52,
                size: Math.random() * 1.3 + 0.25,
                alpha: Math.random() * 0.6 + 0.3,
                r: rr, g: gg, b: 255,
                phase: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.03 + 0.005
            });
        }
    }

    // ---------- shooting star ----------
    let meteor = null;
    let nextMeteor = 2000 + Math.random() * 5000;

    function spawnMeteor() {
        const x0 = Math.random() * W * 0.4;
        const y0 = Math.random() * H * 0.4;
        const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.5;
        meteor = { x: x0, y: y0, vx: Math.cos(angle) * 13, vy: Math.sin(angle) * 13, life: 1.0 };
    }

    let rotation = 0, lastTime = 0;

    function drawFrame(ts) {
        if (!running) return;
        const dt = Math.min(ts - lastTime, 50);
        lastTime = ts;
        rotation += 0.00016 * dt;
        const now = ts;

        // Background
        ctx.fillStyle = '#000008';
        ctx.fillRect(0, 0, W, H);

        // Outer nebula glow
        const neb = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.65);
        neb.addColorStop(0, 'rgba(100,70,220,0.15)');
        neb.addColorStop(0.5, 'rgba(20,50,160,0.07)');
        neb.addColorStop(1, 'transparent');
        ctx.fillStyle = neb;
        ctx.beginPath();
        ctx.ellipse(cx, cy, R * 0.65, R * 0.36, 0, 0, Math.PI * 2);
        ctx.fill();

        // Background stars (fixed)
        for (const s of bgStars) {
            const tw = Math.sin(now * s.speed + s.phase) * 0.18 + 0.82;
            ctx.globalAlpha = s.alpha * tw;
            ctx.fillStyle = `rgb(${s.r},${s.g},${s.b})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Galaxy (rotating)
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation);
        ctx.translate(-cx, -cy);

        for (const s of galStars) {
            const tw = Math.sin(now * s.speed + s.phase) * 0.12 + 0.88;
            ctx.globalAlpha = s.alpha * tw;
            ctx.fillStyle = `rgb(${s.r},${s.g},${s.b})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Core glow (bright centre)
        const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.13);
        core.addColorStop(0, 'rgba(255,248,220,0.9)');
        core.addColorStop(0.35, 'rgba(255,220,130,0.35)');
        core.addColorStop(1, 'transparent');
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.ellipse(cx, cy, R * 0.13, R * 0.075, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Shooting star
        nextMeteor -= dt;
        if (nextMeteor <= 0) {
            spawnMeteor();
            nextMeteor = 5000 + Math.random() * 8000;
        }
        if (meteor) {
            meteor.x += meteor.vx;
            meteor.y += meteor.vy;
            meteor.life -= 0.016;
            if (meteor.life <= 0 || meteor.x > W + 30 || meteor.y > H + 30) {
                meteor = null;
            } else {
                const tx = meteor.x - meteor.vx * 10, ty = meteor.y - meteor.vy * 10;
                const gr = ctx.createLinearGradient(tx, ty, meteor.x, meteor.y);
                gr.addColorStop(0, 'rgba(255,255,255,0)');
                gr.addColorStop(1, `rgba(200,230,255,${(meteor.life * 0.85).toFixed(2)})`);
                ctx.strokeStyle = gr;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(tx, ty);
                ctx.lineTo(meteor.x, meteor.y);
                ctx.stroke();
                ctx.fillStyle = `rgba(255,255,255,${meteor.life.toFixed(2)})`;
                ctx.beginPath();
                ctx.arc(meteor.x, meteor.y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // HUD
        ctx.fillStyle = 'rgba(0,0,10,0.55)';
        ctx.fillRect(0, 0, W, 30);
        ctx.fillStyle = '#7dd3fc';
        ctx.font = '13px "Space Grotesk",sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Spiral Galaxy · 2,500 stars · Watch for shooting stars!', 12, 20);

        requestAnimationFrame(drawFrame);
    }

    window.__currentDemoStop = function () { running = false; };
    requestAnimationFrame(drawFrame);
}
window.startGalaxy = startGalaxy;
