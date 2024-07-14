function startTerrainGeneration(canvas, ctx, clearCanvasAndStop) {
    clearCanvasAndStop();

    const width = canvas.width;
    const height = canvas.height;
    const numPoints = 200;
    const terrainHeight = height / 2;

    function perlinNoise(x) {
        return (Math.sin(x) + 1) / 2;
    }

    function generateTerrain() {
        const points = [];
        for (let i = 0; i < numPoints; i++) {
            points.push({
                x: (i / (numPoints - 1)) * width,
                y: terrainHeight + (perlinNoise(i * 0.1) - 0.5) * 100
            });
        }
        return points;
    }

    function drawTerrain(points) {
        ctx.clearRect(0, 0, width, height);

        // 绘制背景渐变
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'skyblue');
        gradient.addColorStop(0.5, 'lightgreen');
        gradient.addColorStop(1, 'darkgreen');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // 绘制地形阴影
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 100, 0, 0.5)';
        ctx.fill();

        // 绘制地形
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = 'green';
        ctx.fill();
    }

    function animateTerrain() {
        const points = generateTerrain();
        drawTerrain(points);
        currentAnimation = setTimeout(animateTerrain, 1000);
    }

    animateTerrain();
}

window.startTerrainGeneration = startTerrainGeneration;