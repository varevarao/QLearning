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
	S: 0,
	_: 1,
	T: 2,
	R: 3,
	#: 4
};

const ACTIONS_IDX = ['L', 'R', 'J'];
const ACTIONS = {
	L: 0,
	R: 1,
	J: 2
};

const gamma = 0.9;
const alpha = 0.7;
const epsilon = 0.1;

const payoutAvg = [0, 0, 0];

let p = 0;
let actionCount = [0, 0, 0];

/**
	Calculate the new value for the QTable given state, action, and reward
 	Sample input = '_', 'L', -1
*/
function newQ(state, action, reward) {
	return QTable[STATES[state]][ACTIONS[action]] + alpha * (reward + gamma * (Math.max(...QTable[STATES[state]])) - QTable[STATES[state]][ACTIONS[action]]);
}

function getNextAction() {
	let rando = Math.random();
	if(rando > epsilon) {
		// Choose the option with highest average payout
		return payoutAvg.reduce((max, avg, i, arr) => x > arr[max] ? i : max, 0);
	} else {
		return Math.floor(Math.random() * payoutAvg.length);
	}
}

function getPosDelta(pos, action) {
	switch(action) {
		case 'L': return pos-1;
		case 'R': return pos+1;
		case 'J': return pos+2;
	}
}

function getReward(state, action) {
	let stateReward = 0;
	switch(state) {
		case 'T': stateReward = 5; break;
		case 'R': stateReward = -100; break;
		case '#': stateReward = 100; break;
	}

	if(action === 'L') return stateReward - 1;
	else return stateReward + 1;
}

// Start the training
function startTraining() {
	let terrainPos = 0;
	while(terrainPos < terrain.length) {
		// Current state
		let currentState = terrain[terrainPos];
		
		// Next action
		let action = '';

		// Choose a legal action
		do {
			action = ACTIONS_IDX[getNextAction()];
		} while(terrainPos === 0 && action === 'L');

		let nextState = getNextState(terrainPos, action);
		let reward = getReward(nextState, action);

		let actionPayout = payoutAvg[ACTIONS[action]] * actionCount[ACTIONS[action]] + 
	}
}