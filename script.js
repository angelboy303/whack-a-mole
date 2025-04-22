import { ref, push, query, orderByChild, limitToLast, onValue } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

class WhacAMole {
    constructor() {
        this.score = 0;
        this.isPlaying = false;
        this.timeLeft = 60;
        this.isFeverTime = false;
        this.isUltraFeverTime = false;
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
        this.feverSound = document.getElementById('fever-sound');
        
        // 메달 기준
        this.medals = {
            bronze: 300,
            silver: 550,
            gold: 850
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
        this.isUltraFeverTime = false;
        
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
        this.moleInterval = setInterval(() => this.showRandomMole(), 1000);
    }
    
    updateTimer() {
        this.timeLeft--;
        this.timeDisplay.textContent = this.timeLeft;
        
        if (this.timeLeft === 30) {
            this.isFeverTime = true;
            this.feverMessage.classList.remove('hidden');
            document.querySelector('.time').classList.add('fever-time');
            clearInterval(this.moleInterval);
            this.moleInterval = setInterval(() => this.showRandomMole(), 700);
            
            if (this.feverSound) {
                this.feverSound.currentTime = 0;
                this.feverSound.play();
            }
        }
        
        if (this.timeLeft === 15) {
            this.isUltraFeverTime = true;
            clearInterval(this.moleInterval);
            this.moleInterval = setInterval(() => this.showRandomMole(), 500);
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
        // 먼저 모든 비버 제거
        this.holes.forEach(hole => {
            if (hole.classList.contains('active') && !hole.classList.contains('caught')) {
                hole.classList.add('removing');
                setTimeout(() => {
                    hole.classList.remove('active', 'removing');
                }, 200);
            }
        });

        if (this.isFeverTime) {
            const numMoles = Math.floor(Math.random() * 2) + 2; // 2~3
            const availableHoles = [...this.holes].filter(hole => !hole.classList.contains('caught'));
            
            for (let i = 0; i < numMoles && availableHoles.length > 0; i++) {
                const randomIndex = Math.floor(Math.random() * availableHoles.length);
                const randomHole = availableHoles[randomIndex];
                
                setTimeout(() => {
                    if (!randomHole.classList.contains('caught')) {
                        randomHole.classList.add('active');
                    }
                }, 200);
                availableHoles.splice(randomIndex, 1);
            }
        } else {
            let randomHole;
            do {
                randomHole = this.holes[Math.floor(Math.random() * this.holes.length)];
            } while (randomHole === this.lastHole || randomHole.classList.contains('caught'));
            
            this.lastHole = randomHole;
            setTimeout(() => {
                if (!randomHole.classList.contains('caught')) {
                    randomHole.classList.add('active');
                }
            }, 200);
        }
        
        const disappearTime = this.isUltraFeverTime ? 600 : (this.isFeverTime ? 800 : 1000);
        
        setTimeout(() => {
            this.holes.forEach(hole => {
                if (hole.classList.contains('active') && !hole.classList.contains('caught')) {
                    hole.classList.add('removing');
                    setTimeout(() => {
                        hole.classList.remove('active', 'removing');
                    }, 200);
                }
            });
        }, disappearTime);
    }
    
    whack(hole) {
        if (!hole.classList.contains('active') || !this.isPlaying) return;
        
        if (this.whackSound) {
            this.whackSound.currentTime = 0;
            this.whackSound.play();
        }
        
        // 점수 계산
        let points = 10;
        if (this.isUltraFeverTime) {
            points *= 3;
        } else if (this.isFeverTime) {
            points *= 2;
        }
        
        this.score += points;
        this.scoreDisplay.textContent = this.score;

        // 잡힌 상태로 변경 (깨꼬닥 이미지로 전환)
        hole.classList.add('caught');
        
        // 1.4초 후에 비버 제거 (caught 애니메이션 시간과 동일)
        setTimeout(() => {
            hole.classList.remove('active', 'caught');
        }, 1400);
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
            
            const nicknameForm = document.getElementById('nickname-form');
            nicknameForm.classList.remove('hidden');
            
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

const game = new WhacAMole();
