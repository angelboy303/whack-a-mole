class WhacAMole {
    constructor() {
        this.score = 0;
        this.timeLeft = 30;
        this.gameInterval = null;
        this.moleInterval = null;
        this.isPlaying = false;

        // 효과음 요소
        this.whackSound = document.getElementById('whack-sound');
        this.appearSound = document.getElementById('appear-sound');

        // 화면 요소들
        this.startScreen = document.getElementById('start-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.endScreen = document.getElementById('end-screen');
        this.scoreDisplay = document.getElementById('score');
        this.timeDisplay = document.getElementById('time');
        this.finalScoreDisplay = document.getElementById('final-score');
        this.holes = document.querySelectorAll('.hole');

        // 버튼 이벤트 리스너
        document.getElementById('start-button').addEventListener('click', () => this.startGame());
        document.getElementById('restart-button').addEventListener('click', () => this.startGame());

        // 두더지 클릭 이벤트
        this.holes.forEach(hole => {
            hole.addEventListener('click', () => this.whack(hole));
        });
    }

    startGame() {
        this.score = 0;
        this.timeLeft = 30;
        this.isPlaying = true;
        
        this.startScreen.classList.add('hidden');
        this.endScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');
        
        this.updateScore();
        this.updateTime();

        this.gameInterval = setInterval(() => this.updateTimer(), 1000);
        this.moleInterval = setInterval(() => this.showMole(), 1000);
    }

    endGame() {
        this.isPlaying = false;
        clearInterval(this.gameInterval);
        clearInterval(this.moleInterval);
        
        this.holes.forEach(hole => {
            hole.classList.remove('active');
        });

        this.finalScoreDisplay.textContent = `최종 점수: ${this.score}`;
        
        this.gameScreen.classList.add('hidden');
        this.endScreen.classList.remove('hidden');
    }

    updateTimer() {
        this.timeLeft--;
        this.updateTime();
        
        if (this.timeLeft <= 0) {
            this.endGame();
        }
    }

    updateScore() {
        this.scoreDisplay.textContent = `점수: ${this.score}`;
    }

    updateTime() {
        this.timeDisplay.textContent = `시간: ${this.timeLeft}`;
    }

    showMole() {
        this.holes.forEach(hole => {
            hole.classList.remove('active');
        });

        const randomHole = this.holes[Math.floor(Math.random() * this.holes.length)];
        randomHole.classList.add('active');
        this.appearSound.currentTime = 0;
        this.appearSound.play();
    }

    whack(hole) {
        if (!this.isPlaying) return;
        
        if (hole.classList.contains('active')) {
            this.score += 10;
            this.updateScore();
            hole.classList.remove('active');
            
            this.whackSound.currentTime = 0;
            this.whackSound.play();
        }
    }
}

// 게임 인스턴스 생성
const game
