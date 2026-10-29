import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_ADJUSTMENTS,
  FILTER_PRESETS,
  HistoryManager,
  buildCssFilterString,
} from './editorLogic';

test('HistoryManager manages undo and redo correctly', () => {
  const history = new HistoryManager<number>(1);
  assert.equal(history.state, 1);
  assert.equal(history.canUndo, false);
  assert.equal(history.canRedo, false);

  history.push(2);
  assert.equal(history.state, 2);
  assert.equal(history.canUndo, true);

  history.push(3);
  assert.equal(history.state, 3);

  const undone = history.undo();
  assert.equal(undone, 2);
  assert.equal(history.state, 2);
  assert.equal(history.canRedo, true);

  const redone = history.redo();
  assert.equal(redone, 3);
  assert.equal(history.state, 3);
  assert.equal(history.canRedo, false);
});

test('buildCssFilterString generates correct CSS filter rules', () => {
  const filterStr = buildCssFilterString(
    {
      ...DEFAULT_ADJUSTMENTS,
      brightness: 20,
      contrast: -10,
      saturation: 30,
    },
    'none',
    100
  );

  assert.ok(filterStr.includes('brightness(1.20)'));
  assert.ok(filterStr.includes('contrast(0.90)'));
  assert.ok(filterStr.includes('saturate(1.45)'));
});

test('FILTER_PRESETS contains rich categories with unique IDs', () => {
  assert.ok(FILTER_PRESETS.length >= 10);
  const ids = new Set(FILTER_PRESETS.map(p => p.id));
  assert.equal(ids.size, FILTER_PRESETS.length);

  const categories = new Set(FILTER_PRESETS.map(p => p.category));
  assert.ok(categories.has('natural'));
  assert.ok(categories.has('cinematic'));
  assert.ok(categories.has('vintage'));
  assert.ok(categories.has('bw'));
});
