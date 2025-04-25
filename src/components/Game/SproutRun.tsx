
import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";

// Importamos los assets
import runSprite from "./assets/characters/Frog/Run (32x32).png";
import fallSprite from "./assets/characters/Frog/Fall (32x32).png";
import jumpSprite from "./assets/characters/Frog/Jump (32x32).png";
import idleSprite from "./assets/characters/Frog/Idle (32x32).png";
import doubleJumpSprite from "./assets/characters/Frog/Double Jump (32x32).png";
import terrainSprite from "./assets/terrain/Terrain (16x16).png";
import coinSprite from "./assets/terrain/Coin.png";
import CollectedCoin from "./assets/terrain/Collected.png"
import background from "./assets/backgounds/Background.jpg";
import music from "./assets/terrain/Music.wav"
import mapJSON from "./assets/maps/sprout-map.json";

// Mini componente para mostrar HUD
function GameHUD({ time, coins }: { time: number; coins: number }) {
  return (
    <div
      className="absolute"
      style={{
        top: 24,
        right: 100,
        width: 110,
        height: 70,
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "none",
        border: "none",
        color: "#fff",
        fontFamily: "pixel-font, monospace",
        fontSize: 18,
        zIndex: 10,
        fontWeight: "bold",
        textShadow: "0 1px 2px #000",
      }}
    >
      <div style={{ lineHeight: 1.1 }}>
        <div>⏱️ {time}s</div>
        <div>🪙 {coins}</div>
      </div>
    </div>
  );
}

