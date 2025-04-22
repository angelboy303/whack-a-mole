import { ref, push, query, orderByChild, limitToLast, onValue } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

class WhacAMole {
    constructor() {
        this.score = 0;
        this.isPlaying = false;
        this.timeLeft = 60;
        this.isFeverTime = false;
        this.lastHole = null;
        
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
        this.moleInterval = setInterval(() => this.showRandomMole(), 1200);
    }
    
    updateTimer() {
        this.timeLeft--;
        this.timeDisplay.textContent = this.timeLeft;
        
        if (this.timeLeft === 30) {
            this.isFeverTime = true;
            this.feverMessage.classList.remove('hidden');
            document.querySelector('.time').classList.add('fever-time');
            clearInterval(this.moleInterval);
            this.moleInterval = setInterval(() => this.showRandomMole(), 800);
        }
        
        if (this.isFeverTime && this.timeLeft < 30) {
            const feverTimeLeft = this.timeLeft;
            document.getElementById('fever-timer').textContent = feverTimeLeft;
        }
        
        if (this.timeLeft <= 0) {
            this.endGame();
        }
    }
    
    showRandomMole() {
        this.holes.forEach(hole => hole.classList.remove('active'));
        
        if (this.isFeverTime) {
            // Fever Time: 1~3마리의 비버가 랜덤하게 나타남
            const numMoles = Math.floor(Math.random() * 3) + 1; // 1~3
            const availableHoles = [...this.holes];
            
            for (let i = 0; i < numMoles; i++) {
                if (availableHoles.length === 0) break;
                
                const randomIndex = Math.floor(Math.random() * availableHoles.length);
                const randomHole = availableHoles[randomIndex];
                
                // 이전 구멍과 다른 구멍을 선택
                if (randomHole !== this.lastHole) {
                    randomHole.classList.add('active');
                    this.lastHole = randomHole;
                }
                
                availableHoles.splice(randomIndex, 1);
            }
        } else {
            // 일반 시간: 1마리의 비버만 나타남
            let randomHole;
            do {
                randomHole = this.holes[Math.floor(Math.random() * this.holes.length)];
            } while (randomHole === this.lastHole);
            
            this.lastHole = randomHole;
            randomHole.classList.add('active');
        }
        
        // 비버가 사라지는 시간 조정
        const disappearTime = this.isFeverTime ? 700 : 1000; // 각각 0.7초, 1초 동안 표시
        
        setTimeout(() => {
            this.holes.forEach(hole => {
                if (hole.classList.contains('active')) {
                    hole.classList.remove('active');
                }
            });
        }, disappearTime);
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
        
        // 점수 애니메이션
        const scoreElement = this.scoreDisplay;
        scoreElement.style.transform = 'scale(1.2)';
        setTimeout(() => {
            scoreElement.style.transform = 'scale(1)';
        }, 200);
        
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
        let medalEmoji = '';
        if (this.score >= this.medals.gold) {
            medalType = '🥇 골드';
            medalEmoji = '🥇';
        } else if (this.score >= this.medals.silver) {
            medalType = '🥈 실버';
            medalEmoji = '🥈';
        } else if (this.score >= this.medals.bronze) {
            medalType = '🥉 브론즈';
            medalEmoji = '🥉';
        }
        
        if (medalType) {
            this.medal.classList.remove('hidden');
            this.medal.querySelector('.medal-image').textContent = medalEmoji;
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
        document.getElementById('nickname').value = '';
    }
}

// 게임 인스턴스 생성
const game = new WhacAMole();
