class MathGame {
    constructor() {
        this.numbers = [];
        this.placedNumbers = 0;  // Add counter for placed numbers
        this.victoryScreen = document.querySelector('.victory-screen');
        this.initialNumbers = []; // Store initial numbers
        this.moves = 3;  // Start with 3 moves
        this.movesDisplay = document.querySelector('.moves-counter span');
        this.minMoves = 3;  // Require exactly 3 moves
        this.solutionScreen = document.querySelector('.solution-screen');  // Make sure this exists
        this.failureScreen = document.querySelector('.failure-screen');
        this.resetButton = document.querySelector('.reset-button');
        this.resetButton.disabled = true;  // Start disabled
        this.selectedQuadrant = null;
        this.readyQuadrant = null;  // Add this to track ready quadrant
        this.selectedNumbers = [];  // Track selected numbers
        this.initializeGame();
        this.setupEventListeners();
    }

    generatePuzzle() {
        const generateBackwards = () => {
            let numbers = [0];  // Start with target number
            const usedNumbers = new Set();  // Track used numbers to prevent duplicates
            
            // Generate 3 operations in reverse (not 4)
            for (let i = 0; i < 3; i++) {  // Change from 4 to 3
                const lastNum = numbers[numbers.length - 1];
                numbers.pop();
                
                // Pick random operation and numbers that would result in lastNum
                const ops = [
                    // Addition: a + b = lastNum
                    () => {
                        let attempts = 0;
                        while (attempts < 20) {
                            const a = Math.floor(Math.random() * 5) + 16;  // 16-20
                            const b = Math.floor(Math.random() * 5) + 16;  // 16-20
                            if (a % b === 0 || b % a === 0) continue;  // Skip if they divide evenly
                            if (usedNumbers.has(a)) {
                                attempts++;
                                continue;
                            }
                            const c = lastNum - a;
                            if (c >= 1 && c <= 20 && !usedNumbers.has(c)) {
                                usedNumbers.add(a);
                                usedNumbers.add(c);
                                return [a, c];
                            }
                            attempts++;
                        }
                        return null;
                    },
                    // Subtraction: a - b = lastNum
                    () => {
                        let attempts = 0;
                        while (attempts < 20) {
                            const b = Math.floor(Math.random() * 5) + 16;  // 16-20
                            const a = lastNum + b;
                            if (a >= 1 && a <= 20 && !usedNumbers.has(a)) {
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
                                const a = Math.floor(Math.random() * 5) + 16;  // 16-20
                                const b = Math.floor(Math.random() * 5) + 16;  // 16-20
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
                            const b = Math.floor(Math.random() * 5) + 16;  // 16-20
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
                
                // Add the new numbers
                if (validNumbers) {
                    numbers.push(...validNumbers);
                    usedNumbers.add(validNumbers[0]);
                    usedNumbers.add(validNumbers[1]);
                }
            }
            
            const result = Array.from(usedNumbers);
            console.log('Final numbers:', result);
            return result;
        };

        let puzzle = null;
        let attempts = 0;
        while (!puzzle && attempts < 100) {
            const candidate = generateBackwards();
            if (candidate && candidate.length === 4) {  // Ensure exactly 4 numbers
                const solution = this.findSolution(candidate);
                if (solution) {
                    puzzle = candidate;
                    console.log('Found valid puzzle:', puzzle);
                }
            }
            attempts++;
        }

        if (!puzzle) {
            console.error('Failed to generate valid puzzle');
            return [16, 17, 18, 19];  // Return exactly 4 numbers
        }

        return puzzle.sort(() => Math.random() - 0.5);
    }

    initializeGame() {
        this.selectedNumbers = [];
        const puzzleNumbers = this.generatePuzzle();
        this.initialNumbers = puzzleNumbers;
        this.numbers = [...this.initialNumbers];
        this.moves = 3;  // Reset to 3 moves
        this.minMoves = 3;
        this.renderNumbers();
        this.updateMovesDisplay();
        this.resetButton.disabled = true;  // Reset to disabled on new game
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
        const movesUsed = 4 - this.moves;  // Convert remaining moves to used moves
        
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
                e.target.style.opacity = '0.5';
                
                // Set the drag image to be a clone
                const dragImage = e.target.cloneNode(true);
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
                    draggingNumber.style.opacity = '1';
                    draggingNumber.classList.add('number-selected');
                    emptySlot.appendChild(draggingNumber);
                    this.updateDraggableState();
                    this.updateQuadrantState(quadrant);
                }
            });

            // Add quadrant selection
            quadrant.addEventListener('click', () => {
                if (this.placedNumbers >= 2) {
                    this.processOperation(quadrant);
                    return;
                }

                // Toggle selection
                this.selectQuadrant(quadrant);
            });
        });

