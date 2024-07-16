function startGenerativeArt(canvas, ctx, clearCanvasAndStop) {
    clearCanvasAndStop();

    const axioms = ['F', 'X'];
    const rulesList = [
        { 'F': 'FF+[+F-F-F]-[-F+F+F]', 'X': 'F[+X]F[-X]+X' },
        { 'F': 'F[+F]F[-F]F', 'X': 'F[+X][-X]FX' },
        { 'F': 'F[+F]F[-F][F]', 'X': 'F[-X][+X]FX' },
    ];

    const iterationsList = [3, 4, 5];
    const angleList = [20, 25, 30, 35];

    const axiom = axioms[Math.floor(Math.random() * axioms.length)];
    const rules = rulesList[Math.floor(Math.random() * rulesList.length)];
    const iterations = iterationsList[Math.floor(Math.random() * iterationsList.length)];
    const angle = angleList[Math.floor(Math.random() * angleList.length)];
    const length = Math.random() * 50 + 50;

    let sentence = axiom;
    for (let i = 0; i < iterations; i++) {
        sentence = generate(sentence, rules);
    }

    function generate(sentence, rules) {
        let nextSentence = '';
        for (let i = 0; i < sentence.length; i++) {
            const current = sentence[i];
            nextSentence += rules[current] || current;
        }
        return nextSentence;
    }

    function drawLSystem(sentence, length, angle) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'green';
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height);
        ctx.lineWidth = 2;

        for (let i = 0; i < sentence.length; i++) {
            const current = sentence[i];
            if (current === 'F' || current === 'X') {
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, -length);
                ctx.stroke();
                ctx.translate(0, -length);
            } else if (current === '+') {
                ctx.rotate(angle * Math.PI / 180);
            } else if (current === '-') {
                ctx.rotate(-angle * Math.PI / 180);
            } else if (current === '[') {
                ctx.save();
            } else if (current === ']') {
                ctx.restore();
            }
        }
        ctx.restore();
    }

    animationFrameId = requestAnimationFrame(function draw() {
        drawLSystem(sentence, length, angle);
        animationFrameId = requestAnimationFrame(draw);
    });
}

window.startGenerativeArt = startGenerativeArt;