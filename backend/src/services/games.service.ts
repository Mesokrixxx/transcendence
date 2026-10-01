
const StatusWaiting = 'waiting';
const StatusPlaying = 'playing';
const StatusDraw = 'draw';
const StatusPlayerAWon = 'pawon';
const StatusPlayerBWon = 'pbwon';
const StatusPlayerAForfeit = 'paff';
const StatusPlayerBForfeit = 'pbff';

type Game = {
	id: number;
	playerA: string;
	playerB: string;
	status: string;
	createdAt: Date;
};

export function create(playerA: string, playerB: string): Game {
	const game = {
		id: 0, 
		playerA: playerA, 
		playerB: playerB, 
		status: StatusWaiting,
		createdAt: new Date()
	};

	// TODO insert into db and get id 
	return game;
}

export function get(id: number): Game | undefined {
	return undefined; // TODO
}
