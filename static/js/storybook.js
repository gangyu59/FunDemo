function startStorybook(canvas, ctx, clearCanvasAndStop) {
    clearCanvasAndStop();

    const pages = [
        {
            text: "Once upon a time in a land far, far away...",
            image: "image/image1.heic" // 更新为实际图片路径
        },
        {
            text: "There was a brave knight who fought dragons...",
            image: "image/image2.heic" // 更新为实际图片路径
        },
        {
            text: "And rescued the princess from the highest tower...",
            image: "image/image3.heic" // 更新为实际图片路径
        },
        {
            text: "They lived happily ever after. The end.",
            image: "image/image4.heic" // 更新为实际图片路径
        }
    ];

    let currentPage = 0;
    let animationFrameId = null;
    let intervalId = null;

    function drawPage() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制文本
        ctx.fillStyle = 'black';
        ctx.font = '24px Arial';
        ctx.fillText(pages[currentPage].text, 50, 50);

        // 绘制图片
        const img = new Image();
        img.onload = function() {
            ctx.drawImage(img, 50, 100, canvas.width - 100, canvas.height - 200);
        };
        img.src = pages[currentPage].image;
    }

    function nextPage() {
        currentPage = (currentPage + 1) % pages.length;
        drawPage();
    }

    function animateStorybook() {
        intervalId = setTimeout(() => {
            nextPage();
            animationFrameId = requestAnimationFrame(animateStorybook);
        }, 5000);
    }

    drawPage();
    animateStorybook();
}

window.startStorybook = startStorybook;