// Audio Visualizer — circular spectrum analyser using microphone.
// Falls back to an animated demo if mic permission is denied.
function startAudioVisualizer(canvas, ctx) {
    let running = true;
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const BASE_R = Math.min(W, H) * 0.18;
    const MAX_BAR = Math.min(W, H) * 0.28;

    let audioCtx = null, analyser = null, dataArray = null;
    let micError = false, demoT = 0;

    window.__currentDemoStop = function () {
        running = false;
        if (audioCtx) { audioCtx.close().catch(() => {}); audioCtx = null; }
    };

    // ---- attempt mic access ----
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then(stream => {
            if (!running) { stream.getTracks().forEach(t => t.stop()); return; }
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.8;
            const src = audioCtx.createMediaStreamSource(stream);
            src.connect(analyser);
            dataArray = new Uint8Array(analyser.frequencyBinCount);
        })
        .catch(() => { micError = true; });

    // ---- draw helpers ----
    function hue(i, total) { return (i / total) * 300; }

    function drawCircularBars(freqData, total) {
        const step = (Math.PI * 2) / total;
        for (let i = 0; i < total; i++) {
            const value = freqData[i] / 255;
            const barLen = value * MAX_BAR + 2;
            const angle = i * step - Math.PI / 2;
            const x1 = cx + Math.cos(angle) * BASE_R;
            const y1 = cy + Math.sin(angle) * BASE_R;
            const x2 = cx + Math.cos(angle) * (BASE_R + barLen);
            const y2 = cy + Math.sin(angle) * (BASE_R + barLen);

            const h = hue(i, total);
            ctx.strokeStyle = `hsla(${h},100%,${50 + value * 35}%,${0.5 + value * 0.5})`;
            ctx.lineWidth = Math.max(1.5, (Math.PI * 2 * (BASE_R - 2)) / total - 1);
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    }

    function drawWaveform(waveData) {
        const N = waveData.length;
        const wR = BASE_R - 12;
        ctx.beginPath();
        for (let i = 0; i < N; i++) {
            const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
            const v = (waveData[i] / 128 - 1) * 14;
            const r = wR + v;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(200,230,255,0.7)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    function drawDemoMode() {
        demoT += 0.04;
        const N = 64;
        const fakeFreq = new Uint8Array(N);
        const fakeWave = new Uint8Array(128);
        for (let i = 0; i < N; i++) {
            fakeFreq[i] = (Math.sin(demoT * 2.1 + i * 0.3) * 0.5 + 0.5) *
                          (Math.sin(demoT * 0.7 + i * 0.15) * 0.5 + 0.5) * 220 + 20;
        }
        for (let i = 0; i < 128; i++) {
            fakeWave[i] = 128 + Math.sin(demoT * 3 + i * 0.18) * 50
                              + Math.sin(demoT * 1.3 + i * 0.07) * 25;
        }
        drawCircularBars(fakeFreq, N);
        drawWaveform(fakeWave);
    }

    function drawFrame() {
        if (!running) return;

        // Background with trail fade
        ctx.fillStyle = 'rgba(5,5,20,0.35)';
        ctx.fillRect(0, 0, W, H);

        // Inner glow
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, BASE_R);
        glow.addColorStop(0, 'rgba(99,102,241,0.15)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, BASE_R, 0, Math.PI * 2);
        ctx.fill();

        // Base ring
        ctx.strokeStyle = 'rgba(99,102,241,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, BASE_R, 0, Math.PI * 2);
        ctx.stroke();

        if (analyser && dataArray) {
            // Live mic
            analyser.getByteFrequencyData(dataArray);
            const waveData = new Uint8Array(analyser.fftSize);
            analyser.getByteTimeDomainData(waveData);
            drawCircularBars(dataArray, dataArray.length);
            drawWaveform(waveData);

            // Centre label
            ctx.fillStyle = '#e8e8f0';
            ctx.font = 'bold 16px "Space Grotesk",sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('LIVE', cx, cy + 6);
        } else if (micError) {
            drawDemoMode();
            ctx.fillStyle = '#94a3b8';
            ctx.font = '13px "Space Grotesk",sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Demo Mode', cx, cy - 5);
            ctx.font = '11px "Space Grotesk",sans-serif';
            ctx.fillStyle = '#64748b';
            ctx.fillText('(allow mic for live audio)', cx, cy + 12);
        } else {
            drawDemoMode();
            ctx.fillStyle = '#94a3b8';
            ctx.font = '12px "Space Grotesk",sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Awaiting mic\u2026', cx, cy + 5);
        }

        // HUD
        ctx.fillStyle = 'rgba(5,5,20,0.6)';
        ctx.fillRect(0, 0, W, 30);
        ctx.fillStyle = '#f0abfc';
        ctx.font = '13px "Space Grotesk",sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Audio Visualizer · Circular Spectrum · Allow mic for live mode', 12, 20);

        requestAnimationFrame(drawFrame);
    }

    // Dark start
    ctx.fillStyle = '#05050f';
    ctx.fillRect(0, 0, W, H);
    requestAnimationFrame(drawFrame);
}
window.startAudioVisualizer = startAudioVisualizer;
