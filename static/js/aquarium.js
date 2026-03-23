// Virtual Aquarium — detailed fish, animated seaweed, bubbles, coral, light caustics.
function startAquarium(canvas, ctx) {
    let running = true;
    const W = canvas.width, H = canvas.height;
    const FLOOR = H * 0.82;

    // ---- Fish factory ----
    function makeFish(type) {
        const configs = {
            clownfish: { bodyW: 38, bodyH: 22, speed: 1.4,
                color1: '#ff6b2b', color2: '#ffffff', stripes: true, size: 1.1 },
            angelfish: { bodyW: 28, bodyH: 40, speed: 1.1,
                color1: '#f5c542', color2: '#1a1a1a', stripes: true, size: 1.0 },
            neon: { bodyW: 32, bodyH: 12, speed: 2.0,
                color1: '#00f5ff', color2: '#ff00aa', stripes: false, size: 0.85 },
        };
        const cfg = configs[type] || configs.neon;
        const margin = cfg.bodyW * cfg.size * 2;
        return {
            ...cfg, type,
            x: margin + Math.random() * (W - margin * 2),
            y: H * 0.15 + Math.random() * (FLOOR - H * 0.2),
            dir: Math.random() < 0.5 ? 1 : -1,
            tailPhase: Math.random() * Math.PI * 2,
            tailSpeed: 0.12 + Math.random() * 0.06,
            wobblePhase: Math.random() * Math.PI * 2,
            wobbleAmp: 0.3 + Math.random() * 0.4,
            turnTimer: 60 + Math.random() * 120
        };
    }

    const fishTypes = ['clownfish','clownfish','angelfish','angelfish','neon','neon','neon','neon'];
    const fishes = fishTypes.map(t => makeFish(t));

    // ---- Seaweed ----
    const seaweeds = Array.from({ length: 14 }, (_, i) => ({
        x: 40 + (i / 14) * (W - 80) + (Math.random() - 0.5) * 40,
        segments: 6 + (Math.random() * 4 | 0),
        height: 55 + Math.random() * 70,
        phase: Math.random() * Math.PI * 2,
        speed: 0.022 + Math.random() * 0.018,
        hue: 110 + Math.random() * 30
    }));

    // ---- Bubbles ----
    const bubbles = Array.from({ length: 40 }, () => ({
        x: Math.random() * W,
        y: FLOOR - Math.random() * 20,
        r: Math.random() * 5 + 2,
        speed: Math.random() * 0.8 + 0.3,
        wobble: Math.random() * Math.PI * 2,
        wobbleAmp: 1.5 + Math.random() * 2
    }));

    // ---- Coral ----
    const corals = Array.from({ length: 8 }, () => ({
        x: 60 + Math.random() * (W - 120),
        type: Math.random() < 0.5 ? 'branch' : 'fan',
        hue: Math.random() * 60 + 330,  // pink/red/orange
        size: 20 + Math.random() * 30
    }));

    function drawCoral(c, t) {
        ctx.save();
        ctx.translate(c.x, FLOOR);
        const s = c.size;
        if (c.type === 'branch') {
            function branch(len, angle, depth) {
                if (depth === 0 || len < 4) return;
                ctx.strokeStyle = `hsl(${c.hue},80%,${40 + depth * 8}%)`;
                ctx.lineWidth = depth;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                const endX = Math.sin(angle) * len, endY = -Math.cos(angle) * len;
                ctx.lineTo(endX, endY);
                ctx.stroke();
                ctx.translate(endX, endY);
                const sway = Math.sin(t * 0.8 + c.x) * 0.08;
                branch(len * 0.65, angle - 0.45 + sway, depth - 1);
                ctx.translate(-endX, -endY);
                ctx.translate(endX, endY);
                branch(len * 0.65, angle + 0.45 + sway, depth - 1);
                ctx.translate(-endX, -endY);
            }
            branch(s, 0, 4);
        } else {
            // Fan coral
            const sway = Math.sin(t * 0.6 + c.x * 0.01) * 0.12;
            ctx.strokeStyle = `hsl(${c.hue},70%,55%)`;
            ctx.lineWidth = 1;
            for (let a = -0.6 + sway; a <= 0.6 + sway; a += 0.12) {
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.quadraticCurveTo(
                    Math.sin(a) * s * 0.6, -s * 0.7,
                    Math.sin(a) * s, -s * (0.95 + Math.sin(a * 3) * 0.1)
                );
                ctx.stroke();
            }
        }
        ctx.restore();
    }

    // ---- Draw fish ----
    function drawFish(f, t) {
        ctx.save();
        ctx.translate(f.x, f.y);
        if (f.dir < 0) ctx.scale(-1, 1);

        const bW = f.bodyW * f.size, bH = f.bodyH * f.size;
        const tail = Math.sin(t * f.tailSpeed * 60 + f.tailPhase) * bH * 0.45;

        // Tail
        ctx.fillStyle = f.color1;
        ctx.beginPath();
        ctx.moveTo(-bW * 0.55, 0);
        ctx.lineTo(-bW * 1.05, -bH * 0.55 + tail);
        ctx.lineTo(-bW * 1.05, bH * 0.55 + tail);
        ctx.closePath();
        ctx.fill();

        // Body
        const bodyGrad = ctx.createRadialGradient(0, -bH * 0.15, 0, 0, 0, bW * 0.7);
        bodyGrad.addColorStop(0, lighten(f.color1, 30));
        bodyGrad.addColorStop(0.7, f.color1);
        bodyGrad.addColorStop(1, darken(f.color1, 20));
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, bW * 0.55, bH * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Stripes (clownfish / angelfish)
        if (f.stripes) {
            ctx.fillStyle = f.color2 + 'cc';
            if (f.type === 'clownfish') {
                // 3 white bands
                [-bW*0.1, bW*0.18, bW*0.42].forEach(sx => {
                    ctx.save();
                    ctx.beginPath();
                    ctx.ellipse(0, 0, bW*0.55, bH*0.5, 0, 0, Math.PI*2);
                    ctx.clip();
                    ctx.fillRect(sx - 5, -bH*0.5, 10, bH);
                    ctx.restore();
                });
            } else {
                // Angelfish dark vertical stripe
                ctx.save();
                ctx.beginPath();
                ctx.ellipse(0, 0, bW*0.55, bH*0.5, 0, 0, Math.PI*2);
                ctx.clip();
                ctx.fillStyle = f.color2 + '88';
                ctx.fillRect(-7, -bH*0.5, 14, bH);
                ctx.restore();
            }
        }

        // Dorsal fin
        ctx.fillStyle = f.color1 + 'bb';
        ctx.beginPath();
        ctx.moveTo(-bW*0.1, -bH*0.48);
        ctx.quadraticCurveTo(bW*0.1, -bH*0.9, bW*0.35, -bH*0.48);
        ctx.closePath();
        ctx.fill();

        // Pectoral fin
        ctx.fillStyle = f.color1 + '99';
        ctx.beginPath();
        ctx.ellipse(bW*0.05, bH*0.12, bW*0.18, bH*0.14, 0.3, 0, Math.PI*2);
        ctx.fill();

        // Eye
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(bW*0.32, -bH*0.1, bH*0.15, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(bW*0.34, -bH*0.1, bH*0.08, 0, Math.PI*2);
        ctx.fill();
        // Eye shine
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(bW*0.37, -bH*0.14, bH*0.03, 0, Math.PI*2);
        ctx.fill();

        // Neon stripe
        if (f.type === 'neon') {
            ctx.strokeStyle = f.color2;
            ctx.lineWidth = bH * 0.12;
            ctx.shadowColor = f.color2;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.moveTo(-bW*0.4, 0); ctx.lineTo(bW*0.35, 0);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        ctx.restore();
    }

    function lighten(hex, pct) {
        const n = parseInt(hex.slice(1), 16);
        const r = Math.min(255, ((n>>16)&255) + pct) | 0;
        const g = Math.min(255, ((n>>8)&255) + pct) | 0;
        const b = Math.min(255, (n&255) + pct) | 0;
        return `rgb(${r},${g},${b})`;
    }
    function darken(hex, pct) { return lighten(hex, -pct); }

    let t = 0, lastTime = 0;

    function drawFrame(ts) {
        if (!running) return;
        const dt = Math.min(ts - lastTime, 50);
        lastTime = ts;
        t += dt * 0.001;

        // Water background gradient
        const waterGrad = ctx.createLinearGradient(0, 0, 0, H);
        waterGrad.addColorStop(0, '#0a2a4a');
        waterGrad.addColorStop(0.6, '#062030');
        waterGrad.addColorStop(1, '#041018');
        ctx.fillStyle = waterGrad;
        ctx.fillRect(0, 0, W, H);

        // Caustic light rays at top
        ctx.save();
        for (let i = 0; i < 8; i++) {
            const cx = W * (0.05 + i * 0.12 + Math.sin(t * 0.4 + i) * 0.04);
            const rayAlpha = 0.04 + Math.sin(t * 0.7 + i * 1.1) * 0.025;
            const rayGrad = ctx.createLinearGradient(cx, 0, cx + 40, H * 0.5);
            rayGrad.addColorStop(0, `rgba(100,180,255,${rayAlpha})`);
            rayGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = rayGrad;
            ctx.beginPath();
            ctx.moveTo(cx - 15, 0);
            ctx.lineTo(cx + 40, H * 0.5);
            ctx.lineTo(cx + 55, H * 0.5);
            ctx.lineTo(cx, 0);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();

        // Sandy floor
        const sandGrad = ctx.createLinearGradient(0, FLOOR, 0, H);
        sandGrad.addColorStop(0, '#c8a855');
        sandGrad.addColorStop(0.3, '#a8883a');
        sandGrad.addColorStop(1, '#7a6025');
        ctx.fillStyle = sandGrad;
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 4) {
            ctx.lineTo(x, FLOOR + Math.sin(x * 0.05 + t * 0.3) * 3);
        }
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fill();

        // Pebbles on floor
        ctx.fillStyle = '#8a7030';
        for (let i = 0; i < 30; i++) {
            const px = (i * 137 + 50) % W;
            ctx.beginPath();
            ctx.ellipse(px, FLOOR + 6, 6 + (i % 4) * 2, 4, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Coral
        for (const c of corals) drawCoral(c, t);

        // Seaweed
        for (const sw of seaweeds) {
            const sway = Math.sin(t * sw.speed * 2 * Math.PI + sw.phase);
            ctx.strokeStyle = `hsl(${sw.hue},65%,32%)`;
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(sw.x, FLOOR);
            const segH = sw.height / sw.segments;
            for (let s = 1; s <= sw.segments; s++) {
                const sx = sw.x + Math.sin(t * sw.speed * Math.PI + sw.phase + s * 0.6) * sway * 14 * (s / sw.segments);
                const sy = FLOOR - s * segH;
                ctx.lineTo(sx, sy);
            }
            ctx.stroke();
        }

        // Bubbles
        for (const b of bubbles) {
            b.y -= b.speed * dt * 0.05;
            b.wobble += 0.04;
            const bx = b.x + Math.sin(b.wobble) * b.wobbleAmp;
            if (b.y < -b.r * 2) { b.y = FLOOR - Math.random() * 15; }

            ctx.globalAlpha = 0.5;
            ctx.strokeStyle = 'rgba(160,220,255,0.7)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(bx, b.y, b.r, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = 'rgba(200,235,255,0.15)';
            ctx.fill();
            // Shine
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.beginPath();
            ctx.arc(bx - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.25, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        // Fish
        for (const f of fishes) {
            // Gentle vertical wobble
            f.y += Math.sin(t * f.wobbleAmp * 2 + f.wobblePhase) * 0.3;
            f.x += f.dir * f.speed * dt * 0.04;

            f.turnTimer--;
            if (f.turnTimer <= 0 || f.x < 40 || f.x > W - 40) {
                f.dir *= -1;
                f.turnTimer = 80 + Math.random() * 150;
            }
            // Keep in bounds
            f.y = Math.max(H * 0.08, Math.min(FLOOR - f.bodyH * f.size, f.y));

            drawFish(f, t);
        }

        // Surface shimmer
        ctx.fillStyle = `rgba(100,180,255,${0.04 + Math.sin(t * 1.5) * 0.02})`;
        ctx.fillRect(0, 0, W, 3);

        // HUD
        ctx.fillStyle = 'rgba(5,5,20,0.6)';
        ctx.fillRect(0, 0, W, 30);
        ctx.fillStyle = '#22d3ee';
        ctx.font = '13px "Space Grotesk",sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Virtual Aquarium · Clownfish · Angelfish · Neonfish · Coral · Bubbles', 12, 20);

        requestAnimationFrame(drawFrame);
    }

    window.__currentDemoStop = function () { running = false; };
    requestAnimationFrame(drawFrame);
}
window.startAquarium = startAquarium;
