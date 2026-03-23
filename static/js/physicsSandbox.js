// Physics Sandbox — interactive gravity simulation.
// Tap / click to drop colorful balls. Ball-ball and ball-wall collisions included.
function startPhysicsSandbox(canvas, ctx) {
    let running = true;
    const W = canvas.width, H = canvas.height;
    const GRAVITY = 0.45;
    const DAMPING = 0.72;   // energy kept on wall bounce
    const FRICTION = 0.995; // velocity damping per frame
    const MAX_BALLS = 80;

    const COLORS = [
        '#6366f1','#a855f7','#ec4899','#f59e0b','#22d3ee',
        '#34d399','#ef4444','#f97316','#60a5fa','#84cc16'
    ];

    const balls = [];
    let hint = true, hintTimer = 4000;

    function addBall(x, y) {
        if (balls.length >= MAX_BALLS) balls.shift();
        const r = 10 + Math.random() * 18;
        balls.push({
            x, y, r,
            vx: (Math.random() - 0.5) * 4,
            vy: Math.random() * -3,
            color: COLORS[balls.length % COLORS.length],
            glow: Math.random() * 0.5 + 0.3
        });
    }

    // Seed a few initial balls
    for (let i = 0; i < 8; i++) {
        addBall(W * 0.15 + Math.random() * W * 0.7, H * 0.15 + Math.random() * H * 0.3);
    }

    // Ball-ball elastic collision response
    function resolveCollision(a, b) {
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = a.r + b.r;
        if (dist >= minDist || dist === 0) return;

        // Separate
        const overlap = (minDist - dist) / 2;
        const nx = dx / dist, ny = dy / dist;
        a.x -= nx * overlap; a.y -= ny * overlap;
        b.x += nx * overlap; b.y += ny * overlap;

        // Exchange velocity component along normal (equal mass)
        const dvx = a.vx - b.vx, dvy = a.vy - b.vy;
        const dot = dvx * nx + dvy * ny;
        if (dot > 0) return; // already separating
        a.vx -= dot * nx; a.vy -= dot * ny;
        b.vx += dot * nx; b.vy += dot * ny;
    }

    let lastTime = 0;

    function drawFrame(ts) {
        if (!running) return;
        const dt = Math.min(ts - lastTime, 50);
        lastTime = ts;

        // Background with slight trail
        ctx.fillStyle = '#05050f';
        ctx.fillRect(0, 0, W, H);

        // Ground line
        ctx.strokeStyle = 'rgba(99,102,241,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, H - 1); ctx.lineTo(W, H - 1);
        ctx.stroke();

        // Update physics
        for (const b of balls) {
            b.vy += GRAVITY;
            b.vx *= FRICTION;
            b.vy *= FRICTION;
            b.x += b.vx;
            b.y += b.vy;

            // Wall collisions
            if (b.x - b.r < 0)     { b.x = b.r;     b.vx =  Math.abs(b.vx) * DAMPING; }
            if (b.x + b.r > W)     { b.x = W - b.r;  b.vx = -Math.abs(b.vx) * DAMPING; }
            if (b.y + b.r > H)     { b.y = H - b.r;  b.vy = -Math.abs(b.vy) * DAMPING;
                                      b.vx *= 0.88; }
            if (b.y - b.r < 0)     { b.y = b.r;      b.vy =  Math.abs(b.vy) * DAMPING; }
        }

        // Ball-ball collisions (O(n²) ok for ≤80 balls)
        for (let i = 0; i < balls.length; i++) {
            for (let j = i + 1; j < balls.length; j++) {
                resolveCollision(balls[i], balls[j]);
            }
        }

        // Draw balls
        for (const b of balls) {
            const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
            const glowR = b.r * (1.6 + speed * 0.05);

            // Glow
            const glow = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, glowR);
            glow.addColorStop(0, b.color + 'aa');
            glow.addColorStop(1, b.color + '00');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(b.x, b.y, glowR, 0, Math.PI * 2);
            ctx.fill();

            // Ball body
            const grad = ctx.createRadialGradient(
                b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.1,
                b.x, b.y, b.r
            );
            grad.addColorStop(0, '#ffffff88');
            grad.addColorStop(0.3, b.color);
            grad.addColorStop(1, b.color + '99');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fill();

            // Shine
            ctx.fillStyle = 'rgba(255,255,255,0.25)';
            ctx.beginPath();
            ctx.arc(b.x - b.r * 0.28, b.y - b.r * 0.28, b.r * 0.28, 0, Math.PI * 2);
            ctx.fill();
        }

        // Ball count
        ctx.fillStyle = 'rgba(120,120,160,0.6)';
        ctx.font = '12px "Space Grotesk",sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`${balls.length} / ${MAX_BALLS} balls`, W - 12, H - 10);

        // Tap hint
        if (hint) {
            hintTimer -= dt;
            if (hintTimer <= 0) hint = false;
            ctx.fillStyle = `rgba(165,180,252,${Math.min(1, hintTimer / 500)})`;
            ctx.font = '16px "Space Grotesk",sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Tap anywhere to drop a ball!', W / 2, H / 2);
        }

        // HUD
        ctx.fillStyle = 'rgba(5,5,20,0.6)';
        ctx.fillRect(0, 0, W, 30);
        ctx.fillStyle = '#34d399';
        ctx.font = '13px "Space Grotesk",sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Physics Sandbox · Gravity + Elastic Collisions · Tap to add balls', 12, 20);

        requestAnimationFrame(drawFrame);
    }

    // Input handlers
    function canvasPos(e) {
        const r = canvas.getBoundingClientRect();
        return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height];
    }
    function clickHandler(e) { addBall(...canvasPos(e)); hint = false; }
    function touchHandler(e) {
        e.preventDefault();
        for (const t of e.changedTouches) {
            const r = canvas.getBoundingClientRect();
            addBall((t.clientX - r.left) * W / r.width, (t.clientY - r.top) * H / r.height);
        }
        hint = false;
    }
    canvas.addEventListener('click', clickHandler);
    canvas.addEventListener('touchstart', touchHandler, { passive: false });

    window.__currentDemoStop = function () {
        running = false;
        canvas.removeEventListener('click', clickHandler);
        canvas.removeEventListener('touchstart', touchHandler);
    };

    requestAnimationFrame(drawFrame);
}
window.startPhysicsSandbox = startPhysicsSandbox;
