(function () {
	'use strict';

	// ========================================
	// ESTELA DE BRILLITOS DEL CURSOR
	// ========================================
	const createSparkleTrail = () => {
		let mouseX = 0;
		let mouseY = 0;
		const sparkles = [];

		document.addEventListener('mousemove', (e) => {
			mouseX = e.clientX;
			mouseY = e.clientY;

			// Crear un brillito aleatorio cada cierto tiempo
			if (Math.random() < 0.3) {
				const sparkle = document.createElement('div');
				sparkle.className = 'sparkle';
				sparkle.textContent = '✨';
				sparkle.style.left = (mouseX + (Math.random() - 0.5) * 20) + 'px';
				sparkle.style.top = (mouseY + (Math.random() - 0.5) * 20) + 'px';
				document.body.appendChild(sparkle);

				sparkles.push(sparkle);

				// Eliminar el brillito después de la animación
				setTimeout(() => {
					sparkle.remove();
				}, 1000);
			}
		});
	};

	// ========================================
	// UTILIDADES
	// ========================================
	const onReady = (fn) => {
		if (document.readyState !== 'loading') fn();
		else document.addEventListener('DOMContentLoaded', fn);
	};

	const show = (element) => element.classList.add('active');
	const hide = (element) => element.classList.remove('active');
	const toggleHidden = (element, isHidden) => {
		if (isHidden) element.classList.add('hidden');
		else element.classList.remove('hidden');
	};

	// ========================================
	// ANIMACIÓN DE CORAZONES EN HEADER
	// ========================================
	const createHeartAnimation = () => {
		const canvas = document.querySelector('.header-effect-canvas');
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		const width = canvas.offsetWidth;
		const height = canvas.offsetHeight;
		canvas.width = width;
		canvas.height = height;

		const hearts = [];

		const addHeart = () => {
			hearts.push({
				x: Math.random() * width,
				y: -60,
				size: 18 + Math.random() * 18,
				vx: (Math.random() - 0.5) * 0.6,
				vy: 0.6 + Math.random() * 0.5,
				alpha: 0.7 + Math.random() * 0.25,
			});
		};

		const drawHeart = (x, y, size, alpha) => {
			ctx.save();
			ctx.translate(x, y);
			ctx.scale(size / 20, size / 20);
			ctx.beginPath();
			ctx.moveTo(10, 3);
			ctx.bezierCurveTo(10, 0, 0, 0, 0, 7);
			ctx.bezierCurveTo(0, 12, 10, 18, 10, 20);
			ctx.bezierCurveTo(10, 18, 20, 12, 20, 7);
			ctx.bezierCurveTo(20, 0, 10, 0, 10, 3);
			ctx.closePath();
			ctx.fillStyle = `rgba(235, 30, 80, ${alpha})`;
			ctx.shadowBlur = 18;
			ctx.shadowColor = 'rgba(255, 90, 120, 0.7)';
			ctx.fill();
			ctx.restore();
		};

		const animate = () => {
			ctx.clearRect(0, 0, width, height);
			if (hearts.length < 18) addHeart();

			hearts.forEach((heart) => {
				heart.x += heart.vx;
				heart.y += heart.vy;

				const fadeBase = Math.max(0, 1 - heart.y / (height + 100));
				const fade = Math.pow(fadeBase, 4);
				const alpha = heart.alpha * fade;

				drawHeart(heart.x, heart.y, heart.size, alpha);

				if (heart.y > height + 100 || heart.x < -50 || heart.x > width + 50) {
					heart.x = Math.random() * width;
					heart.y = -60;
					heart.vx = (Math.random() - 0.5) * 0.6;
					heart.vy = 0.6 + Math.random() * 0.5;
					heart.alpha = 0.7 + Math.random() * 0.25;
					heart.size = 18 + Math.random() * 18;
				}
			});

			requestAnimationFrame(animate);
		};

		animate();
	};

	// ========================================
	// JUEGO DE RASCA Y GANA
	// ========================================
	const cuponesPrizes = {
		hellokittycupon2: 'Ganaste un masaje por 20 minutos sin derecho a reclamos 💆‍♀️',
		LTScupon2: 'Hoy todo lo hago yo por ti ✨',
		rilakkumacupon2: 'Me dejo maquillarme o Comodín especial (con algunas reglas) 💅',
	};

	let gameState = {
		selectedCupon: null,
		isScratching: false,
		pointerId: null,
		scratchCanvas: null,
		scratchCtx: null,
	};

	// Mostrar sección de cupones
	const showCupons = () => {
		toggleHidden(document.getElementById('welcomeSection'), true);
		show(document.getElementById('cuponsSection'));
	};

	// Seleccionar cupón
	const selectCupon = (cuponName) => {
		document.querySelectorAll('.cupon-card').forEach((card) => {
			card.classList.remove('selected');
		});
		document.querySelector(`[data-cupon="${cuponName}"]`).classList.add('selected');
		gameState.selectedCupon = cuponName;

		setTimeout(() => {
			initScratchGame(cuponName);
		}, 500);
	};

	// Inicializar rasca y gana
	const initScratchGame = (cuponName) => {
		hide(document.getElementById('cuponsSection'));
		show(document.getElementById('scratchSection'));

		const prize = cuponesPrizes[cuponName];
		const wrapper = document.querySelector('.scratch-wrapper');
		wrapper.innerHTML = `
			<div class="selected-cupon-preview">
				<img src="assets/images/${cuponName}.png" alt="Cupón seleccionado" class="selected-cupon-image">
			</div>
			<div class="scratch-card">
				<div class="prize-background">${prize}</div>
				<canvas id="scratchCanvas" class="scratch-canvas"></canvas>
			</div>
		`;

		const scratchCard = document.querySelector('.scratch-card');
		setupScratchCanvas(scratchCard);
	};

	// Configurar canvas de rasca
	const setupScratchCanvas = (scratchCard) => {
		const canvas = document.getElementById('scratchCanvas');

		canvas.width = scratchCard.offsetWidth;
		canvas.height = scratchCard.offsetHeight;

		const ctx = canvas.getContext('2d');
		gameState.scratchCtx = ctx;
		gameState.scratchCanvas = canvas;

		// Llenar con capa gris plateado
		ctx.fillStyle = '#c0c0c0';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Agregar textura de rasca y gana
		ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
		for (let i = 0; i < canvas.width; i += 10) {
			ctx.fillRect(i, 0, 5, canvas.height);
		}

		canvas.addEventListener('pointerdown', startScratch);
		canvas.addEventListener('pointermove', scratch);
		canvas.addEventListener('pointerup', stopScratch);
		canvas.addEventListener('pointercancel', stopScratch);
		canvas.addEventListener('lostpointercapture', stopScratch);
	};

	let isScratchingNow = false;

	const startScratch = (e) => {
		isScratchingNow = true;
		if (gameState.scratchCanvas && e.pointerId != null && gameState.scratchCanvas.setPointerCapture) {
			gameState.scratchCanvas.setPointerCapture(e.pointerId);
			gameState.pointerId = e.pointerId;
		}
	};

	const stopScratch = () => {
		isScratchingNow = false;
		if (gameState.pointerId !== null && gameState.scratchCanvas && gameState.scratchCanvas.releasePointerCapture) {
			gameState.scratchCanvas.releasePointerCapture(gameState.pointerId);
		}
		gameState.pointerId = null;
	};

	const scratch = (e) => {
		if (!isScratchingNow || !gameState.scratchCanvas) return;

		const canvas = gameState.scratchCanvas;
		const ctx = gameState.scratchCtx;
		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		ctx.clearRect(x - 15, y - 15, 30, 30);

		// Verificar si se ha rascado suficiente (más del 40%)
		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		const data = imageData.data;
		let transparentPixels = 0;

		for (let i = 3; i < data.length; i += 4) {
			if (data[i] === 0) transparentPixels++;
		}

		const revealPercentage = (transparentPixels / (canvas.width * canvas.height)) * 100;

		if (revealPercentage > 90) {
			revealPrize();
		}
	};

	const revealPrize = () => {
		isScratchingNow = false;
		const canvas = document.getElementById('scratchCanvas');
		canvas.style.pointerEvents = 'none';

		setTimeout(() => {
			hide(document.getElementById('scratchSection'));

			const prize = cuponesPrizes[gameState.selectedCupon];
			document.getElementById('prizeText').textContent = prize;
			show(document.getElementById('resultSection'));
		}, 2000);
	};

	const restart = () => {
		hide(document.getElementById('resultSection'));
		toggleHidden(document.getElementById('welcomeSection'), false);
		gameState.selectedCupon = null;
		document.querySelectorAll('.cupon-card').forEach((card) => {
			card.classList.remove('selected');
		});
	};

	// ========================================
	// EVENT LISTENERS
	// ========================================
	onReady(() => {
		createSparkleTrail();
		createHeartAnimation();

		// Botón inicial
		document.getElementById('startBtn').addEventListener('click', showCupons);

		// Seleccionar cupones
		document.querySelectorAll('.cupon-card').forEach((card) => {
			card.addEventListener('click', () => {
				selectCupon(card.dataset.cupon);
			});
		});

		// Botón de reiniciar
		document.getElementById('restartBtn').addEventListener('click', restart);
	});

})();

