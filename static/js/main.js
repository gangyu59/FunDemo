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
        ctx.clearRect(0, 0, canvas.width, canvas.height);  // 清理画布

        // 清除输入框和标签
        const containers = document.querySelectorAll('.control-container');
        containers.forEach(container => container.remove());

        // 清除故事书按钮
        const buttons = document.querySelectorAll('.storybook-button');
        buttons.forEach(button => button.remove());
    }

    function addEventListenerToButton(id, functionName) {
        document.getElementById(id).addEventListener('click', function () {
            clearCurrentAnimation();
            if (typeof window[functionName] === 'function') {
                window[functionName](canvas, ctx, clearCurrentAnimation);
            }
        });
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