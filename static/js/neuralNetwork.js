function startNeuralNetwork(canvas, ctx, clearCanvasAndStop) {
    clearCanvasAndStop();

    const nodes = 5;
    const layers = 3;
    const nodeRadius = 20; // 增大节点半径
    const layerSpacing = canvas.width / (layers + 1);
    const nodeSpacing = canvas.height / (nodes + 1);
    const network = [];

    // 创建节点并放置
    for (let i = 0; i < layers; i++) {
        const layer = [];
        for (let j = 0; j < nodes; j++) {
            const node = {
                x: layerSpacing * (i + 1),
                y: nodeSpacing * (j + 1),
                radius: nodeRadius,
                dragging: false
            };
            layer.push(node);
        }
        network.push(layer);
    }

    function drawNetwork() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制连接线
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
        network.forEach((layer, i) => {
            if (i < layers - 1) {
                const nextLayer = network[i + 1];
                layer.forEach(node => {
                    nextLayer.forEach(nextNode => {
                        ctx.beginPath();
                        ctx.moveTo(node.x, node.y);
                        ctx.lineTo(nextNode.x, nextNode.y);
                        ctx.stroke();
                    });
                });
            }
        });

        // 绘制节点
        ctx.fillStyle = 'black';
        network.forEach(layer => {
            layer.forEach(node => {
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
                ctx.fill();
            });
        });

        animationFrameId = requestAnimationFrame(drawNetwork);
    }

    let dragNode = null;

    canvas.addEventListener('touchstart', (event) => {
        event.preventDefault();
        const touch = event.touches[0];
        const { clientX, clientY } = touch;
        const rect = canvas.getBoundingClientRect();
        const offsetX = clientX - rect.left;
        const offsetY = clientY - rect.top;
        network.forEach(layer => {
            layer.forEach(node => {
                const dx = node.x - offsetX;
                const dy = node.y - offsetY;
                if (Math.sqrt(dx * dx + dy * dy) < node.radius) {
                    dragNode = node;
                    node.dragging = true;
                }
            });
        });
    });

    canvas.addEventListener('touchmove', (event) => {
        event.preventDefault();
        if (dragNode) {
            const touch = event.touches[0];
            const { clientX, clientY } = touch;
            const rect = canvas.getBoundingClientRect();
            const offsetX = clientX - rect.left;
            const offsetY = clientY - rect.top;
            dragNode.x = offsetX;
            dragNode.y = offsetY;
        }
    });

    canvas.addEventListener('touchend', () => {
        if (dragNode) {
            dragNode.dragging = false;
            dragNode = null;
        }
    });

    canvas.addEventListener('touchcancel', () => {
        if (dragNode) {
            dragNode.dragging = false;
            dragNode = null;
        }
    });

    drawNetwork();
}

window.startNeuralNetwork = startNeuralNetwork;