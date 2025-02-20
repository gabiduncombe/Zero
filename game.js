class MathGame {
    constructor() {
        this.numbers = [];
        this.placedNumbers = 0;  // Add counter for placed numbers
        this.victoryScreen = document.querySelector('.victory-screen');
        this.initialNumbers = []; // Store initial numbers
        this.moves = 0;
        this.movesDisplay = document.querySelector('.moves-counter span');
        this.minMoves = 3;  // Store minimum moves for current puzzle
        this.solutionScreen = document.querySelector('.solution-screen');  // Make sure this exists
        this.initializeGame();
        this.setupEventListeners();
    }

    generatePuzzle() {
        const puzzleSets = [
            [2, 4, 8, 16], [3, 6, 9, 18], [4, 8, 12, 16], [2, 6, 12, 18], [4, 8, 16, 20],
            [2, 4, 6, 12], [3, 9, 12, 18], [4, 12, 16, 20], [2, 8, 16, 20], [6, 12, 15, 18],
            [4, 8, 12, 20], [2, 10, 15, 20], [5, 10, 15, 20], [4, 12, 15, 18], [2, 6, 12, 15],
            [8, 12, 16, 20], [4, 8, 15, 20], [2, 8, 12, 16], [6, 9, 12, 18], [4, 12, 16, 18],
            [2, 4, 12, 16], [3, 6, 9, 15], [4, 8, 12, 15], [2, 6, 12, 20], [4, 8, 12, 18],
            [2, 4, 10, 20], [3, 6, 15, 18], [4, 8, 16, 18], [2, 6, 18, 20], [4, 12, 15, 20],
            [1, 2, 4, 8], [1, 3, 6, 12], [1, 4, 8, 16], [1, 5, 10, 20], [2, 3, 6, 9],
            [2, 5, 10, 15], [3, 4, 8, 12], [3, 5, 10, 15], [4, 5, 10, 20], [5, 6, 12, 18],
            [1, 2, 6, 12], [1, 3, 9, 18], [1, 4, 12, 16], [1, 6, 12, 18], [2, 3, 12, 18],
            [2, 6, 8, 16], [3, 4, 12, 16], [3, 6, 8, 12], [4, 6, 8, 16], [5, 8, 12, 16],
            [1, 2, 8, 16], [1, 3, 12, 15], [1, 4, 16, 20], [1, 8, 12, 16], [2, 3, 15, 18],
            [2, 8, 10, 20], [3, 4, 15, 18], [3, 8, 9, 12], [4, 8, 10, 12], [5, 10, 12, 15],
            [1, 2, 10, 20], [1, 3, 15, 18], [1, 5, 15, 20], [1, 10, 12, 15], [2, 4, 15, 18],
            [2, 10, 12, 16], [3, 5, 12, 15], [3, 10, 12, 15], [4, 10, 12, 16], [6, 10, 12, 18],
            [1, 4, 6, 8], [2, 3, 8, 12], [2, 4, 9, 18], [2, 6, 9, 12], [3, 4, 6, 12],
            [3, 6, 10, 15], [4, 6, 9, 12], [4, 8, 9, 12], [5, 6, 8, 15], [6, 8, 10, 12],
            [1, 5, 6, 12], [2, 3, 10, 15], [2, 5, 6, 15], [2, 8, 9, 18], [3, 4, 10, 20],
            [3, 8, 10, 15], [4, 6, 10, 20], [4, 10, 15, 20], [5, 6, 10, 20], [6, 10, 15, 20],
            [1, 6, 8, 12], [2, 4, 5, 10], [2, 6, 10, 12], [3, 4, 5, 12], [3, 6, 16, 18],
            [4, 5, 6, 15], [4, 6, 15, 18], [5, 6, 16, 20], [6, 8, 15, 18], [8, 10, 15, 20],
            [1, 8, 10, 12], [2, 5, 8, 10], [2, 8, 15, 18], [3, 5, 8, 16], [3, 8, 15, 18],
            [4, 5, 8, 20], [4, 8, 18, 20], [5, 8, 18, 20], [8, 12, 15, 18], [10, 12, 15, 18],
            [1, 2, 3, 6], [1, 2, 5, 10], [1, 3, 4, 12], [1, 4, 5, 20], [2, 3, 4, 12],
            [2, 5, 6, 12], [3, 4, 5, 15], [3, 5, 6, 18], [4, 5, 6, 12], [5, 6, 8, 12],
            [1, 2, 9, 18], [1, 3, 8, 16], [1, 4, 10, 15], [1, 5, 8, 20], [2, 3, 16, 18],
            [2, 5, 16, 20], [3, 4, 16, 20], [3, 5, 16, 20], [4, 5, 16, 20], [5, 6, 16, 18],
            [1, 2, 15, 18], [1, 3, 10, 20], [1, 4, 15, 18], [1, 5, 12, 18], [2, 3, 5, 15],
            [2, 5, 12, 18], [3, 4, 8, 15], [3, 5, 12, 18], [4, 5, 12, 18], [5, 6, 12, 15],
            [1, 6, 10, 15], [2, 6, 15, 18], [2, 9, 12, 15], [3, 6, 12, 15], [3, 9, 15, 18],
            [4, 6, 12, 15], [4, 9, 12, 15], [5, 9, 12, 15], [6, 9, 15, 18], [9, 12, 15, 18],
            [1, 8, 15, 18], [2, 8, 12, 15], [2, 10, 12, 15], [3, 8, 12, 15], [3, 10, 15, 18],
            [4, 8, 15, 18], [4, 10, 12, 15], [5, 8, 12, 15], [6, 8, 12, 15], [8, 10, 12, 15]
        ];
        
        return puzzleSets[Math.floor(Math.random() * puzzleSets.length)];
    }

    initializeGame() {
        const puzzleNumbers = this.generatePuzzle();
        this.initialNumbers = puzzleNumbers;
        this.numbers = [...this.initialNumbers];
        this.moves = 3;  // Start at 3 moves
        this.minMoves = 3;
        this.renderNumbers();
        this.updateMovesDisplay();
    }

    renderNumbers() {
        const numberPool = document.querySelector('.number-pool');
        numberPool.innerHTML = '';
        
        this.numbers.forEach(num => {
            const numberElement = document.createElement('div');
            numberElement.className = 'number';
            numberElement.draggable = true;
            numberElement.textContent = num;
            numberPool.appendChild(numberElement);
        });
    }

    updateDraggableState() {
        // Disable/enable dragging based on number of placed numbers
        const poolNumbers = document.querySelectorAll('.number-pool .number');
        poolNumbers.forEach(num => {
            num.draggable = this.placedNumbers < 2;
            // Optional: visual feedback
            num.style.cursor = this.placedNumbers < 2 ? 'move' : 'not-allowed';
            num.style.opacity = this.placedNumbers < 2 ? '1' : '0.5';
        });
    }

    updateMovesDisplay() {
        this.movesDisplay.textContent = this.moves;
    }

    setupEventListeners() {
        // Setup drag and drop
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('number')) {
                e.target.classList.add('dragging');
            }
        });

        document.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('number')) {
                e.target.classList.remove('dragging');
                if (e.target.closest('.number-pool')) {
                    this.updateDraggableState();
                }
            }
        });

        // Setup quadrants and slots for dropping
        const quadrants = document.querySelectorAll('.quadrant');
        quadrants.forEach(quadrant => {
            quadrant.addEventListener('dragover', (e) => {
                e.preventDefault();
                // Find first empty slot in this quadrant
                const emptySlot = Array.from(quadrant.querySelectorAll('.slot'))
                    .find(slot => !slot.hasChildNodes());
                if (emptySlot) {
                    emptySlot.classList.add('drag-over');
                }
            });

            quadrant.addEventListener('dragleave', (e) => {
                // Only remove highlight if we're actually leaving the quadrant
                if (!e.relatedTarget?.closest('.quadrant')?.isSameNode(quadrant)) {
                    quadrant.querySelectorAll('.slot').forEach(slot => 
                        slot.classList.remove('drag-over')
                    );
                }
            });

            quadrant.addEventListener('drop', (e) => {
                e.preventDefault();
                const draggingNumber = document.querySelector('.dragging');
                if (!draggingNumber) return;

                // Remove drag-over effect from all slots
                quadrant.querySelectorAll('.slot').forEach(slot => 
                    slot.classList.remove('drag-over')
                );

                // If dropped directly on a slot, use that slot
                const targetSlot = e.target.closest('.slot');
                if (targetSlot && !targetSlot.hasChildNodes()) {
                    if (draggingNumber.closest('.number-pool')) {
                        this.placedNumbers++;
                    }
                    targetSlot.appendChild(draggingNumber);
                    this.updateDraggableState();
                    this.updateQuadrantState(quadrant);
                    return;
                }

                // Otherwise, find first empty slot
                const emptySlot = Array.from(quadrant.querySelectorAll('.slot'))
                    .find(slot => !slot.hasChildNodes());
                
                if (emptySlot) {
                    if (draggingNumber.closest('.number-pool')) {
                        this.placedNumbers++;
                    }
                    emptySlot.appendChild(draggingNumber);
                    this.updateDraggableState();
                    this.updateQuadrantState(quadrant);
                }
            });

            // Keep the click handler for operations
            quadrant.addEventListener('click', () => {
                this.processOperation(quadrant);
            });
        });

        // Setup number pool for receiving numbers back
        const numberPool = document.querySelector('.number-pool');
        numberPool.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        numberPool.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggingNumber = document.querySelector('.dragging');
            if (draggingNumber) {
                const quadrant = draggingNumber.closest('.quadrant');
                if (draggingNumber.closest('.slot')) {
                    this.placedNumbers--;
                }
                numberPool.appendChild(draggingNumber);
                this.updateDraggableState();
                if (quadrant) {
                    this.updateQuadrantState(quadrant);
                }
            }
        });

        // Update victory screen button listeners
        const playAgainButton = document.querySelector('.play-again');
        const redoButton = document.querySelector('.redo-button');

        playAgainButton.addEventListener('click', () => {
            this.victoryScreen.style.display = 'none';
            this.initializeGame();  // Start new game with new numbers
        });

        redoButton.addEventListener('click', () => {
            this.victoryScreen.style.display = 'none';
            this.resetGame();  // Reset with same initial numbers
        });

        // Add reset button listener
        const resetButton = document.querySelector('.button-container .reset-button');
        resetButton.addEventListener('click', () => {
            this.resetGame();  // Use the existing resetGame method
        });

        // Add give up button listener
        const giveUpButton = document.querySelector('.give-up-button');
        giveUpButton.addEventListener('click', () => {
            console.log('Give up clicked'); // Add debug logging
            this.showSolution();
        });

        // Add solution screen play again button listener
        const solutionPlayAgainButton = this.solutionScreen.querySelector('.play-again');
        solutionPlayAgainButton.addEventListener('click', () => {
            this.solutionScreen.style.display = 'none';
            this.initializeGame();
        });
    }

    processOperation(quadrant) {
        const slots = quadrant.querySelectorAll('.slot');
        if (!slots[0].hasChildNodes() || !slots[1].hasChildNodes()) return;

        const num1 = parseInt(slots[0].firstChild.textContent);
        const num2 = parseInt(slots[1].firstChild.textContent);
        const operation = quadrant.dataset.operation;

        let result;
        switch(operation) {
            case 'add':
                result = num1 + num2;
                break;
            case 'subtract':
                result = num1 - num2;  // Allow negative results
                break;
            case 'multiply':
                result = num1 * num2;
                break;
            case 'divide':
                if (num2 === 0 || num1 % num2 !== 0) return; // Only check for integer division
                result = num1 / num2;
                break;
        }

        // Remove the used numbers from their slots
        const usedNumbers = [slots[0].firstChild, slots[1].firstChild];
        usedNumbers.forEach(num => num.remove());
        
        // Get remaining numbers from the number pool
        const remainingNumbers = Array.from(document.querySelectorAll('.number-pool .number'))
            .map(num => parseInt(num.textContent));
        
        // Combine the result with remaining numbers
        this.numbers = [...remainingNumbers, result];
        this.renderNumbers();

        // Reset placed numbers counter after operation
        this.placedNumbers = 0;
        this.updateDraggableState();

        // Decrement moves counter
        this.moves--;
        this.updateMovesDisplay();

        // Check if game is won
        if (result === 0 && this.moves === 0) {  // Changed condition to check for 0 moves left
            this.victoryScreen.querySelector('h1').textContent = 
                `Congratulations!`;
            this.victoryScreen.style.display = 'flex';
        }

        // After processing an operation, update quadrant state
        this.updateQuadrantState(quadrant);
    }

    resetGame() {
        // Clear all slots
        document.querySelectorAll('.slot').forEach(slot => {
            if (slot.firstChild) {
                slot.firstChild.remove();
            }
        });
        
        // Reset to initial numbers
        this.numbers = [...this.initialNumbers];
        this.placedNumbers = 0;
        this.moves = 3;  // Reset to 3 moves
        this.renderNumbers();
        this.updateDraggableState();
        this.updateMovesDisplay();
    }

    updateQuadrantState(quadrant) {
        const slots = quadrant.querySelectorAll('.slot');
        const isFull = Array.from(slots).every(slot => slot.hasChildNodes());
        quadrant.classList.toggle('ready', isFull);
    }

    // Add new method to find solution
    findSolution(numbers) {
        for (let i = 0; i < numbers.length; i++) {
            for (let j = i + 1; j < numbers.length; j++) {
                const num1 = numbers[i];
                const num2 = numbers[j];
                const remainingNums = numbers.filter((_, idx) => idx !== i && idx !== j);
                
                // Only try operations that result in non-negative integers
                const operations = [
                    { result: num1 + num2, symbol: '+' },
                    { result: num1 - num2 >= 0 ? num1 - num2 : null, symbol: '-' },
                    { result: num2 - num1 >= 0 ? num2 - num1 : null, symbol: '-' },  // Add reverse subtraction
                    { result: num1 * num2, symbol: '×' },
                    { result: num1 % num2 === 0 ? num1 / num2 : null, symbol: '÷' },
                    { result: num2 % num1 === 0 ? num2 / num1 : null, symbol: '÷' }  // Add reverse division
                ];

                for (const op of operations) {
                    if (op.result === null || op.result < 0) continue;  // Skip negative results for hints
                    
                    const step1 = {
                        nums: [num1, num2],
                        operation: op.symbol,
                        result: op.result
                    };

                    const numsAfterStep1 = [...remainingNums, op.result];
                    const solution = this.findNextSteps(numsAfterStep1, [step1]);
                    if (solution) return solution;
                }
            }
        }
        return null;
    }

    findNextSteps(numbers, steps) {
        if (steps.length === 3 && numbers.includes(0)) return steps;
        if (steps.length >= 3) return null;

        for (let i = 0; i < numbers.length; i++) {
            for (let j = i + 1; j < numbers.length; j++) {
                const num1 = numbers[i];
                const num2 = numbers[j];
                const remainingNums = numbers.filter((_, idx) => idx !== i && idx !== j);
                
                // Match the operations from findSolution (non-negative integers only)
                const operations = [
                    { result: num1 + num2, symbol: '+' },
                    { result: num1 - num2 >= 0 ? num1 - num2 : null, symbol: '-' },
                    { result: num2 - num1 >= 0 ? num2 - num1 : null, symbol: '-' },  // Add reverse subtraction
                    { result: num1 * num2, symbol: '×' },
                    { result: num1 % num2 === 0 ? num1 / num2 : null, symbol: '÷' },
                    { result: num2 % num1 === 0 ? num2 / num1 : null, symbol: '÷' }  // Add reverse division
                ];

                for (const op of operations) {
                    if (op.result === null || op.result < 0) continue;  // Skip negative results for hints
                    
                    const newStep = {
                        nums: [num1, num2],
                        operation: op.symbol,
                        result: op.result
                    };

                    const solution = this.findNextSteps([...remainingNums, op.result], [...steps, newStep]);
                    if (solution) return solution;
                }
            }
        }
        return null;
    }

    showSolution() {
        console.log('Show solution called');
        const solution = this.findSolution(this.initialNumbers);
        console.log('Found solution:', solution);
        if (solution) {
            const solutionSteps = solution.map((step, index) => 
                `${step.nums[0]} ${step.operation} ${step.nums[1]} = ${step.result}`
            ).join('\n');
            
            console.log('Solution screen element:', this.solutionScreen);
            console.log('Setting solution steps:', solutionSteps);
            this.solutionScreen.querySelector('.solution-steps').textContent = solutionSteps;
            this.solutionScreen.style.display = 'flex';
            console.log('Solution screen display style:', this.solutionScreen.style.display);
        } else {
            console.log('No solution found for:', this.initialNumbers);
        }
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new MathGame();
}); 