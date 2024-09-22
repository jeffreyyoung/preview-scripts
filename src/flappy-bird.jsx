import Phaser from 'phaser';

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'root',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

let bird;
let pipes;
let score = 0;
let scoreText;

function preload() {
  this.load.image('bird', 'assets/bird.png');
  this.load.image('pipe', 'assets/pipe.png');
}

function create() {
  bird = this.physics.add.sprite(100, config.height / 2, 'bird');
  bird.setCollideWorldBounds(true);

  pipes = this.physics.add.group();

  scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });

  this.input.on('pointerdown', flap);
  this.time.addEvent({ delay: 1500, callback: addPipe, callbackScope: this, loop: true });

  this.physics.add.collider(bird, pipes, gameOver, null, this);
}

function update() {
  if (bird.y > config.height || bird.y < 0) {
    gameOver.call(this);
  }
}

function flap() {
  bird.setVelocityY(-150);
}

function addPipe() {
  const gap = Math.floor(Math.random() * 250) + 100;
  const pipeTop = pipes.create(config.width, gap, 'pipe');
  const pipeBottom = pipes.create(config.width, config.height - gap, 'pipe');

  pipeTop.setOrigin(0.5, 1);
  pipeBottom.setOrigin(0.5, 0);

  pipeTop.body.velocity.x = -200;
  pipeBottom.body.velocity.x = -200;

  pipeTop.body.allowGravity = false;
  pipeBottom.body.allowGravity = false;

  score += 1;
  scoreText.setText('Score: ' + score);
}

function gameOver() {
  this.physics.pause();
  bird.setTint(0xff0000);
  this.add.text(config.width / 2, config.height / 2, 'Game Over', { fontSize: '64px', fill: '#000' }).setOrigin(0.5);
}

