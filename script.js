class TournamentManager {
    constructor() {
        this.players = [];
        this.tournamentSize = 4;
        this.hasLosersBracket = false;
        this.winnersBracket = [];
        this.losersBracket = [];
        this.currentRound = 1;
        this.currentMatchIndex = 0;
        this.isLosersBracketRound = false;
        this.tournamentComplete = false;
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        // Setup section
        document.getElementById('generate-bracket').addEventListener('click', () => this.generateTournament());
        
        // Player section
        document.getElementById('start-tournament').addEventListener('click', () => this.startTournament());
        
        // Match section
        document.getElementById('select-player1').addEventListener('click', () => this.selectWinner(0));
        document.getElementById('select-player2').addEventListener('click', () => this.selectWinner(1));
        
        // Complete section
        document.getElementById('new-tournament').addEventListener('click', () => this.resetTournament());
        
        // Next round button
        document.getElementById('next-round').addEventListener('click', () => this.nextRound());
    }
    
    generateTournament() {
        this.tournamentSize = parseInt(document.getElementById('tournament-size').value);
        this.hasLosersBracket = document.getElementById('losers-bracket').checked;
        
        this.showSection('player-section');
        this.generatePlayerInputs();
    }
    
    generatePlayerInputs() {
        const playerInputsContainer = document.getElementById('player-inputs');
        playerInputsContainer.innerHTML = '';
        
        for (let i = 0; i < this.tournamentSize; i++) {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-input';
            playerDiv.innerHTML = `
                <h3>Player ${i + 1}</h3>
                <div class="form-group">
                    <label for="player-${i}-name">Name:</label>
                    <input type="text" id="player-${i}-name" placeholder="Enter player name" required>
                </div>
                <div class="form-group">
                    <label for="player-${i}-image">Image:</label>
                    <input type="file" id="player-${i}-image" accept="image/*">
                </div>
                <div id="player-${i}-preview" class="player-preview"></div>
            `;
            playerInputsContainer.appendChild(playerDiv);
            
            // Add image preview functionality
            const imageInput = document.getElementById(`player-${i}-image`);
            imageInput.addEventListener('change', (e) => this.handleImageUpload(e, i));
        }
    }
    
    handleImageUpload(event, playerIndex) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById(`player-${playerIndex}-preview`);
                preview.innerHTML = `
                    <img src="${e.target.result}" alt="Player ${playerIndex + 1}" 
                         style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-top: 10px;">
                `;
            };
            reader.readAsDataURL(file);
        }
    }
    
    startTournament() {
        // Collect player data
        this.players = [];
        let allPlayersValid = true;
        
        for (let i = 0; i < this.tournamentSize; i++) {
            const name = document.getElementById(`player-${i}-name`).value.trim();
            if (!name) {
                alert(`Please enter a name for Player ${i + 1}`);
                allPlayersValid = false;
                break;
            }
            
            const imageInput = document.getElementById(`player-${i}-image`);
            let imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
            
            if (imageInput.files[0]) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imageUrl = e.target.result;
                };
                reader.readAsDataURL(imageInput.files[0]);
                imageUrl = URL.createObjectURL(imageInput.files[0]);
            }
            
            this.players.push({
                id: i,
                name: name,
                image: imageUrl,
                eliminated: false
            });
        }
        
        if (allPlayersValid) {
            this.initializeBrackets();
            this.showSection('bracket-section');
            this.renderBracket();
            this.startNextMatch();
        }
    }
    
    initializeBrackets() {
        // Initialize winners bracket
        this.winnersBracket = [];
        this.currentRound = 1;
        this.currentMatchIndex = 0;
        this.isLosersBracketRound = false;
        
        // Create first round matches
        const shuffledPlayers = [...this.players].sort(() => Math.random() - 0.5);
        
        if (this.tournamentSize === 4) {
            // 4 players: 2 matches in round 1
            this.winnersBracket.push([
                { player1: shuffledPlayers[0], player2: shuffledPlayers[1], winner: null },
                { player1: shuffledPlayers[2], player2: shuffledPlayers[3], winner: null }
            ]);
            this.winnersBracket.push([
                { player1: null, player2: null, winner: null }
            ]);
        } else if (this.tournamentSize === 6) {
            // 6 players: 2 byes + 2 matches in round 1
            this.winnersBracket.push([
                { player1: shuffledPlayers[0], player2: null, winner: shuffledPlayers[0] }, // Bye
                { player1: shuffledPlayers[1], player2: null, winner: shuffledPlayers[1] }, // Bye
                { player1: shuffledPlayers[2], player2: shuffledPlayers[3], winner: null },
                { player1: shuffledPlayers[4], player2: shuffledPlayers[5], winner: null }
            ]);
            this.winnersBracket.push([
                { player1: null, player2: null, winner: null },
                { player1: null, player2: null, winner: null }
            ]);
            this.winnersBracket.push([
                { player1: null, player2: null, winner: null }
            ]);
        } else if (this.tournamentSize === 12) {
            // 12 players: 4 byes + 4 matches in round 1
            this.winnersBracket.push([
                { player1: shuffledPlayers[0], player2: null, winner: shuffledPlayers[0] }, // Bye
                { player1: shuffledPlayers[1], player2: null, winner: shuffledPlayers[1] }, // Bye
                { player1: shuffledPlayers[2], player2: null, winner: shuffledPlayers[2] }, // Bye
                { player1: shuffledPlayers[3], player2: null, winner: shuffledPlayers[3] }, // Bye
                { player1: shuffledPlayers[4], player2: shuffledPlayers[5], winner: null },
                { player1: shuffledPlayers[6], player2: shuffledPlayers[7], winner: null },
                { player1: shuffledPlayers[8], player2: shuffledPlayers[9], winner: null },
                { player1: shuffledPlayers[10], player2: shuffledPlayers[11], winner: null }
            ]);
            
            // Add subsequent rounds
            this.winnersBracket.push([
                { player1: null, player2: null, winner: null },
                { player1: null, player2: null, winner: null },
                { player1: null, player2: null, winner: null },
                { player1: null, player2: null, winner: null }
            ]);
            this.winnersBracket.push([
                { player1: null, player2: null, winner: null },
                { player1: null, player2: null, winner: null }
            ]);
            this.winnersBracket.push([
                { player1: null, player2: null, winner: null }
            ]);
        }
        
        // Initialize losers bracket if enabled
        if (this.hasLosersBracket) {
            this.losersBracket = [];
            // Losers bracket structure will be built as players are eliminated
        }
    }
    
    renderBracket() {
        const bracketContainer = document.getElementById('tournament-bracket');
        bracketContainer.innerHTML = '';
        
        const bracket = document.createElement('div');
        bracket.className = 'bracket';
        
        // Render winners bracket
        this.winnersBracket.forEach((round, roundIndex) => {
            const roundDiv = document.createElement('div');
            roundDiv.className = 'round';
            roundDiv.innerHTML = `<h3>Round ${roundIndex + 1}</h3>`;
            
            round.forEach((match, matchIndex) => {
                const matchDiv = document.createElement('div');
                matchDiv.className = 'match';
                
                if (match.winner) {
                    matchDiv.classList.add('completed');
                } else if (roundIndex === this.currentRound - 1 && matchIndex === this.currentMatchIndex && !this.isLosersBracketRound) {
                    matchDiv.classList.add('active');
                }
                
                matchDiv.innerHTML = this.renderMatch(match);
                roundDiv.appendChild(matchDiv);
            });
            
            bracket.appendChild(roundDiv);
        });
        
        // Render losers bracket if enabled
        if (this.hasLosersBracket && this.losersBracket.length > 0) {
            const losersBracketDiv = document.createElement('div');
            losersBracketDiv.innerHTML = '<h2 style="text-align: center; margin: 20px 0; color: #e53e3e;">Losers Bracket</h2>';
            bracket.appendChild(losersBracketDiv);
            
            this.losersBracket.forEach((round, roundIndex) => {
                const roundDiv = document.createElement('div');
                roundDiv.className = 'round';
                roundDiv.innerHTML = `<h3>LB Round ${roundIndex + 1}</h3>`;
                
                round.forEach((match, matchIndex) => {
                    const matchDiv = document.createElement('div');
                    matchDiv.className = 'match';
                    
                    if (match.winner) {
                        matchDiv.classList.add('completed');
                    } else if (this.isLosersBracketRound && roundIndex === this.currentRound - 1 && matchIndex === this.currentMatchIndex) {
                        matchDiv.classList.add('active');
                    }
                    
                    matchDiv.innerHTML = this.renderMatch(match);
                    roundDiv.appendChild(matchDiv);
                });
                
                bracket.appendChild(roundDiv);
            });
        }
        
        bracketContainer.appendChild(bracket);
    }
    
    renderMatch(match) {
        let html = '';
        
        if (match.player1) {
            html += `
                <div class="player ${match.winner === match.player1 ? 'winner' : ''}">
                    <img src="${match.player1.image}" alt="${match.player1.name}">
                    <span>${match.player1.name}</span>
                </div>
            `;
        } else {
            html += '<div class="player"><span>TBD</span></div>';
        }
        
        if (match.player2) {
            html += `
                <div class="player ${match.winner === match.player2 ? 'winner' : ''}">
                    <img src="${match.player2.image}" alt="${match.player2.name}">
                    <span>${match.player2.name}</span>
                </div>
            `;
        } else if (match.player1) {
            html += '<div class="player"><span>BYE</span></div>';
        } else {
            html += '<div class="player"><span>TBD</span></div>';
        }
        
        return html;
    }
    
    startNextMatch() {
        const currentMatch = this.getCurrentMatch();
        
        if (!currentMatch) {
            this.checkTournamentComplete();
            return;
        }
        
        // Skip matches that are already completed or are byes
        if (currentMatch.winner || !currentMatch.player2) {
            this.advanceMatch();
            return;
        }
        
        // Show match section
        this.showSection('match-section');
        this.displayCurrentMatch(currentMatch);
    }
    
    getCurrentMatch() {
        if (this.isLosersBracketRound) {
            return this.losersBracket[this.currentRound - 1]?.[this.currentMatchIndex];
        } else {
            return this.winnersBracket[this.currentRound - 1]?.[this.currentMatchIndex];
        }
    }
    
    displayCurrentMatch(match) {
        document.getElementById('player1-img').src = match.player1.image;
        document.getElementById('player1-name').textContent = match.player1.name;
        document.getElementById('player2-img').src = match.player2.image;
        document.getElementById('player2-name').textContent = match.player2.name;
        
        const roundText = this.isLosersBracketRound ? `Losers Bracket Round ${this.currentRound}` : `Round ${this.currentRound}`;
        document.getElementById('current-round').textContent = roundText;
    }
    
    selectWinner(playerIndex) {
        const currentMatch = this.getCurrentMatch();
        if (!currentMatch) return;
        
        const winner = playerIndex === 0 ? currentMatch.player1 : currentMatch.player2;
        const loser = playerIndex === 0 ? currentMatch.player2 : currentMatch.player1;
        
        currentMatch.winner = winner;
        
        // Handle losers bracket
        if (this.hasLosersBracket && !this.isLosersBracketRound) {
            this.addToLosersBracket(loser);
        }
        
        this.advanceMatch();
    }
    
    addToLosersBracket(player) {
        // Add eliminated player to losers bracket
        // This is a simplified implementation - full double elimination would be more complex
        if (!this.losersBracket[0]) {
            this.losersBracket[0] = [];
        }
        
        // Find or create a spot in the losers bracket
        let placed = false;
        for (let round of this.losersBracket) {
            for (let match of round) {
                if (!match.player1) {
                    match.player1 = player;
                    placed = true;
                    break;
                } else if (!match.player2) {
                    match.player2 = player;
                    placed = true;
                    break;
                }
            }
            if (placed) break;
        }
        
        if (!placed) {
            // Create new match in current losers round
            const currentLosersRound = this.losersBracket[this.losersBracket.length - 1] || [];
            currentLosersRound.push({ player1: player, player2: null, winner: null });
            if (this.losersBracket.length === 0) {
                this.losersBracket.push(currentLosersRound);
            }
        }
    }
    
    advanceMatch() {
        this.currentMatchIndex++;
        
        const currentBracket = this.isLosersBracketRound ? this.losersBracket : this.winnersBracket;
        const currentRoundMatches = currentBracket[this.currentRound - 1];
        
        if (this.currentMatchIndex >= currentRoundMatches.length) {
            // Move to next round
            this.nextRound();
        } else {
            // Continue with next match in current round
            this.updateNextRoundMatches();
            this.renderBracket();
            this.startNextMatch();
        }
    }
    
    nextRound() {
        this.updateNextRoundMatches();
        
        const currentBracket = this.isLosersBracketRound ? this.losersBracket : this.winnersBracket;
        
        // Check if current bracket is complete
        if (this.currentRound >= currentBracket.length || this.isRoundComplete()) {
            if (!this.isLosersBracketRound && this.hasLosersBracket && this.losersBracket.length > 0) {
                // Switch to losers bracket
                this.isLosersBracketRound = true;
                this.currentRound = 1;
                this.currentMatchIndex = 0;
            } else {
                this.checkTournamentComplete();
                return;
            }
        } else {
            this.currentRound++;
            this.currentMatchIndex = 0;
        }
        
        this.renderBracket();
        this.startNextMatch();
    }
    
    updateNextRoundMatches() {
        const currentBracket = this.isLosersBracketRound ? this.losersBracket : this.winnersBracket;
        const currentRoundMatches = currentBracket[this.currentRound - 1];
        
        if (this.currentRound < currentBracket.length) {
            const nextRoundMatches = currentBracket[this.currentRound];
            let nextMatchIndex = 0;
            
            for (let i = 0; i < currentRoundMatches.length; i += 2) {
                if (nextMatchIndex < nextRoundMatches.length) {
                    const match1 = currentRoundMatches[i];
                    const match2 = currentRoundMatches[i + 1];
                    
                    if (match1 && match1.winner) {
                        nextRoundMatches[nextMatchIndex].player1 = match1.winner;
                    }
                    if (match2 && match2.winner) {
                        nextRoundMatches[nextMatchIndex].player2 = match2.winner;
                    }
                    
                    nextMatchIndex++;
                }
            }
        }
    }
    
    isRoundComplete() {
        const currentBracket = this.isLosersBracketRound ? this.losersBracket : this.winnersBracket;
        const currentRoundMatches = currentBracket[this.currentRound - 1];
        
        return currentRoundMatches.every(match => match.winner !== null);
    }
    
    checkTournamentComplete() {
        const winnersChampion = this.winnersBracket[this.winnersBracket.length - 1][0].winner;
        
        if (winnersChampion) {
            if (this.hasLosersBracket) {
                // In double elimination, check if losers bracket champion needs to face winners champion
                const losersChampion = this.losersBracket.length > 0 ? 
                    this.losersBracket[this.losersBracket.length - 1][0]?.winner : null;
                
                if (losersChampion && losersChampion !== winnersChampion) {
                    // Final match between winners and losers champions
                    this.createGrandFinals(winnersChampion, losersChampion);
                    return;
                }
            }
            
            this.completeTournament(winnersChampion);
        }
    }
    
    createGrandFinals(winnersChampion, losersChampion) {
        // Create grand finals match
        const grandFinals = { player1: winnersChampion, player2: losersChampion, winner: null };
        
        this.showSection('match-section');
        this.displayCurrentMatch(grandFinals);
        document.getElementById('current-round').textContent = 'Grand Finals';
        
        // Override winner selection for grand finals
        document.getElementById('select-player1').onclick = () => this.completeTournament(winnersChampion);
        document.getElementById('select-player2').onclick = () => this.completeTournament(losersChampion);
    }
    
    completeTournament(winner) {
        this.tournamentComplete = true;
        this.showSection('complete-section');
        
        document.getElementById('winner-img').src = winner.image;
        document.getElementById('winner-name').textContent = winner.name;
    }
    
    resetTournament() {
        this.players = [];
        this.winnersBracket = [];
        this.losersBracket = [];
        this.currentRound = 1;
        this.currentMatchIndex = 0;
        this.isLosersBracketRound = false;
        this.tournamentComplete = false;
        
        this.showSection('setup-section');
        
        // Reset form
        document.getElementById('tournament-size').value = '4';
        document.getElementById('losers-bracket').checked = false;
    }
    
    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.add('hidden');
        });
        
        // Show target section
        document.getElementById(sectionId).classList.remove('hidden');
    }
}

// Initialize tournament manager when page loads
document.addEventListener('DOMContentLoaded', () => {
    new TournamentManager();
});