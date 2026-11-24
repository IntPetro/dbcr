(function (root) {
  'use strict';
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  function geography(from, to) {
    const rad = n => n * Math.PI / 180;
    const a = rad(from.lat), b = rad(to.lat), delta = rad(to.lon - from.lon);
    const h = Math.sin((b - a) / 2) ** 2 + Math.cos(a) * Math.cos(b) * Math.sin(delta / 2) ** 2;
    const distance = Math.round(6371 * 2 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, h)))));
    const bearing = (Math.atan2(Math.sin(delta) * Math.cos(b), Math.cos(a) * Math.sin(b) - Math.sin(a) * Math.cos(b) * Math.cos(delta)) * 180 / Math.PI + 360) % 360;
    const direction = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(bearing / 45) % 8];
    return { distance, direction };
  }
  function typingMetrics(input, target, elapsedMs, complete = false) {
    let correct = 0;
    for (let i = 0; i < input.length; i++) if (input[i] === target[i]) correct++;
    const total = complete ? Math.max(input.length, target.length) : input.length;
    return { wpm: elapsedMs > 0 ? Math.round((correct / 5) / (elapsedMs / 60000)) : 0, accuracy: total ? Math.round(correct / total * 100) : 100 };
  }
  function personality(answers) {
    const scores = [0, 0, 0, 0];
    answers.forEach(answer => { if (Number.isInteger(answer) && answer >= 0 && answer < 4) scores[answer]++; });
    const max = Math.max(...scores);
    return { scores, winners: scores.map((score, i) => score === max ? i : -1).filter(i => i >= 0) };
  }
  function shuffled(values) {
    const result = [...values];
    for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
    return result;
  }
  function sudokuCandidates(board, index) {
    const row = Math.floor(index / 9), col = index % 9, used = new Set();
    for (let i = 0; i < 9; i++) {
      used.add(board[row * 9 + i]); used.add(board[i * 9 + col]);
      used.add(board[(Math.floor(row / 3) * 3 + Math.floor(i / 3)) * 9 + Math.floor(col / 3) * 3 + i % 3]);
    }
    return [1,2,3,4,5,6,7,8,9].filter(n => !used.has(n));
  }
  function sudokuSolutions(input, limit = 2) {
    const board = [...input]; let count = 0;
    function search() {
      let cell = -1, choices;
      for (let i = 0; i < 81; i++) {
        if (board[i]) continue;
        const candidates = sudokuCandidates(board, i);
        if (!candidates.length) return;
        if (!choices || candidates.length < choices.length) { cell = i; choices = candidates; }
        if (choices.length === 1) break;
      }
      if (cell === -1) { count++; return; }
      for (const value of choices) {
        board[cell] = value; search(); board[cell] = 0;
        if (count >= limit) return;
      }
    }
    // Reject conflicting givens before attempting completion.
    for (let i = 0; i < 81; i++) if (board[i]) {
      const value = board[i]; board[i] = 0;
      const valid = sudokuCandidates(board, i).includes(value); board[i] = value;
      if (!valid) return 0;
    }
    search(); return count;
  }
  function generateSudoku() {
    const groups = [0,1,2];
    const order = () => shuffled(groups).flatMap(group => shuffled(groups).map(i => group * 3 + i));
    const rows = order(), cols = order(), digits = shuffled([1,2,3,4,5,6,7,8,9]);
    const solution = rows.flatMap(row => cols.map(col => digits[(row * 3 + Math.floor(row / 3) + col) % 9]));
    const puzzle = [...solution]; let givens = 81;
    for (const index of shuffled(Array.from({length:81}, (_,i) => i))) {
      const previous = puzzle[index]; puzzle[index] = 0;
      if (sudokuSolutions(puzzle) !== 1) puzzle[index] = previous;
      else givens--;
      if (givens <= 36) break;
    }
    return { puzzle, solution };
  }
  const api = { normalize, geography, typingMetrics, personality, generateSudoku, sudokuSolutions, sudokuCandidates };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DBCR_CORE = api;
})(typeof window !== 'undefined' ? window : globalThis);
