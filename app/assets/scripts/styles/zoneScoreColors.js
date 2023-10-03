import chroma from 'chroma-js';

const chromaScale = chroma.scale(['#c2ffe2', '#000057']).domain([0.0, 1.0]);

const MAX_SCORE = 1;

// Add a power scaling function to emphasize color variation for higher values
const POWER_SCALING_FACTOR = 2;

export default function zoneScoreColor(score, minScore = 0, maxScore = MAX_SCORE) {
  if (minScore >= maxScore) {
    minScore = 0;
    maxScore = MAX_SCORE;
  }

  const normalizedScore = (score - minScore) / (maxScore - minScore);
  const poweredScore = Math.pow(normalizedScore, POWER_SCALING_FACTOR);

  return chromaScale(poweredScore).toString();
}

export const COLOR_SCALE = [...Array(10).keys()].map((i) => chromaScale(Math.pow(i / 9.0, POWER_SCALING_FACTOR)).toString());
