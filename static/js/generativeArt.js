// Generative Art — 800 particles flowing through a smooth noise-based vector field.
// Leaves glowing color trails. Regenerates automatically every ~25 s.
function startGenerativeArt(canvas, ctx) {
    let running = true;
    const W = canvas.width, H = canvas.height;
    const NUM_PARTICLES = 800;

    // Simple smooth noise: sum of sin/cos at different frequencies
    function fieldAngle(x, y, t) {
        const s = 0.0022;
        return Math.sin(x * s + t * 0.6) * Math.cos(y * s * 0.9 + t * 0.4) * Math.PI
             + Math.cos(x * s * 1.7 - t * 0.35) * Math.sin(y * s * 1.3 + t * 0.55) * Math.PI * 0.5
             + Math.sin((x + y) * s * 0.8 + t * 0.25) * Math.PI * 0.4;
    }

    let particles = [];
    let t = 0, frameCount = 0;

    // Colour palette: deep space rainbow
    const palettes = [
        ['#6366f1','#a855f7','#ec4899','#f59e0b','#22d3ee'],
        ['#34d399','#22d3ee','#60a5fa','#818cf8','#a78bfa'],
        ['#f97316','#ef4444','#ec4899','#a855f7','#6366f1'],
    ];
    let palette = palettes[0];

    function resetParticles() {
        palette = palettes[frameCount % palettes.length | 0];
        particles = [];
        for (let i = 0; i < NUM_PARTICLES; i++) {
            particles.push({
                x: Math.random() * W,
                y: Math.random() * H,
                life: Math.random(),          // 0..1, staggered start
                speed: Math.random() * 1.8 + 0.6,
                colorIdx: Math.random() * palette.length | 0,
                alpha: Math.random() * 0.6 + 0.2
            });
        }
    }

    function hexToRgb(hex) {
        const n = parseInt(hex.slice(1), 16);
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }

    function drawFrame() {
        if (!running) return;
        t += 0.008;
        frameCount++;

        // Slow fade trail (don't full-clear so trails persist)
        ctx.fillStyle = 'rgba(5,5,20,0.06)';
        ctx.fillRect(0, 0, W, H);

        ctx.lineWidth = 1.2;

        for (const p of particles) {
            p.life += 0.004;
            if (p.life > 1) {
                // respawn at random position
                p.x = Math.random() * W;
                p.y = Math.random() * H;
                p.life = 0;
                p.speed = Math.random() * 1.8 + 0.6;
                p.colorIdx = Math.random() * palette.length | 0;
                p.alpha = Math.random() * 0.6 + 0.2;
            }

            const angle = fieldAngle(p.x, p.y, t);
            const nx = p.x + Math.cos(angle) * p.speed;
            const ny = p.y + Math.sin(angle) * p.speed;

            // life curve: fade in then out
            const lifeAlpha = Math.sin(p.life * Math.PI);
            const [r, g, b] = hexToRgb(palette[p.colorIdx]);

            ctx.strokeStyle = `rgba(${r},${g},${b},${(lifeAlpha * p.alpha).toFixed(2)})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(nx, ny);
            ctx.stroke();

            p.x = ((nx % W) + W) % W;
            p.y = ((ny % H) + H) % H;
        }

        // Periodic palette refresh with white flash
        if (frameCount % 1500 === 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.03)';
            ctx.fillRect(0, 0, W, H);
            palette = palettes[(frameCount / 1500 | 0) % palettes.length];
        }

        // HUD
        ctx.fillStyle = 'rgba(5,5,20,0.6)';
        ctx.fillRect(0, 0, W, 30);
        ctx.fillStyle = '#fbbf24';
        ctx.font = '13px "Space Grotesk",sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Generative Art · Particle Flow Field · 800 particles', 12, 20);

        requestAnimationFrame(drawFrame);
    }

    window.__currentDemoStop = function () { running = false; };

    ctx.fillStyle = '#05050f';
    ctx.fillRect(0, 0, W, H);
    resetParticles();
    requestAnimationFrame(drawFrame);
}
window.startGenerativeArt = startGenerativeArt;
