function startAquarium(canvas, ctx, clearCanvasAndStop) {
    const fish = [];
    const numFish = 10;

    for (let i = 0; i < numFish; i++) {
        fish.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            dx: Math.random() * 4 - 2,
            dy: Math.random() * 4 - 2,
            size: Math.random() * 20 + 10,
            color: '#' + Math.floor(Math.random() * 16777215).toString(16)
        });
    }

    function drawFish() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0, 105, 148, 0.8)'; // 水族馆背景颜色
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        fish.forEach(f => {
            // 绘制鱼的身体（椭圆形）
            ctx.beginPath();
            ctx.ellipse(f.x, f.y, f.size, f.size / 2, 0, 0, Math.PI * 2);
            ctx.fillStyle = f.color;
            ctx.fill();

            // 绘制鱼的尾巴（三角形）
            ctx.beginPath();
            ctx.moveTo(f.x - f.size, f.y);
            ctx.lineTo(f.x - f.size - 10, f.y - 10);
            ctx.lineTo(f.x - f.size - 10, f.y + 10);
            ctx.closePath();
            ctx.fillStyle = f.color;
            ctx.fill();

            f.x += f.dx;
            f.y += f.dy;

            if (f.x + f.size > canvas.width || f.x - f.size < 0) {
                f.dx *= -1;
            }

            if (f.y + f.size / 2 > canvas.height || f.y - f.size / 2 < 0) {
                f.dy *= -1;
            }
        });

        animationFrameId = requestAnimationFrame(drawFish);
    }

    clearCanvasAndStop();
    drawFish();
}

window.startAquarium = startAquarium;