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
        this.failureScreen = document.querySelector('.failure-screen');
        this.initializeGame();
        this.setupEventListeners();
    }

    generatePuzzle() {
        // Work backwards from 0 to create a guaranteed solvable puzzle
        const generateBackwards = () => {
            let numbers = [0];  // Start with target number
            const usedNumbers = new Set();  // Track used numbers to prevent duplicates
            
            // Generate 3 operations in reverse
            for (let i = 0; i < 3; i++) {
                const lastNum = numbers[numbers.length - 1];
                
                // Pick random operation and numbers that would result in lastNum
                const ops = [
                    // Addition: a + b = lastNum
                    () => {
                        let attempts = 0;
                        while (attempts < 20) {
                            const a = Math.floor(Math.random() * 20) + 1;  // 1-20
                            const b = lastNum - a;
                            if (b >= 1 && b <= 20 && !usedNumbers.has(a) && !usedNumbers.has(b)) {
                                usedNumbers.add(a);
                                usedNumbers.add(b);
                                return [a, b];
                            }
                            attempts++;
                        }
                        return null;
                    },
                    // Subtraction: a - b = lastNum
                    () => {
                        let attempts = 0;
                        while (attempts < 20) {
                            const b = Math.floor(Math.random() * 20) + 1;  // 1-20
                            const a = lastNum + b;
                            if (a >= 1 && a <= 20 && !usedNumbers.has(a) && !usedNumbers.has(b)) {
                                usedNumbers.add(a);
                                usedNumbers.add(b);
                                return [a, b];
                            }
                            attempts++;
                        }
                        return null;
                    },
                    // Multiplication: a * b = lastNum
                    () => {
                        if (lastNum === 0) {
                            let attempts = 0;
                            while (attempts < 20) {
                                const a = Math.floor(Math.random() * 19) + 2;  // 2-20
                                const b = Math.floor(Math.random() * 19) + 2;  // 2-20
                                if (!usedNumbers.has(a) && !usedNumbers.has(b)) {
                                    usedNumbers.add(a);
                                    usedNumbers.add(b);
                                    return [a, b];
                                }
                                attempts++;
                            }
                            return null;
                        }
                        
                        const factors = [];
                        for (let n = 1; n <= Math.min(20, lastNum); n++) {
                            if (lastNum % n === 0) {
                                const other = lastNum / n;
                                if (other >= 1 && other <= 20 && !usedNumbers.has(n) && !usedNumbers.has(other)) {
                                    factors.push([n, other]);
                                }
                            }
                        }
                        if (factors.length === 0) return null;
                        const pair = factors[Math.floor(Math.random() * factors.length)];
                        usedNumbers.add(pair[0]);
                        usedNumbers.add(pair[1]);
                        return pair;
                    },
                    // Division: a ÷ b = lastNum
                    () => {
                        let attempts = 0;
                        while (attempts < 20) {
                            const b = Math.floor(Math.random() * 20) + 1;  // 1-20
                            const a = lastNum * b;
                            if (a >= 1 && a <= 20 && !usedNumbers.has(a) && !usedNumbers.has(b)) {
                                usedNumbers.add(a);
                                usedNumbers.add(b);
                                return [a, b];
                            }
                            attempts++;
                        }
                        return null;
                    }
                ];

                // Try operations in random order until we get valid numbers
                const shuffledOps = ops.sort(() => Math.random() - 0.5);
                let validNumbers = null;
                
                for (const operation of shuffledOps) {
                    validNumbers = operation();
                    if (validNumbers) break;
                }
                
                if (!validNumbers) return null;  // Failed to generate valid numbers
                
                // Remove lastNum and add our two new numbers
                numbers.pop();
                numbers.push(...validNumbers);
            }
            
            return numbers;
        };

        // Keep trying until we get a valid puzzle with a solution
        let puzzle = null;
        while (!puzzle) {
            const candidate = generateBackwards();
            if (candidate && this.findSolution(candidate)) {
                puzzle = candidate;
            }
        }

        // Shuffle the numbers
        return puzzle.sort(() => Math.random() - 0.5);
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
        const dots = document.querySelectorAll('.move-dot');
        const movesUsed = 3 - this.moves;  // Convert remaining moves to used moves
        
        dots.forEach((dot, index) => {
            if (index < movesUsed) {
                dot.classList.add('used');
            } else {
                dot.classList.remove('used');
            }
        });
    }

    setupEventListeners() {
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('number')) {
                e.target.classList.add('dragging');
                
                // Original number in pool gets reduced opacity
                e.target.style.opacity = '0.3';
                
                // Set the drag image to be a clone at full opacity
                const dragImage = e.target.cloneNode(true);
                dragImage.style.opacity = '1';
                document.body.appendChild(dragImage);
                e.dataTransfer.setDragImage(dragImage, 20, 20);
                
                // Remove the clone after the drag image is set
                setTimeout(() => dragImage.remove(), 0);
            }
        });

        document.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('number')) {
                e.target.classList.remove('dragging');
                
                // If the number wasn't dropped in a slot, restore its opacity
                if (e.target.closest('.number-pool')) {
                    e.target.style.opacity = '1';
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

                // Find first empty slot
                const emptySlot = Array.from(quadrant.querySelectorAll('.slot'))
                    .find(slot => !slot.hasChildNodes());
                
                if (emptySlot) {
                    if (draggingNumber.closest('.number-pool')) {
                        this.placedNumbers++;
                    }
                    draggingNumber.style.opacity = '1';  // Reset opacity when dropped in slot
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

        // Add failure screen try again button listener
        const startOverButton = document.querySelector('.start-over');
        const newPuzzleButton = document.querySelector('.new-puzzle');

        startOverButton.addEventListener('click', () => {
            this.failureScreen.style.display = 'none';
            this.resetGame();  // Reset with same numbers
        });

        newPuzzleButton.addEventListener('click', () => {
            this.failureScreen.style.display = 'none';
            this.initializeGame();  // Start new game with new numbers
        });

        // Add solution screen try again button listener
        const solutionTryAgainButton = this.solutionScreen.querySelector('.try-again');
        solutionTryAgainButton.addEventListener('click', () => {
            this.solutionScreen.style.display = 'none';
            this.resetGame();  // Reset with same numbers
        });
    }

    processOperation(quadrant) {
        const slots = quadrant.querySelectorAll('.slot');
        if (!slots[0].hasChildNodes() || !slots[1].hasChildNodes()) return;

        const num1 = parseInt(slots[0].firstChild.textContent);
        const num2 = parseInt(slots[1].firstChild.textContent);
        const operation = quadrant.dataset.operation;

        // Check for invalid division cases
        if (operation === 'divide') {
            if (num2 === 0 || num1 % num2 !== 0) {
                // Add invalid class to trigger shake
                quadrant.classList.add('invalid');
                
                // Return numbers to pool
                const numberPool = document.querySelector('.number-pool');
                const numbers = [slots[0].firstChild, slots[1].firstChild];
                
                numbers.forEach(num => {
                    if (num) {
                        numberPool.appendChild(num);
                        this.placedNumbers--;
                    }
                });
                
                this.updateDraggableState();
                
                // Remove invalid class after animation
                setTimeout(() => {
                    quadrant.classList.remove('invalid');
                }, 400);
                
                return;
            }
        }

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

        // Check if game is won or lost
        if (this.moves === 0) {
            if (result === 0) {
                this.victoryScreen.querySelector('h1').textContent = 'Congratulations!';
                this.victoryScreen.style.display = 'flex';
            } else {
                this.failureScreen.style.display = 'flex';
            }
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
                
                // Try all possible operations (but skip if result is negative)
                const operations = [
                    { result: num1 + num2, symbol: '+' },
                    { result: num1 - num2 >= 0 ? num1 - num2 : null, symbol: '-' },
                    { result: num2 - num1 >= 0 ? num2 - num1 : null, symbol: '-' },
                    { result: num1 * num2, symbol: '×' },
                    { result: num1 % num2 === 0 ? num1 / num2 : null, symbol: '÷' },
                    { result: num2 % num1 === 0 ? num2 / num1 : null, symbol: '÷' }
                ];

                for (const op of operations) {
                    if (op.result === null || op.result < 0) continue;  // Skip negative results
                    
                    const step1 = {
                        nums: op.symbol === '-' && num2 > num1 ? [num2, num1] : [num1, num2],  // Swap numbers if needed for subtraction
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
                
                // Try all possible operations (but skip if result is negative)
                const operations = [
                    { result: num1 + num2, symbol: '+' },
                    { result: num1 - num2 >= 0 ? num1 - num2 : null, symbol: '-' },
                    { result: num2 - num1 >= 0 ? num2 - num1 : null, symbol: '-' },
                    { result: num1 * num2, symbol: '×' },
                    { result: num1 % num2 === 0 ? num1 / num2 : null, symbol: '÷' },
                    { result: num2 % num1 === 0 ? num2 / num1 : null, symbol: '÷' }
                ];

                for (const op of operations) {
                    if (op.result === null || op.result < 0) continue;  // Skip negative results
                    
                    const newStep = {
                        nums: op.symbol === '-' && num2 > num1 ? [num2, num1] : [num1, num2],  // Swap numbers if needed for subtraction
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