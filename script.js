class WhacAMole {
    constructor() {
        this.score = 0;
        this.timeLeft = 60;
        this.gameInterval = null;
        this.moleInterval = null;
        this.isPlaying = false;
        this.isFever = false;
        this.moleSpeed = 1000;

        // 점수 목표 하향 조정
        this.medals = {
            bronze: 150,
            silver: 250,
            gold: 400
        };

        // 오디오 요소들
        this.bgm = document.getElementById('bgm');
        this.whackSound = document.getElementById('whack-sound');
        this.feverSound = document.getElementById('fever-sound');
        this.tadaSound = document.getElementById('tada-sound');

        // 화면 요소들
        this.startScreen = document.getElementById('start-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.endScreen = document.getElementById('end-screen');
        this.scoreDisplay = document.getElementById('score');
        this.timeDisplay = document.getElementById('time');
        this.hourglass = document.querySelector('.hourglass');
        this.finalScoreDisplay = document.getElementById('final-score');
        this.feverIndicator = document.getElementById('fever-indicator');
        this.holes = document.querySelectorAll('.hole');
        this.medal = document.getElementById('medal');

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
        this.timeLeft = 60;
        this.isPlaying = true;
        this.isFever = false;
        this.moleSpeed = 1000;
        
        this.startScreen.classList.add('hidden');
        this.endScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');
        this.feverIndicator.classList.add('hidden');
        
        // 시간 표시 초기화
        this.timeDisplay.classList.remove('urgent');
        this.hourglass.classList.remove('urgent');
        
        this.updateScore();
        this.updateTime();

        // BGM 시작
        this.bgm.currentTime = 0;
        this.bgm.play();

        if (this.gameInterval) clearInterval(this.gameInterval);
        if (this.moleInterval) clearInterval(this.moleInterval);

        this.gameInterval = setInterval(() => this.updateTimer(), 1000);
        this.moleInterval = setInterval(() => this.showMole(), this.moleSpeed);
    }

    updateTimer() {
        this.timeLeft--;
        this.updateTime();
        
        // 30초 이하일 때 급박한 효과
        if (this.timeLeft <= 30) {
            this.timeDisplay.classList.add('urgent');
            this.hourglass.classList.add('urgent');
            if (!this.isFever) {
                this.startFeverTime();
            }
        }
        
        if (this.timeLeft <= 0) {
            this.endGame();
        }
    }

    updateTime() {
        this.timeDisplay.textContent = `${this.timeLeft}초`;
    }

    // 나머지 메서드들은 이전과 동일
}

// 게임 인스턴스 생성
document.addEventListener('DOMContentLoaded', () => {
    const game = new WhacAMole();
});