export default function SproutRun({ onGameEnd }: { onGameEnd: (coins: number, completed: boolean) => void }) {
  const gameRef = useRef<HTMLDivElement>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [coinsCollected, setCoinsCollected] = useState(0);

  const coinsRef = useRef(0);

  useEffect(() => {
    coinsRef.current = coinsCollected;
  }, [coinsCollected]);

  useEffect(() => {
    let currentAnim = "idle";
    let isDoubleJumping = false;
    let isJumping = false;
    let backgroundMusic: Phaser.Sound.BaseSound;

    // Tamaño de la ventana grande
    const GAME_WIDTH = 1000;
    const GAME_HEIGHT = 600;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      parent: gameRef.current || undefined,
      physics: {
        default: "arcade",
        arcade: { gravity: { x: 0, y: 780 }, debug: false },
      },
      backgroundColor: "rgba(0,0,0,0)",
      scene: { preload, create, update },
    };

    const game = new Phaser.Game(config);

    let player: Phaser.Physics.Arcade.Sprite;
    let cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    let wasd: any;
    let groundLayer: Phaser.Tilemaps.TilemapLayer | null = null;
    let canDoubleJump = false;
    let jumpKeyPressed = false;
    let coinsGroup: Phaser.Physics.Arcade.Group;
    let map: Phaser.Tilemaps.Tilemap;
    let scale = 1;

    function preload(this: Phaser.Scene) {
      this.load.spritesheet("run", runSprite, { frameWidth: 32, frameHeight: 32 });
      this.load.spritesheet("jump", jumpSprite, { frameWidth: 32, frameHeight: 32 });
      this.load.spritesheet("idle", idleSprite, { frameWidth: 32, frameHeight: 32 });
      this.load.spritesheet("doubleJump", doubleJumpSprite, { frameWidth: 32, frameHeight: 32 });
      this.load.spritesheet("fall", fallSprite, { frameWidth: 32, frameHeight: 32 });

      this.load.image("terrain", terrainSprite);
      this.load.tilemapTiledJSON("map", mapJSON);
      this.load.spritesheet("coin", coinSprite, { frameWidth: 16, frameHeight: 16 });
      this.load.spritesheet("coin-collected", CollectedCoin, { frameWidth: 32, frameHeight: 32 });
      this.load.image("background", background);
      this.load.audio('backgroundMusic', music);
    }

    function create(this: Phaser.Scene) {
      // Fondo
      const bgWidth = GAME_WIDTH - 40
      const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, "background");
      bg.setDisplaySize(bgWidth, GAME_HEIGHT);
      bg.setDepth(-10);

      const darkOverlay = this.add.rectangle(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2,
        bgWidth,
        GAME_HEIGHT,
        0x000000,
        0.60
      );

      darkOverlay.setDepth(-9);
      map = this.make.tilemap({ key: "map" });
      const tileset = map.addTilesetImage("Terrain", "terrain");

      if (!tileset) {
        console.error("Tileset no encontrado.");
        return;
      }

      // Calcular escala para que el mapa ocupe la ventana
      const scaleX = GAME_WIDTH / map.widthInPixels;
      const scaleY = GAME_HEIGHT / map.heightInPixels;
      scale = Math.min(scaleX, scaleY);

      // Layer escalado
      groundLayer = map.createLayer("Ground", tileset, 0, 0);
      if (groundLayer) {
        groundLayer.setCollisionByExclusion([-1]);
        groundLayer.setDepth(-1);
        groundLayer.setScale(scale);
      }

      // Ajustar spawn del jugador según escala
      const spawnPoint = map.findObject("Objects", (obj) => obj.name === "PlayerSpawn");
      const spawnX = (spawnPoint?.x || 100) * scale;
      const spawnY = (spawnPoint?.y || 300) * scale;

      player = this.physics.add.sprite(spawnX, spawnY, "idle");
      player.setCollideWorldBounds(true);
      player.setDepth(2);
      player.setScale(scale);

      if (player.body) {
        // Ajustar collider proporcionalmente
        player.body.setSize(12, 18);
        player.body.setOffset(10, 14);
      }

      if (groundLayer) {
        this.physics.add.collider(player, groundLayer);
      }

      cursors = this.input.keyboard!.createCursorKeys();
      wasd = this.input.keyboard!.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
      });

      this.anims.create({
        key: "run",
        frames: this.anims.generateFrameNumbers("run", { start: 0, end: 12 }),
        frameRate: 10,
        repeat: -1,
      });

      this.anims.create({
        key: "jump",
        frames: this.anims.generateFrameNumbers("jump", { start: 0, end: 1 }),
        frameRate: 10,
        repeat: 0,
      });

      this.anims.create({
        key: "doubleJump",
        frames: this.anims.generateFrameNumbers("doubleJump", { start: 0, end: 6 }),
        frameRate: 12,
        repeat: 0,
      });

      this.anims.create({
        key: "fall",
        frames: this.anims.generateFrameNumbers("fall", { start: 0, end: 1 }),
        frameRate: 10,
        repeat: -1,
      });

      this.anims.create({
        key: "idle",
        frames: this.anims.generateFrameNumbers("idle", { start: 0, end: 11 }),
        frameRate: 10,
        repeat: -1,
      });

      this.anims.create({
        key: "coin-spin",
        frames: this.anims.generateFrameNumbers("coin", { start: 0, end: 8 }),
        frameRate: 10,
        repeat: -1,
      });

      this.anims.create({
        key: "coin-collect-anim",
        frames: this.anims.generateFrameNumbers("coin-collected", { start: 0, end: 5 }),
        frameRate: 15,
        repeat: 0
      });

      coinsGroup = this.physics.add.group();
      let coinCount = 0;
      map.getObjectLayer("Objects")?.objects.forEach((obj) => {
        if (obj.name === "Coin") {
          // Escalar posición de la moneda
          const coin = coinsGroup.create(obj.x! * scale, obj.y! * scale, "coin");
          coin.setOrigin(0.5, 0.5);
          coin.setDepth(5);
          coin.setActive(true);
          coin.setVisible(true);
          coin.body.setAllowGravity(false);
          coin.anims.play("coin-spin");
          coin.setScale(scale);
          coinCount++;
        }
      });

      // Configurar y reproducir la música de fondo
      backgroundMusic = this.sound.add('backgroundMusic', { loop: true });

      // Manejar la política de autoplay del navegador
      if (this.sound.locked) {
        this.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
          backgroundMusic.play();
        });
      } else {
        backgroundMusic.play();
      }

      this.physics.add.overlap(player, coinsGroup, (_player, coinGO) => {
        // Usamos una aserción de tipo para trabajar más cómodamente
        const originalCoin = coinGO as Phaser.Physics.Arcade.Sprite;

        // Solo procesar si la moneda está activa (no ha sido recolectada ya)
        if (originalCoin.active) {
          // 1. Marcar la moneda original como inactiva y ocultarla inmediatamente
          originalCoin.setActive(false);
          originalCoin.setVisible(false);
          originalCoin.disableBody(true, true); // Desactivar física también

          // 2. Incrementar el contador de monedas
          setCoinsCollected((prev) => prev + 1);
          coinsRef.current += 1;

          // 3. Crear un sprite temporal para el efecto de recolección
          //    Usamos la posición de la moneda original y la textura 'coin-collected'
          const effect = this.add.sprite(originalCoin.x, originalCoin.y, "coin-collected")
            .setScale(scale) // Aplicar la misma escala que otros elementos si es necesario
            .setDepth(originalCoin.depth + 1); // Asegurarse de que se vea por encima

          // 4. Reproducir la animación de recolección en el sprite de efecto
          effect.play("coin-collect-anim");

          // 5. Destruir el sprite de efecto una vez que su animación termine
          effect.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            effect.destroy();
          });

          // 6. Programar la reaparición de la moneda original (como antes)
          this.time.delayedCall(15000, () => {
            // Reactivar la moneda original en su sitio, hacerla visible,
            // reactivar su cuerpo físico y ponerla a girar de nuevo.
            originalCoin.enableBody(true, originalCoin.x, originalCoin.y, true, true);
            originalCoin.setActive(true);
            originalCoin.setVisible(true);
            originalCoin.anims.play("coin-spin"); // Volver a la animación de giro
          });
        }
      });

      this.time.addEvent({
        delay: 1000,
        callback: () => {
          setTimeLeft((prev) => {
            if (prev - 1 <= 0) {
              onGameEnd(coinsRef.current, true);
              this.scene.pause();
              return 0;
            }
            return prev - 1;
          });
        },
        loop: true,
      });
    }

    function update(this: Phaser.Scene) {
      if (!player || !player.body) return;
      const leftPressed = wasd.left.isDown || cursors.left.isDown;
      const rightPressed = wasd.right.isDown || cursors.right.isDown;
      const upPressed = wasd.up.isDown || cursors.up.isDown;

      // Ajustar velocidad según escala para mantener jugabilidad
      const baseSpeed = 160 * scale;
      const baseJump = -325 * scale;
      const baseDoubleJump = -225 * scale;

      if (leftPressed) {
        player.setVelocityX(-baseSpeed);
        if (player.body.blocked.down && !isJumping && !isDoubleJumping) {
          if (currentAnim !== "run") {
            player.anims.play("run", true);
            currentAnim = "run";
          }
        }
        player.flipX = true;
      } else if (rightPressed) {
        player.setVelocityX(baseSpeed);
        if (player.body.blocked.down && !isJumping && !isDoubleJumping) {
          if (currentAnim !== "run") {
            player.anims.play("run", true);
            currentAnim = "run";
          }
        }
        player.flipX = false;
      } else {
        player.setVelocityX(0);
        if (player.body.blocked.down && !isJumping && !isDoubleJumping) {
          if (currentAnim !== "idle") {
            player.anims.play("idle", true);
            currentAnim = "idle";
          }
        }
      }

      if (upPressed && !jumpKeyPressed) {
        jumpKeyPressed = true;
        if (player.body?.blocked.down) {
          player.setVelocityY(baseJump);
          player.anims.play("jump", true);
          currentAnim = "jump";
          isJumping = true;
          canDoubleJump = true;
        } else if (canDoubleJump) {
          player.setVelocityY(baseDoubleJump);
          player.anims.play("doubleJump", true);
          currentAnim = "doubleJump";
          isDoubleJumping = true;
          canDoubleJump = false;
        }
      } else if (!upPressed) {
        jumpKeyPressed = false;
      }

      if (
        !player.body.blocked.down &&
        player.body.velocity.y > 20 * scale &&
        currentAnim !== "fall"
      ) {
        player.anims.play("fall", true);
        currentAnim = "fall";
      } else if (!player.body.blocked.down) {
        if (isDoubleJumping && currentAnim !== "doubleJump" && player.body.velocity.y <= 0) {
          player.anims.play("doubleJump", true);
          currentAnim = "doubleJump";
        } else if (isJumping && currentAnim !== "jump" && !isDoubleJumping && player.body.velocity.y <= 0) {
          player.anims.play("jump", true);
          currentAnim = "jump";
        }
      }

      if (player.body.blocked.down) {
        if (isJumping || isDoubleJumping) {
          isJumping = false;
          isDoubleJumping = false;
        }
      }
    }

    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <div className="relative">
      <div
        ref={gameRef}
        className="w-[1024px] h-[600px]"
        style={{
          background: "transparent",
        }}
      ></div>
      <GameHUD time={timeLeft} coins={coinsCollected} />
    </div>
  );
}
