import test from 'node:test';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { effectiveness, Round, TYPES, HISTORY_STORAGE_KEY, readRoundHistory, saveRoundHistory, summarizeRoundHistory } from '../game-logic.js';
import { TYPE_ICON_FILES, typeIconMarkup } from '../type-icon.js';

test('pure Water accepts its 2x weaknesses', () => {
  const chart=effectiveness(['water']);
  assert.equal(chart.electric,2); assert.equal(chart.grass,2);
  assert.deepEqual(TYPES.filter(t=>chart[t]===2).sort(),['electric','grass']);
});
test('Fire is a 2x move against Grass and is immediately marked correct', () => {
  const chart=effectiveness(['grass']);
  assert.equal(chart.fire,2);
  const round=new Round(['grass']);
  assert.ok(round.answers.includes('fire'));
  const result=round.choose('fire');
  assert.equal(result.status,'correct');
  assert.ok(result.foundTypes.includes('fire'));
  assert.equal(result.attemptsRemaining,3);
});
test('player wins after clicking every 2x or 4x weakness one by one', () => {
  const round=new Round(['grass']);
  for(const type of ['fire','ice','poison','flying']) assert.equal(round.choose(type).status,'correct');
  assert.equal(round.choose('bug').status,'won');
  assert.equal(round.attemptsRemaining,3);
});
test('Water/Ground Grass 4x is accepted as a correct answer', () => {
  const chart=effectiveness(['water','ground']);
  assert.equal(chart.grass,4);
  assert.equal(chart.ice,1);
  const round=new Round(['water','ground']);
  assert.ok(round.answers.includes('grass'));
  assert.equal(round.choose('grass').status,'won');
});
test('immunities and resistances multiply correctly', () => {
  assert.equal(effectiveness(['ground']).electric,0);
  assert.equal(effectiveness(['normal','ghost']).ghost,0);
  assert.equal(effectiveness(['water']).fire,0.5);
  assert.equal(effectiveness(['water','dragon']).fire,0.25);
});
test('misses use one of three tries, duplicates do not, and hints progress', () => {
  const round=new Round(['water']);
  assert.deepEqual(round.revealedTypes,[]);
  let result=round.choose('fire');
  assert.equal(result.status,'incorrect'); assert.equal(result.attemptsRemaining,2);
  assert.deepEqual(result.revealedTypes,['water']);
  assert.equal(round.choose('fire').status,'ignored');
  result=round.choose('normal');
  assert.equal(result.status,'incorrect'); assert.equal(result.attemptsRemaining,1);
  assert.deepEqual(result.revealedTypes,['water']);
  result=round.choose('fighting');
  assert.equal(result.status,'lost'); assert.equal(result.attemptsRemaining,0);
  assert.deepEqual(result.revealedTypes,['water']);
  assert.equal(round.choose('electric').status,'ended');
});
test('correct and wrong choices can be mixed until all weaknesses are found', () => {
  const round=new Round(['water']);
  assert.equal(round.choose('electric').status,'correct');
  assert.equal(round.choose('fire').status,'incorrect');
  assert.equal(round.choose('grass').status,'won');
  assert.equal(round.attemptsRemaining,2);
});
test('No 2x or 4x action is ignored while an accepted weakness exists', () => {
  const round=new Round(['water','ground']);
  assert.deepEqual(round.answers,['grass']);
  assert.equal(round.chooseNone().status,'ignored');
  assert.equal(round.choose('grass').status,'won');
});
test('bundled Pokédex contains all supported valid species', () => {
  const species=JSON.parse(readFileSync(new URL('../pokemon.json',import.meta.url),'utf8'));
  assert.equal(species.length,1025);
  assert.deepEqual(species.map(p=>p.id),Array.from({length:1025},(_,i)=>i+1));
  assert.ok(species.every(p=>p.name&&p.types.length>=1&&p.types.length<=2&&p.types.every(t=>TYPES.includes(t))));
  assert.deepEqual(species.find(p=>p.id===25).types,['electric']);
  assert.deepEqual(species.find(p=>p.id===194).types,['water','ground']);
});
test('all 18 locally bundled type icons map one-to-one and render accessibly', () => {
  assert.deepEqual(Object.keys(TYPE_ICON_FILES).sort(), [...TYPES].sort());
  const sources = TYPES.map(type => typeIconMarkup(type, { size: 'normal' }));
  const expectedUrls = TYPES.map(type => new URL('../assets/type-icons/' + type + '.svg', import.meta.url).href);
  const svgSources = [];
  assert.equal(new Set(expectedUrls).size, 18);
  assert.equal(new Set(sources).size, 18);
  for (const [index, type] of TYPES.entries()) {
    const svg = readFileSync(new URL('../assets/type-icons/' + type + '.svg', import.meta.url), 'utf8');
    assert.match(svg, /<svg[^>]+viewBox="0 0 30 30"/, type);
    assert.match(svg, /<(path|polygon|circle|ellipse|rect)\b/, type);
    svgSources.push(svg);
    assert.ok(sources[index].includes(expectedUrls[index]), type + ' uses its own local icon');
    assert.match(sources[index], /aria-hidden="true"/);
    assert.doesNotMatch(sources[index], /🔥|💧|⚡|🍃|🥊|👻|🐉|✨/);
  }
  assert.equal(new Set(svgSources).size, 18, 'every type file contains a distinct SVG');
  const pagesAsset = new URL('./assets/type-icons/fire.svg', new URL('https://example.test/type-battle/type-icon.js'));
  assert.equal(pagesAsset.pathname, '/type-battle/assets/type-icons/fire.svg');
  const accessible = typeIconMarkup('electric', { decorative: false });
  assert.match(accessible, /role="img" aria-label="Electric type"/);
  const unknown = typeIconMarkup('mystery', { decorative: false });
  assert.match(unknown, /role="img" aria-label="Mystery type"/);
  assert.match(unknown, /is-fallback/);
  assert.match(unknown, />\?<\/span>/);
  assert.doesNotMatch(unknown, /assets\/type-icons/);
});

