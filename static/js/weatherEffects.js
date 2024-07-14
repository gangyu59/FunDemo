function startWeatherEffects(canvas, ctx, clearCanvasAndStop) {
    clearCanvasAndStop();

    const weatherTypes = ['rain', 'lightning', 'snow'];
    let currentWeather = 'rain';
    let particles = [];
    let lightningTimer = 0;
    let lightningDuration = 0;
    let lightningFlash = false;

    function createRain() {
        particles = [];
        for (let i = 0; i < 100; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                speed: Math.random() * 5 + 4, // 增加雨点速度
                length: Math.random() * 20 + 10
            });
        }
    }

    function createSnow() {
        particles = [];
        for (let i = 0; i < 100; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                speed: Math.random() * 1 + 0.3, // 减慢雪花速度
                radius: Math.random() * 4 + 2 // 增大雪花半径
            });
        }
    }

    function drawRain() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0, 0, 139, 0.8)'; // 暗蓝色背景
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = 'rgba(174,194,224,0.5)';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        particles.forEach(particle => {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(particle.x, particle.y + particle.length);
            ctx.stroke();

            particle.y += particle.speed;
            if (particle.y > canvas.height) {
                particle.y = 0 - particle.length;
                particle.x = Math.random() * canvas.width;
            }
        });
    }

    function drawSnow() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0, 0, 139, 0.8)'; // 暗蓝色背景
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

        particles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fill();

            particle.y += particle.speed;
            if (particle.y > canvas.height) {
                particle.y = 0 - particle.radius;
                particle.x = Math.random() * canvas.width;
            }
        });
    }

    function drawLightning() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0, 0, 139, 0.8)'; // 暗蓝色背景
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (lightningFlash) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            lightningFlash = false;
        }
    }

    function updateWeather() {
        if (currentWeather === 'rain') {
            drawRain();
        } else if (currentWeather === 'snow') {
            drawSnow();
        } else if (currentWeather === 'lightning') {
            drawLightning();
            lightningTimer--;
            if (lightningTimer <= 0) {
                currentWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
            }
        }

        animationFrameId = requestAnimationFrame(updateWeather);
    }

    function changeWeather() {
        currentWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
        if (currentWeather === 'rain') {
            createRain();
        } else if (currentWeather === 'snow') {
            createSnow();
        } else if (currentWeather === 'lightning') {
            lightningTimer = Math.random() * 30 + 10;
            lightningFlash = true;
        }
    }

    // 初始状态为下雨
    createRain();
    updateWeather();

    // 每5秒切换一次天气
    setInterval(changeWeather, 5000);
}

window.startWeatherEffects = startWeatherEffects;