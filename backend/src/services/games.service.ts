
const StatusWaiting = 'waiting';
const StatusPlaying = 'playing';
const StatusDraw = 'draw';
const StatusWhiteWon = 'pawon';
const StatusBlackWon = 'pbwon';
const StatusWhiteForfeit = 'paff';
const StatusBlackForfeit = 'pbff';

type Game = {
	id: number;
	white: string;
	black: string;
	status: string;
	createdAt: Date;
};

export function create(white: string, black: string): Game {
	const game: Game = {
		id: 0, 
		white: white, 
		black: black, 
		status: StatusWaiting,
		createdAt: new Date()
	};

	// TODO insert into db and get id 
	return game;
}

export function get(id: number): Game | undefined {
	return undefined; // TODO
}
