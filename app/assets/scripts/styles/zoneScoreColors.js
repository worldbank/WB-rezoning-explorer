import chroma from "chroma-js";

const chromaScale = chroma.scale(['#c2ffe2', '#000057']).domain([0.0, 1.0]);

const MAX_SCORE = 1;

export default function zoneScoreColor (score, minScore = 0, maxScore = MAX_SCORE) {
  if (minScore >= maxScore) {
    minScore = 0;
    maxScore = MAX_SCORE;
  }
  return chromaScale( (score - minScore) / (maxScore - minScore) ).toString();
}

export const COLOR_SCALE = [...Array(10).keys()].map( (i) => chromaScale( i * 1.0 / 9.0 ).toString() );