test('guess feedback and detailed results sit in the Pokémon card below its image and name', () => {
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const battle=html.slice(html.indexOf('<section id="battlePanel">'),html.indexOf('</section>',html.indexOf('<section id="battlePanel">')));
  assert.ok(battle.indexOf('id="sprite"') < battle.indexOf('id="name"'));
  assert.ok(battle.indexOf('id="name"') < battle.indexOf('id="feedback"'));
  assert.ok(battle.indexOf('id="feedback"') < battle.indexOf('id="result"'));
  assert.match(html, /\.type-choice-icon\{display:grid;place-items:center\}/);
  assert.doesNotMatch(html, /\.type-choice-icon\{[^}]*border-radius:50%/);
  assert.match(html, /target&&\(ended\|\|attempts<3\)\?target\.types\.slice\(0,ended\|\|attempts===1\?target\.types\.length:1\)/);
  assert.match(html, /\.result-summary\{display:flex/);
  assert.match(html, /answers\.filter\(t=>!round\.foundTypes\.includes\(t\)\)\.map\(guessBadge\)/);
  assert.match(html, /id="random" class="primary battle-random"/);
  assert.doesNotMatch(html, /result-new-round/);
  assert.ok(html.includes('.guess-review .guess-missed{display:flex;flex-direction:column'));
  assert.ok(html.includes('.guess-badge .type-icon--small{padding:0;border-radius:0;background:transparent;box-shadow:none}'));
  assert.doesNotMatch(html, /choice-state|guess-right/);
  assert.ok(html.includes('.history-pokemon{width:30px;height:30px'));
  assert.match(html, /dateStyle:'medium',timeStyle:'short'/);
  assert.ok(html.includes('.guess-review .guess-missed .types{display:grid'));
});

test('Nunito and Lilita One are centralized and applied to UI/display text', () => {
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.match(html, /fonts\.googleapis\.com\/css2\?family=Lilita\+One&family=Nunito/);
  assert.match(html, /--font-ui:\"Nunito\"/);
  assert.match(html, /--font-display:\"Lilita One\"/);
  assert.match(html, /body\{[^}]*font-family:var\(--font-ui\)/);
  assert.match(html, /h1\{font-family:var\(--font-display\)/);
  assert.match(html, /\.brand>span:last-child\{font-family:var\(--font-display\)/);
  assert.match(html, /--size-h1:clamp\(/);
});

test('embedded browser app script parses before deployment', () => {
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const start=html.indexOf('<script type="module">'); assert.notEqual(start,-1);
  const bodyStart=html.indexOf('>',start)+1,bodyEnd=html.indexOf('</script>',bodyStart); assert.notEqual(bodyEnd,-1);
  let source=html.slice(bodyStart,bodyEnd);
  source=source.replace(/^import .*;\s*/gm,'').replaceAll('import.meta.url',"'https://example.test/type-battle/'");
  assert.doesNotThrow(()=>new Function(source));
});

test('browser history stores recent rounds and summarizes wins and losses', () => {
  const values=new Map(); const storage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value)};
  assert.deepEqual(readRoundHistory(storage),[]);
  const win={pokemonName:'pikachu',outcome:'win',missesUsed:1,correctTypes:['ground'],missedTypes:['fire']};
  const loss={pokemonName:'bulbasaur',outcome:'loss',missesUsed:3,correctTypes:['fire'],missedTypes:['normal','ice','bug']};
  saveRoundHistory(storage,win); const saved=saveRoundHistory(storage,loss);
  assert.equal(values.has(HISTORY_STORAGE_KEY),true);
  assert.deepEqual(readRoundHistory(storage),[loss,win]);
  assert.deepEqual(summarizeRoundHistory(saved),{battles:2,wins:1,losses:1});
});
test('history storage safely handles browser storage failures', () => {
  const storage={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}};
  assert.deepEqual(readRoundHistory(storage),[]);
  assert.deepEqual(saveRoundHistory(storage,{pokemonName:'pikachu',outcome:'win',missesUsed:0}),[]);
});
