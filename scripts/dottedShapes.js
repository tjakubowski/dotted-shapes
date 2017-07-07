class TextEffect {

    constructor(id) {
        this.canvas = document.getElementById(id);
        this.context = this.canvas.getContext("2d");
        this.context.imageSmoothingEnabled = false;

        this.fps = 30;
        this.appInterval = setInterval(
            (function (that) {
                return function () {
                    that.update();
                }
            })(this),
            1000/this.fps
        );

        this.textChangeInterval = setInterval(
            (function (that) {
                return function () {
                    that.setNextText();
                }
            })(this),
            5000
        );

        this.particles = [];
        this.particlesPool = [];
        this.particlesPositions = [];

        this.currentText = 0;
        this.text = null;
        this.texts = ['DOTTED TEXT', 'TJAKUBOWSKI', 'JAVASCRIPT'];

        this.options = {
            particles: {
                style: {
                    size: 1,
                    color: {
                        r: 255,
                        g: 255,
                        b: 255,
                        a: 0.75
                    },
                    strokeSize: 2,
                    strokeColor: 'white'
                },
                spawn: {
                    borderSpawn: false,
                    borderOffset: 50,
                    offset: 6
                },
                params: {
                    targetRadius: 10,
                    speed: 10
                }
            },
            text: {
                size: 180,
                font: 'Impact'
            }
        };

        this.fit();
        this.setNextText();
    }

    setNextText() {
        this.setText(this.texts[this.currentText]);
        (this.currentText < this.texts.length - 1) ? this.currentText++ : this.currentText = 0;
    }

    fit() {
        this.canvas.width = this.canvas.parentNode.offsetWidth;
        this.canvas.height = this.canvas.parentNode.offsetHeight;
    }

    setText(text) {
        this.text = text;
        this.setTextPositions();
        this.randomizeParticles();
        this.updateParticlesQuantity();
        this.randomizeParticles();
        this.delegateParticles();
    }

    setTextPositions() {
        this.particlesPositions = [];

        let options = this.options;

        let text = this.text;

        let tCanvas = document.createElement('canvas');
        let tCtx = tCanvas.getContext('2d');

        tCanvas.width = this.canvas.width;
        tCanvas.height = this.canvas.height;

        tCtx.textBaseline = 'middle';

        let fontSize = options.text.size;
        tCtx.font = `bolder ${fontSize}px ${options.text.font}`;
        let textWidth = tCtx.measureText(text).width;

        while(textWidth > tCanvas.width * 3/4) {
            fontSize--;
            tCtx.font = `bolder ${fontSize}px ${options.text.font}`;
            textWidth = tCtx.measureText(text).width;
        }

        tCtx.fillText(text, tCanvas.width / 2 - textWidth / 2, tCanvas.height / 2);

        let imageData = tCtx.getImageData(
            tCanvas.width / 2 - textWidth / 2,
            0,
            textWidth,
            tCanvas.height
        );
        let data = imageData.data;

        for (var x = 0; x < imageData.width; x += options.particles.spawn.offset) {
            for (var y = 0; y < imageData.height; y += options.particles.spawn.offset) {
                let i = (y * imageData.width + x) * 4;
                if (data[i + 3] > 128) {
                    this.particlesPositions.push(new Vector2(x + tCanvas.width / 2 - textWidth / 2, y));
                }
            }
        }

    }

    updateParticlesQuantity() {
        while (this.particles.length > this.particlesPositions.length) {
            this.removeParticle(this.particles.pop());
        }

        while (this.particles.length < this.particlesPositions.length) {
            this.spawnParticle();
        }
    }

    spawnParticle() {
        if (this.options.particles.spawn.borderSpawn) {
            let x, y;
            let random = Math.floor((Math.random() * 10) + 1);
            let particles = this.options.particles.spawn;

            x = Math.randomInt(0 - particles.borderOffset, this.canvas.width + particles.borderOffset);

            if (x > 0 && x < this.canvas.width)
                y = (random % 2) ? Math.randomInt(0 - particles.borderOffset, 0) : Math.randomInt(this.canvas.height, this.canvas.height + particles.borderOffset);
            else
                y = Math.randomInt(0 - particles.borderOffset, this.canvas.height + particles.borderOffset);

            if(this.particlesPool.length > 0) {
                let particle = this.particlesPool.pop();
                particle.revive(new Vector2(x, y));
                this.particles.push(particle);
            } else {
                this.particles.push(
                    new Particle(
                        x,
                        y,
                        this
                    )
                );
            }

        }
        else {
            if(this.particlesPool.length > 0) {
                let particle = this.particlesPool.pop();
                particle.revive(new Vector2(Math.randomInt(0, this.canvas.width), Math.randomInt(0, this.canvas.height)));
                this.particles.push(particle);
            } else {
                this.particles.push(
                    new Particle(
                        Math.randomInt(0, this.canvas.width),
                        Math.randomInt(0, this.canvas.height),
                        this
                    )
                );
            }
        }
    }

    removeParticle(particle) {
        particle.die();
        this.particlesPool.push(particle);
    }

    randomizeParticles() {
        let currentIndex = this.particles.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = this.particles[currentIndex];
            this.particles[currentIndex] = this.particles[randomIndex];
            this.particles[randomIndex] = temporaryValue;
        }

    }

    delegateParticles() {
        for (var i = 0; i < this.particles.length; i++) {
            this.particles[i].setTarget(this.particlesPositions[i]);
        }
    }

    clear() {
        this.canvas.width = this.canvas.width;
    }

    update() {
        this.clear();

        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].update();
        }

        for (let j = 0; j < this.particlesPool.length; j++) {
            this.particlesPool[j].update();
        }
    }

}