        // Get number pool reference once
        const numberPool = document.querySelector('.number-pool');

        // Setup number pool for receiving numbers back
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

                // Get all existing numbers in the pool
                const numbers = Array.from(numberPool.children);
                
                // If pool is empty, just append
                if (numbers.length === 0) {
                    numberPool.appendChild(draggingNumber);
                } else {
                    // Find the nearest position based on mouse coordinates
                    const mouseX = e.clientX;
                    let nearestNumber = numbers[0];
                    let minDistance = Infinity;
                    
                    numbers.forEach(number => {
                        const rect = number.getBoundingClientRect();
                        const distance = Math.abs(mouseX - (rect.left + rect.width / 2));
                        if (distance < minDistance) {
                            minDistance = distance;
                            nearestNumber = number;
                        }
                    });
                    
                    // Insert before or after the nearest number based on mouse position
                    const rect = nearestNumber.getBoundingClientRect();
                    if (mouseX < rect.left + rect.width / 2) {
                        numberPool.insertBefore(draggingNumber, nearestNumber);
                    } else {
                        numberPool.insertBefore(draggingNumber, nearestNumber.nextSibling);
                    }
                }

                this.updateDraggableState();
                if (quadrant) {
                    this.updateQuadrantState(quadrant);
                }

                draggingNumber.classList.remove('number-selected');
            }
        });

        // Update victory screen button listeners
        const playAgainButtons = document.querySelectorAll('.play-again');
        playAgainButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.victoryScreen.style.display = 'none';
                this.solutionScreen.style.display = 'none';
                this.initializeGame();
            });
        });

        // Add reset button listener
        const resetButton = document.querySelector('.reset-button');
        resetButton.addEventListener('click', () => {
            this.resetGame();
        });

        // Add give up button listener
        const giveUpButton = document.querySelector('.give-up-button');
        giveUpButton.addEventListener('click', () => {
            this.showSolution();
        });

        // Add failure screen buttons
        const startOverButton = document.querySelector('.start-over');
        startOverButton.addEventListener('click', () => {
            this.failureScreen.style.display = 'none';
            this.resetGame();
        });

        const newPuzzleButton = document.querySelector('.new-puzzle');
        newPuzzleButton.addEventListener('click', () => {
            this.failureScreen.style.display = 'none';
            this.initializeGame();
        });

        // Add solution screen try again button
        const tryAgainButton = document.querySelector('.try-again');
        tryAgainButton.addEventListener('click', () => {
            this.solutionScreen.style.display = 'none';
            this.resetGame();
        });

        // Add number selection handler
        numberPool.addEventListener('click', (e) => {
            const number = e.target.closest('.number');
            if (!number) return;

            // If quadrant is selected, use existing click-to-place behavior
            if (this.selectedQuadrant) {
                const emptySlot = Array.from(this.selectedQuadrant.querySelectorAll('.slot'))
                    .find(slot => !slot.hasChildNodes());
                
                if (emptySlot) {
                    number.classList.add('number-selected');
                    emptySlot.appendChild(number);
                    this.placedNumbers++;
                    this.updateDraggableState();
                    this.updateQuadrantState(this.selectedQuadrant);
                }
                return;
            }

            // Handle number selection
            if (this.selectedNumbers.includes(number)) {
                // Deselect if already selected
                number.classList.remove('number-selected');
                this.selectedNumbers = this.selectedNumbers.filter(n => n !== number);
            } else if (this.selectedNumbers.length < 2) {
                // Select if we have room
                number.classList.add('number-selected');
                this.selectedNumbers.push(number);
            }
        });

        // Add operation click handler for selected numbers
        document.querySelectorAll('.quadrant').forEach(quadrant => {
            quadrant.addEventListener('click', () => {
                // If we have 2 selected numbers, place them in this quadrant
                if (this.selectedNumbers.length === 2) {
                    const slots = quadrant.querySelectorAll('.slot');
                    this.selectedNumbers.forEach((num, i) => {
                        num.classList.add('number-selected');
                        slots[i].appendChild(num);
                    });
                    this.selectedNumbers = [];
                    this.placedNumbers = 2;
                    this.updateDraggableState();
                    this.updateQuadrantState(quadrant);
                    return;
                }

                // ... existing quadrant click logic ...
            });
        });

        // Add keyboard listener for Return key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === 'Return') {
                if (this.readyQuadrant) {
                    this.processOperation(this.readyQuadrant);
                }
            }
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
                result = num1 - num2;
                break;
            case 'multiply':
                result = num1 * num2;
                break;
            case 'divide':
                if (num2 === 0 || num1 % num2 !== 0) {  // Keep only the division constraints
                    quadrant.classList.add('invalid');
                    // Return numbers to pool
                    return;
                }
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

        // After processing the operation, clear selection and update state
        this.clearQuadrantSelection();
        this.resetButton.disabled = false;
    }

    resetGame() {
        this.selectedNumbers.forEach(num => {
            num.classList.remove('number-selected');
        });
        this.selectedNumbers = [];
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
        this.resetButton.disabled = true;  // Disable after reset
    }

    updateQuadrantState(quadrant) {
        const slots = quadrant.querySelectorAll('.slot');
        const isFull = Array.from(slots).every(slot => slot.hasChildNodes());
        quadrant.classList.toggle('ready', isFull);
        
        // Update readyQuadrant reference
        if (isFull) {
            this.readyQuadrant = quadrant;
        } else if (this.readyQuadrant === quadrant) {
            this.readyQuadrant = null;
        }
    }

    isWrongLength(solution) {
        if (solution[solution.length - 1].result === 0) {
            return solution.length !== 3;  // Check for exactly 3 moves
        }
        
        // For partial solutions, just check it's not too quick
        const firstTwoResults = solution.slice(0, 2).map(step => step.result);
        if (firstTwoResults.includes(0)) return true;

        return false;
    }

    findSolution(numbers) {
        for (let i = 0; i < numbers.length; i++) {
            for (let j = i + 1; j < numbers.length; j++) {
                const num1 = numbers[i];
                const num2 = numbers[j];
                const remainingNums = numbers.filter((_, idx) => idx !== i && idx !== j);
                
                const operations = [
                    { result: num1 + num2, symbol: '+' },
                    { result: num1 - num2 >= 0 ? num1 - num2 : null, symbol: '-' },
                    { result: num2 - num1 >= 0 ? num2 - num1 : null, symbol: '-' },
                    { result: num1 * num2, symbol: '×' },
                    { result: num1 % num2 === 0 ? num1 / num2 : null, symbol: '÷' },
                    { result: num2 % num1 === 0 ? num2 / num1 : null, symbol: '÷' }
                ];

                for (const op of operations) {
                    if (op.result === null || op.result < 0) continue;
                    
                    const step1 = {
                        nums: op.symbol === '-' && num2 > num1 ? [num2, num1] : [num1, num2],
                        operation: op.symbol,
                        result: op.result
                    };

                    const numsAfterStep1 = [...remainingNums, op.result];
                    const solution = this.findNextSteps(numsAfterStep1, [step1]);
                    if (solution && !this.isWrongLength(solution)) return solution;
                }
            }
        }
        return null;
    }

    findNextSteps(numbers, steps) {
        if (numbers.includes(0)) {
            return steps.length === 3 ? steps : null;  // Check for exactly 3 moves
        }
        if (steps.length >= 3) return null;  // Limit to 3 moves

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
                    if (solution && !this.isWrongLength(solution)) return solution;
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

    selectQuadrant(quadrant) {
        // If this quadrant is already selected, unselect it
        if (this.selectedQuadrant === quadrant) {
            this.clearQuadrantSelection();
            return;
        }

        // Clear any previous selection
        this.clearQuadrantSelection();

        // Select the new quadrant
        this.selectedQuadrant = quadrant;
        quadrant.classList.add('selected');
        
        // Dim other quadrants
        document.querySelectorAll('.quadrant').forEach(q => {
            if (q !== quadrant) q.classList.add('dimmed');
        });
    }

    clearQuadrantSelection() {
        if (this.selectedQuadrant) {
            this.selectedQuadrant.classList.remove('selected');
            this.selectedQuadrant = null;
            document.querySelectorAll('.quadrant').forEach(q => {
                q.classList.remove('dimmed');
            });
        }
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new MathGame();
}); 