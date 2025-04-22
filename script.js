class WhacAMole {
    constructor() {
        this.score = 0;
        this.timeLeft = 30;
        this.gameInterval = null;
        this.moleInterval = null;
        this.isPlaying = false;

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
        
        // 화면 전환
        this.startScreen.classList.add('hidden');
        this.endScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');
        
        // 점수와 시간 초기화
        this.updateScore();
        this.updateTime();

        // 게임 타이머 시작
        this.gameInterval = setInterval(() => this.updateTimer(), 1000);
        
        // 두더지 출현 시작
        this.moleInterval = setInterval(() => this.showMole(), 1000);
    }

    endGame() {
        this.isPlaying = false;
        clearInterval(this.gameInterval);
        clearInterval(this.moleInterval);
        
        // 모든 두더지 숨기기
        this.holes.forEach(hole => {
            hole.textContent = '🕳️';
            hole.classList.remove('active');
        });

        // 최종 점수 표시
        this.finalScoreDisplay.textContent = `최종 점수: ${this.score}`;
        
        // 화면 전환
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
        // 모든 두더지 숨기기
        this.holes.forEach(hole => {
            hole.textContent = '🕳️';
            hole.classList.remove('active');
        });

        // 랜덤한 위치에 두더지 출현
        const randomHole = this.holes[Math.floor(Math.random() * this.holes.length)];
        randomHole.textContent = '🦔';
        randomHole.classList.add('active');
    }

    whack(hole) {
        if (!this.isPlaying) return;
        
        if (hole.textContent === '🦔') {
            this.score += 10;
            this.updateScore();
            hole.textContent = '🕳️';
            hole.classList.remove('active');
        }
    }
}

// 게임 인스턴스 생성
const game = new WhacAMole();
