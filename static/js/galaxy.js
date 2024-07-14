function startGalaxy(canvas, ctx, clearCanvasAndStop) {
    const stars = [];

    for (let i = 0; i < 1000; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1, // 确保星星可见
            speed: Math.random() * 0.5 + 0.5 // 调整速度以确保动画流畅
        });
    }

    function drawGalaxy() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 设置背景色为黑色
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 设置星星的颜色为白色
        ctx.fillStyle = 'white';

        stars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
            star.x += star.speed;
            star.y += star.speed;

            // 让星星在画布内循环
            if (star.x > canvas.width) star.x = 0;
            if (star.y > canvas.height) star.y = 0;
        });

        animationFrameId = requestAnimationFrame(drawGalaxy);
    }

    clearCanvasAndStop();
    drawGalaxy();
}

window.startGalaxy = startGalaxy;