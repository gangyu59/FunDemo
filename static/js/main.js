document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    let currentAnimation = null;
    let animationFrameId = null;
    let intervalId = null;

    function clearCurrentAnimation() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        if (currentAnimation) {
            clearInterval(currentAnimation);
            currentAnimation = null;
        }
        if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
        }
        ctx.setTransform(1, 0, 0, 1, 0, 0);  // 重置变换矩阵
        ctx.clearRect(0, 0, canvas.width, canvas.height);  // 清理画布
    }

    function addEventListenerToButton(id, functionName) {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', function () {
                clearCurrentAnimation();
                if (typeof window[functionName] === 'function') {
                    window[functionName](canvas, ctx, clearCurrentAnimation);
                }
            });
        } else {
            console.warn(`Button with ID ${id} not found.`);
        }
    }

    // 绑定按钮和对应的函数
    addEventListenerToButton('showInteractiveFractals', 'startFractal');
    addEventListenerToButton('showGalaxySimulation', 'startGalaxy');
    addEventListenerToButton('showAudioVisualizer', 'startAudioVisualizer');
    addEventListenerToButton('showGenerativeArt', 'startGenerativeArt');
    addEventListenerToButton('showInteractiveNeuralNetwork', 'startNeuralNetwork');
    addEventListenerToButton('showWeatherEffects', 'startWeatherEffects');
    addEventListenerToButton('showInteractivePhysicsSandbox', 'startPhysicsSandbox');
    addEventListenerToButton('showTerrainGeneration', 'startTerrainGeneration');
    addEventListenerToButton('showVirtualAquarium', 'startAquarium');
    addEventListenerToButton('showInteractiveStorybook', 'startStorybook');
});