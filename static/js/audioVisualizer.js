function startAudioVisualizer(canvas, ctx, clearCanvasAndStop) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    let animationFrameId = null;
		clearCanvasAndStop();
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
            analyser.fftSize = 256;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            function draw() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                analyser.getByteFrequencyData(dataArray);
                const barWidth = (canvas.width / bufferLength) * 2.5;
                let barHeight;
                let x = 0;

                for (let i = 0; i < bufferLength; i++) {
                    barHeight = dataArray[i] * 1.8; // 放大 80%

                    ctx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
                    ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);

                    x += barWidth + 1;
                }

                animationFrameId = requestAnimationFrame(draw);
            }
						
						clearCanvasAndStop();
            draw();
        })
        .catch(err => {
            console.log('The following error occurred: ' + err);
        });
}

window.startAudioVisualizer = startAudioVisualizer;