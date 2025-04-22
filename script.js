import { ref, push, query, orderByChild, limitToLast, onValue } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

class WhacAMole {
    constructor() {
        this.score = 0;
        this.isPlaying = false;
        this.timeLeft = 60;
        this.isFeverTime = false;
        
        // DOM 요소
        this.holes = Array.from(document.querySelectorAll('.hole'));
        this.scoreDisplay = document.getElementById('score');
        this.timeDisplay = document.getElementById('time');
        this.startScreen = document.getElementById('start-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.endScreen = document.getElementById('end-screen');
        this.startButton = document.getElementById('start-button');
        this.restartButton = document.getElementById('restart-button');
        this.finalScoreDisplay = document.getElementById('final-score');
        this.feverMessage = document.getElementById('fever-message');
        this.medal = document.getElementById('medal');
        
        // 사운드
        this.whackSound = document.getElementById('whack-sound');
        this.bgm = document.getElementById('bgm');
        this.tadaSound = document.getElementById('tada-sound');
        
        // 메달 기준
        this.medals = {
            bronze: 150,
            silver: 250,
            gold: 400
        };
        
        // 이벤트 리스너
        this.startButton.addEventListener('click', () => this.startGame());
        this.restartButton.addEventListener('click', () => this.resetGame());
        this.holes.forEach(hole => {
            hole.addEventListener('click', () => this.whack(hole));
        });
        
        // Firebase 리더보드 초기화
        this.initializeLeaderboard();
    }
    
    initializeLeaderboard() {
        const scoresRef = ref(window.db, 'scores');
        const topScoresQuery = query(
            scoresRef,
            orderByChild('score'),
            limitToLast(10)
        );
        
        onValue(topScoresQuery, (snapshot) => {
            const scores = [];
            snapshot.forEach((childSnapshot) => {
                scores.push(childSnapshot.val());
            });
            this.displayLeaderboard(scores.reverse());
        });
    }
    
    displayLeaderboard(scores) {
        const leaderboardList = document.getElementById('leaderboard-list');
        leaderboardList.innerHTML = scores
            .map((score, index) => `
                <div class="leaderboard-entry">
                    <span class="rank">${index + 1}</span>
                    <span class="nickname">${score.nickname}</span>
                    <span class="score">${score.score}</span>
                </div>
            `)
            .join('');
    }
    
    async saveScore(nickname, score) {
        try {
            const scoresRef = ref(window.db, 'scores');
            await push(scoresRef, {
                nickname: nickname,
                score: score,
                timestamp: Date.now()
            });
            return true;
        } catch (error) {
            console.error("Error saving score:", error);
            return false;
        }
    }
    
    startGame() {
        this.isPlaying = true;
        this.score = 0;
        this.timeLeft = 60;
        this.isFeverTime = false;
        
        this.scoreDisplay.textContent = this.score;
        this.timeDisplay.textContent = this.timeLeft;
        
        this.startScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');
        this.endScreen.classList.add('hidden');
        this.feverMessage.classList.add('hidden');
        
        if (this.bgm) {
            this.bgm.currentTime = 0;
            this.bgm.play();
        }
        
        this.gameInterval = setInterval(() => this.updateTimer(), 1000);
        this.moleInterval = setInterval(() => this.showRandomMole(), this.isFeverTime ? 500 : 1000);
    }
    
    updateTimer() {
        this.timeLeft--;
        this.timeDisplay.textContent = this.timeLeft;
        
        if (this.timeLeft === 30) {
            this.isFeverTime = true;
            this.feverMessage.classList.remove('hidden');
            clearInterval(this.moleInterval);
            this.moleInterval = setInterval(() => this.showRandomMole(), 500);
        }
        
        if (this.timeLeft <= 0) {
            this.endGame();
        }
    }
    
    showRandomMole() {
        this.holes.forEach(hole => hole.classList.remove('active'));
        const randomHole = this.holes[Math.floor(Math.random() * this.holes.length)];
        randomHole.classList.add('active');
    }
    
    whack(hole) {
        if (!this.isPlaying || !hole.classList.contains('active')) return;
        
        hole.classList.remove('active');
        hole.classList.add('caught');
        
        if (this.whackSound) {
            this.whackSound.currentTime = 0;
            this.whackSound.play();
        }
        
        this.score += this.isFeverTime ? 20 : 10;
        this.scoreDisplay.textContent = this.score;
        
        setTimeout(() => {
            hole.classList.remove('caught');
        }, 500);
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
            
            // 닉네임 입력 폼 표시
            const nicknameForm = document.getElementById('nickname-form');
            nicknameForm.classList.remove('hidden');
            
            // 점수 저장 이벤트
            document.getElementById('save-score').onclick = async () => {
                const nickname = document.getElementById('nickname').value.trim();
                if (nickname) {
                    const saved = await this.saveScore(nickname, this.score);
                    if (saved) {
                        nicknameForm.classList.add('hidden');
                    }
                }
            };
            
            if (this.tadaSound) {
                this.tadaSound.currentTime = 0;
                this.tadaSound.play();
            }
        }
        
        this.gameScreen.classList.add('hidden');
        this.endScreen.classList.remove('hidden');
    }
    
    resetGame() {
        this.endScreen.classList.add('hidden');
        this.startScreen.classList.remove('hidden');
        this.medal.classList.add('hidden');
        document.getElementById('nickname-form').classList.add('hidden');
    }
}

// 게임 인스턴스 생성
const game = new WhacAMole();
