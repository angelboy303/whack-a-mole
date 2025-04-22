class WhacAMole {
    constructor() {
        this.score = 0;
        this.timeLeft = 60;
        this.gameInterval = null;
        this.moleInterval = null;
        this.isPlaying = false;
        this.isFever = false;
        this.moleSpeed = 1000;

        // 점수 목표
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
        if (this.bgm) {
            this.bgm.currentTime = 0;
            this.bgm.play();
        }

        if (this.gameInterval) clearInterval(this.gameInterval);
        if (this.moleInterval) clearInterval(this.moleInterval);

        this.gameInterval = setInterval(() => this.updateTimer(), 1000);
        this.moleInterval = setInterval(() => this.showMole(), this.moleSpeed);
    }

    startFeverTime() {
        this.isFever = true;
        this.moleSpeed = 700;
        this.feverIndicator.classList.remove('hidden');
        
        if (this.feverSound) {
            this.feverSound.currentTime = 0;
            this.feverSound.play();
        }
        
        clearInterval(this.moleInterval);
        this.moleInterval = setInterval(() => this.showMole(), this.moleSpeed);
    }

    endGame() {
        this.isPlaying = false;
        clearInterval(this.gameInterval);
        clearInterval(this.moleInterval);
        
        if (this.bgm) {
            this.bgm.pause();
            this.bgm.currentTime = 0;
        }
        
        this.holes.forEach(hole => {
            hole.classList.remove('active');
            hole.classList.remove('caught');
        });

        this.finalScoreDisplay.textContent = `최종 점수: ${this.score}`;
        
        // 메달 결정
        let medalType = null;
        if (this.score >= this.medals.gold) medalType = '🥇 골드';
        else if (this.score >= this.medals.silver) medalType = '🥈 실버';
        else if (this.score >= this.medals.bronze) medalType = '🥉 브론즈';

        if (medalType) {
            this.medal.classList.remove('hidden');
            this.medal.querySelector('.medal-text').textContent = `축하합니다! ${medalType} 달성!`;
            if (this.tadaSound) {
                this.tadaSound.currentTime = 0;
                this.tadaSound.play();
            }
        } else {
            this.medal.classList.add('hidden');
        }
        
        this.gameScreen.classList.add('hidden');
        this.endScreen.classList.remove('hidden');
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

    updateScore() {
        this.scoreDisplay.textContent = `점수: ${this.score}`;
    }

    updateTime() {
        this.timeDisplay.textContent = `${this.timeLeft}초`;
    }

    showMole() {
        this.holes.forEach(hole => {
            hole.classList.remove('active');
        });

        const moleCount = this.isFever ? Math.floor(Math.random() * 3) + 1 : 1;
        
        for (let i = 0; i < moleCount; i++) {
            const availableHoles = Array.from(this.holes).filter(hole => !hole.classList.contains('active'));
            if (availableHoles.length === 0) break;
            
            const randomHole = availableHoles[Math.floor(Math.random() * availableHoles.length)];
            randomHole.classList.remove('caught');  // 이전 애니메이션 제거
            randomHole.classList.add('active');
        }
    }

    whack(hole) {
        if (!this.isPlaying || !hole.classList.contains('active')) return;
        
        this.score += 10;
        this.updateScore();
        
        // 애니메이션 적용
        hole.classList.add('caught');
        hole.classList.remove('active');
        
        if (this.whackSound) {
            this.whackSound.currentTime = 0;
            this.whackSound.play();
        }

        // 애니메이션이 끝나면 caught 클래스 제거
        setTimeout(() => {
            hole.classList.remove('caught');
        }, 300);  // 애니메이션 지속 시간과 동일하게 설정
    }
}

// 게임 인스턴스 생성
document.addEventListener('DOMContentLoaded', () => {
    const game = new WhacAMole();
});