class Particle {

    constructor(x, y, app) {
        this.app = app;

        this.startPosition = new Vector2(x, y);
        this.position = new Vector2(x, y);

        this.startDistance = 0;
        this.currentDistance = 0;

        this.fadeInStep = 0.05;
        this.fadeOutStep = 0.05;
        this.fade = 0;

        this.dead = false;

        this.target = null;

        this.fadeIn();
    }

    fadeIn() {
        setTimeout(
            (function (that) {
                return function () {
                    that.fade += that.fadeInStep;
                    if(that.fade < 1) {
                        that.fadeIn();
                    }
                }
            })(this),
            1000/this.app.fps
        );
    }

    fadeOut() {
        setTimeout(
            (function (that) {
                return function () {
                    that.fade -= that.fadeOutStep;
                    if(that.fade > 0) {
                        that.fadeOut();
                    }
                }
            })(this),
            1000/this.app.fps
        );
    }

    setTarget(target) {
        this.target = target;
        this.startPosition = new Vector2(this.position.x, this.position.y);
        this.startDistance = Vector2.Distance(this.startPosition, this.target);
    }

    die() {
        this.dead = true;
        this.fadeOut();

        let x = Math.randomInt(0, this.app.canvas.width);
        let y = Math.randomInt(0, this.app.canvas.height);
        this.setTarget(new Vector2(x, y));
    }

    revive(position) {
        this.dead = false;
        this.position = position;
        this.fadeIn();
    }

    move() {
        let params = this.app.options.particles.params;
        let that = this;

        if (this.target === null) return;

        this.currentDistance = Vector2.Distance(this.position, this.target);

        if(this.currentDistance < params.targetRadius) {
            this.position = new Vector2(this.target.x, this.target.y);
            return;
        }

        let smoothness = Math.max( params.targetRadius / params.speed, (Math.cos(Math.PI * (this.startDistance-this.currentDistance)/this.startDistance) + 1)/2);

        this.position.Add(
            Vector2.VectorTo(this.position, this.target).Normalize().Multiply(smoothness * params.speed)
        );
    }

    draw() {
        let style = this.app.options.particles.style;
        let ctx = this.app.context;

        ctx.beginPath();
        ctx.fillStyle = `rgba(${style.color.r}, ${style.color.g}, ${style.color.b}, ${style.color.a * this.fade})`;
        ctx.fillRect(this.position.x, this.position.y, style.size, style.size);
    }

    update() {
        if(this.dead && this.fade <= 0) return;

        this.move();
        this.draw();
    }

}