document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');

    // Each demo registers window.__currentDemoStop = function(){ ... }
    // to clean up its own animation loops and event listeners.
    function clearCurrentAnimation() {
        if (typeof window.__currentDemoStop === 'function') {
            window.__currentDemoStop();
            window.__currentDemoStop = null;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        document.querySelectorAll('.control-container, .demo-control').forEach(el => el.remove());
    }

    function addEventListenerToButton(id, functionName) {
        document.getElementById(id).addEventListener('click', function () {
            clearCurrentAnimation();
            if (typeof window[functionName] === 'function') {
                window[functionName](canvas, ctx);
            }
        });
    }

    addEventListenerToButton('showInteractiveFractals',       'startFractal');
    addEventListenerToButton('showGalaxySimulation',          'startGalaxy');
    addEventListenerToButton('showAudioVisualizer',           'startAudioVisualizer');
    addEventListenerToButton('showGenerativeArt',             'startGenerativeArt');
    addEventListenerToButton('showInteractiveNeuralNetwork',  'startNeuralNetwork');
    addEventListenerToButton('showWeatherEffects',            'startWeatherEffects');
    addEventListenerToButton('showInteractivePhysicsSandbox', 'startPhysicsSandbox');
    addEventListenerToButton('showTerrainGeneration',         'startTerrainGeneration');
    addEventListenerToButton('showVirtualAquarium',           'startAquarium');
    addEventListenerToButton('showInteractiveStorybook',      'startStorybook');
});
