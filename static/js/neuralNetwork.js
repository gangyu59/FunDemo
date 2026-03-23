// Neural Network — animated 4-layer feedforward network with glowing signal pulses.
// Simulates XOR-like training: watch activations propagate and update.
function startNeuralNetwork(canvas, ctx) {
    let running = true;
    const W = canvas.width, H = canvas.height;

    // ---- Network architecture ----
    const LAYERS = [3, 5, 4, 2];  // nodes per layer
    const NODE_R = Math.min(W, H) * 0.038;
    const layerX = LAYERS.map((_, i) => W * 0.1 + i * (W * 0.8 / (LAYERS.length - 1)));

    // Build nodes
    const nodes = LAYERS.map((count, li) => {
        const xs = layerX[li];
        const gap = H / (count + 1);
        return Array.from({ length: count }, (_, ni) => ({
            x: xs, y: gap * (ni + 1),
            activation: Math.random(),
            label: li === 0 ? ['x₁','x₂','x₃'][ni]
                 : li === LAYERS.length - 1 ? ['ŷ₁','ŷ₂'][ni] : ''
        }));
    });

    // Build connections with random weights
    const connections = [];
    for (let li = 0; li < LAYERS.length - 1; li++) {
        for (const src of nodes[li]) {
            for (const dst of nodes[li + 1]) {
                connections.push({
                    src, dst,
                    weight: Math.random() * 2 - 1,
                    pulses: []          // active pulses travelling src→dst
                });
            }
        }
    }

    // ---- Activation (sigmoid) ----
    const sigmoid = x => 1 / (1 + Math.exp(-x));

    // Forward pass: update activations and launch pulses
    function forwardPass() {
        // Set random inputs
        for (const n of nodes[0]) n.activation = Math.random();

        for (let li = 1; li < LAYERS.length; li++) {
            for (const dst of nodes[li]) {
                let sum = 0;
                for (const c of connections) {
                    if (c.dst === dst) sum += c.src.activation * c.weight;
                }
                dst.activation = sigmoid(sum);
            }
        }

        // Launch new pulses on all connections
        for (const c of connections) {
            if (Math.random() < 0.7) {   // not every connection fires each pass
                c.pulses.push({ t: 0 });
            }
        }

        // Slightly nudge weights (simulate learning)
        for (const c of connections) {
            c.weight += (Math.random() - 0.5) * 0.05;
            c.weight = Math.max(-1, Math.min(1, c.weight));
        }
    }

    let passTimer = 0, lastTime = 0;

    function drawFrame(ts) {
        if (!running) return;
        const dt = Math.min(ts - lastTime, 50);
        lastTime = ts;

        // Background
        ctx.fillStyle = '#05050f';
        ctx.fillRect(0, 0, W, H);

        // Layer labels
        const lbls = ['Input', 'Hidden 1', 'Hidden 2', 'Output'];
        for (let li = 0; li < LAYERS.length; li++) {
            ctx.fillStyle = '#505070';
            ctx.font = '11px "Space Grotesk",sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(lbls[li], layerX[li], 22);
        }

        // Draw connections + pulses
        for (const c of connections) {
            const wAbs = Math.abs(c.weight);
            // Connection line
            ctx.globalAlpha = wAbs * 0.25 + 0.05;
            ctx.strokeStyle = c.weight > 0 ? '#6366f1' : '#ef4444';
            ctx.lineWidth = wAbs * 2.5 + 0.5;
            ctx.beginPath();
            ctx.moveTo(c.src.x, c.src.y);
            ctx.lineTo(c.dst.x, c.dst.y);
            ctx.stroke();
            ctx.globalAlpha = 1;

            // Animate pulses
            c.pulses = c.pulses.filter(p => p.t <= 1);
            for (const p of c.pulses) {
                p.t += dt * 0.0018;
                const px = c.src.x + (c.dst.x - c.src.x) * p.t;
                const py = c.src.y + (c.dst.y - c.src.y) * p.t;
                // Glow
                const glow = ctx.createRadialGradient(px, py, 0, px, py, 8);
                glow.addColorStop(0, 'rgba(250,230,80,0.9)');
                glow.addColorStop(0.4, 'rgba(250,150,30,0.5)');
                glow.addColorStop(1, 'transparent');
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(px, py, 8, 0, Math.PI * 2);
                ctx.fill();
                // Core
                ctx.fillStyle = '#fffde7';
                ctx.beginPath();
                ctx.arc(px, py, 2.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Draw nodes
        for (const layer of nodes) {
            for (const n of layer) {
                const act = n.activation;
                // Glow based on activation
                const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, NODE_R * 2.2);
                glow.addColorStop(0, `rgba(99,102,241,${(act * 0.6).toFixed(2)})`);
                glow.addColorStop(1, 'transparent');
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(n.x, n.y, NODE_R * 2.2, 0, Math.PI * 2);
                ctx.fill();

                // Border
                ctx.strokeStyle = `hsl(${240 + act * 60},80%,65%)`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(n.x, n.y, NODE_R, 0, Math.PI * 2);
                ctx.stroke();

                // Fill based on activation
                const brightness = act * 200 | 0;
                ctx.fillStyle = `rgb(${brightness * 0.4 | 0},${brightness * 0.5 | 0},${brightness | 0})`;
                ctx.beginPath();
                ctx.arc(n.x, n.y, NODE_R - 2, 0, Math.PI * 2);
                ctx.fill();

                // Activation value
                ctx.fillStyle = '#e8e8f0';
                ctx.font = `bold ${NODE_R * 0.65 | 0}px "Space Grotesk",sans-serif`;
                ctx.textAlign = 'center';
                ctx.fillText(act.toFixed(2), n.x, n.y + NODE_R * 0.22);

                // External label (input/output nodes)
                if (n.label) {
                    ctx.fillStyle = '#7878a0';
                    ctx.font = `${NODE_R * 0.7 | 0}px "Space Grotesk",sans-serif`;
                    ctx.fillText(n.label, n.x, n.y - NODE_R * 1.45);
                }
            }
        }

        // Trigger new forward pass every ~1.6 s
        passTimer += dt;
        if (passTimer > 1600) { passTimer = 0; forwardPass(); }

        // HUD
        ctx.fillStyle = 'rgba(5,5,20,0.6)';
        ctx.fillRect(0, 0, W, 30);
        ctx.fillStyle = '#a78bfa';
        ctx.font = '13px "Space Grotesk",sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Neural Network 3→5→4→2 · Watch signal pulses propagate!', 12, 20);

        requestAnimationFrame(drawFrame);
    }

    window.__currentDemoStop = function () { running = false; };
    forwardPass();
    requestAnimationFrame(drawFrame);
}
window.startNeuralNetwork = startNeuralNetwork;
