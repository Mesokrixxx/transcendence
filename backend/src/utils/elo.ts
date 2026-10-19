export function getUpdatedELOs(
  whiteELO: number,
  blackELO: number,
  result: 1 | 0.5 | -1,
  whiteK: number,
  blackK: number,
): [number, number] {
  const whiteWinProbability =
    1 / (1 + Math.pow(10, (blackELO - whiteELO) / 400));
  const blackWinProbability = 1 - whiteWinProbability;

  const whiteResult = result > 0 ? result : 0;
  const blackResult = result < 0 ? 1 : result === 0.5 ? 0.5 : 0;
  const whiteNewELO = Math.round(
    whiteELO + whiteK * (whiteResult - whiteWinProbability),
  );
  const blackNewElo = Math.round(
    blackELO + blackK * (blackResult - blackWinProbability),
  );

  return [whiteNewELO, blackNewElo];
}

export function getKFactor(maxELO: number, gamesPlayed: number) {
  if (gamesPlayed < 30) return 40;
  if (maxELO < 2400) return 20;
  return 10;
}
