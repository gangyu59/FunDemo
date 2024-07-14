function startPhysicsSandbox(canvas, ctx, clearCanvasAndStop) {
    const balls = [];

    for (let i = 0; i < 20; i++) {
        balls.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 20 + 10,
            dx: Math.random() * 4 - 2,
            dy: Math.random() * 4 - 2,
            color: '#' + Math.floor(Math.random() * 16777215).toString(16)
        });
    }

    function drawBalls() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        balls.forEach(ball => {
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = ball.color;
            ctx.fill();

            ball.x += ball.dx;
            ball.y += ball.dy;

            if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
                ball.dx *= -1;
            }

            if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
                ball.dy *= -1;
            }
        });

        animationFrameId = requestAnimationFrame(drawBalls);
    }

    clearCanvasAndStop();
    drawBalls();
}

window.startPhysicsSandbox = startPhysicsSandbox;