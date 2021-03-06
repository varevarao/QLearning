const gamma = 0.9;
const alpha = 0.7;
const epsilon = 0.2;
const MAX_TRAINING_RUNS = 100000;
const PRINT_DEBUG = false;

const terrain = "S_T__R_TR__TT_#";
const QTable = [
	[0, 0, 0],
	[0, 0, 0],
	[0, 0, 0],
	[0, 0, 0],
	[0, 0, 0]
];

const STATES_IDX = ['S', '_', 'T', 'R', '#'];
const STATES = {
	'S': 0,
	'_': 1,
	'T': 2,
	'R': 3,
	'#': 4
};

const ACTIONS_IDX = ['L', 'R', 'J'];
const ACTIONS = {
	'L': 0,
	'R': 1,
	'J': 2
};

const payoutAvg = [0, 0, 0];

let actionCount = [0, 0, 0];
// Opt to prevent the same action being picked over and over again at init
let hasAvg = false;

/**
	Calculate the new value for the QTable given state, action, and reward
 	Sample input = '_', 'L', -1
*/
function newQ(state, action, reward, nextState) {
	return QTable[STATES[state]][ACTIONS[action]] + alpha * (reward + gamma * (Math.max(...QTable[STATES[nextState]])) - QTable[STATES[state]][ACTIONS[action]]);
}

function getNextAction() {
	// No payouts yet, choose randomly
	if(!hasAvg) {
		return Math.floor(Math.random() * payoutAvg.length);
	}

	// Probability of choosing a random action
	let rando = Math.random();
	if(rando > epsilon) {
		// Choose the option with highest average payout
		return payoutAvg.reduce((max, avg, i, arr) => avg > arr[max] ? i : max, 0);
	} else {
		return Math.floor(Math.random() * payoutAvg.length);
	}
}

function getPosDelta(pos, action) {
	switch(action) {
		case 'L': return -1;
		case 'R': return 1;
		// Jumps are awesome!
		case 'J': return 2;
	}

	return 0;
}

function getReward(state, action) {
	// Blank tiles are not rewarding
	let stateReward = 0;
	switch(state) {
		// Trees give us rewards
		case 'T': stateReward = 5; break;
		// A rock means death
		case 'R': stateReward = -100; break;
		// Finish line!
		case '#': stateReward = 100; break;
	}

	// Discourage left movement
	if(action === 'L') return stateReward - 1;
	else return stateReward + 1;
}

function dumpData() {
	console.log('\nQTable');
	for(let row of QTable) {
		let rowStr = '';
		for(let col of row) {
			rowStr += parseFloat(col).toFixed(2) + '\t';
		}
		console.log(rowStr);
	}

	console.log('\nPayouts: ', payoutAvg);
}

function showPosition(terrainPos) {
	console.log(' '.repeat(terrainPos) + '*');
	console.log(terrain);
}

// Start the training
function startTraining() {
	let terrainPos = 0;
	let iterations = 0;

	while(true) {
		// Print current state
		if(PRINT_DEBUG) showPosition(terrainPos);

		// Current state
		let currentState = terrain[terrainPos];
		
		// Next action
		let action = '';
		let delta = 0;

		// Choose a legal action
		do {
			action = ACTIONS_IDX[getNextAction()];
			delta = getPosDelta(terrainPos, action);
		} while((terrainPos + delta) < 0 || (terrainPos + delta) >= terrain.length);

		if(PRINT_DEBUG) console.log('Attempting action ' + action);

		let nextState = terrain[terrainPos + delta];
		let reward = getReward(nextState, action);

		// Update the QTable
		QTable[STATES[currentState]][ACTIONS[action]] = newQ(currentState, action, reward, nextState);

		// New average = ((total count * current average) + new payout) / (total count + 1)
		payoutAvg[ACTIONS[action]] = (payoutAvg[ACTIONS[action]] * actionCount[ACTIONS[action]] + reward) / (actionCount[ACTIONS[action]] + 1);
		actionCount[ACTIONS[action]]++;

		if(!hasAvg && payoutAvg[ACTIONS[action]] > 0) {
			hasAvg = true;
		}

		// We've now moved ahead
		terrainPos += delta;

		// Print the QTable and payout table on every 10 iterations
		if(PRINT_DEBUG && ++iterations % 10 === 0) {
			console.log('Run: ' + trainingRun + ' Iteration: ' + iterations);
		 	dumpData();
		}

		if(nextState === 'R') {
			// Dead
			if(PRINT_DEBUG) console.log('DEAD!');
			return -1;
		} else if(nextState === '#') {
			// Finished
			if(PRINT_DEBUG) console.log('FINISH!');
			return 1;
		}
	}

	return 0;
}

let trainingRun = 0;
let result = -1;
let deaths = 0;
let finishes = 0;

do {
	result = startTraining();

	if(result < 0) {
		deaths++;
	} else if(result > 0) {
		finishes++;
	}

	trainingRun++;
} while(trainingRun < MAX_TRAINING_RUNS);

console.log('\nTraining Complete.');
dumpData();
console.log('\nDeath: ' + (100*deaths / MAX_TRAINING_RUNS) + '% Finishes: ' + (100*finishes / MAX_TRAINING_RUNS) + '%');