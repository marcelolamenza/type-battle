// Modern main-series type chart (Generation VI onward).
export const TYPES = ['normal','fire','water','electric','grass','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy'];
export const COLORS = {normal:'#929aa5',fire:'#ee7044',water:'#438bd6',electric:'#e9bb30',grass:'#58a95d',ice:'#58bfc0',fighting:'#bb4b56',poison:'#a65bb0',ground:'#c49a48',flying:'#829be2',psychic:'#e45d86',bug:'#92a83b',rock:'#ad914e',ghost:'#715e9c',dragon:'#655bd4',dark:'#66564a',steel:'#8995a2',fairy:'#d77ea2'};
const CHART = {
normal:{w:['rock','steel'],i:['ghost']},fire:{w:['fire','water','rock','dragon'],s:['grass','ice','bug','steel']},water:{w:['water','grass','dragon'],s:['fire','ground','rock']},electric:{w:['electric','grass','dragon'],s:['water','flying'],i:['ground']},grass:{w:['fire','grass','poison','flying','bug','dragon','steel'],s:['water','ground','rock']},ice:{w:['fire','water','ice','steel'],s:['grass','ground','flying','dragon']},fighting:{w:['poison','flying','psychic','bug','fairy'],s:['normal','ice','rock','dark','steel'],i:['ghost']},poison:{w:['poison','ground','rock','ghost'],s:['grass','fairy'],i:['steel']},ground:{w:['grass','bug'],s:['fire','electric','poison','rock','steel'],i:['flying']},flying:{w:['electric','rock','steel'],s:['grass','fighting','bug']},psychic:{w:['psychic','steel'],s:['fighting','poison'],i:['dark']},bug:{w:['fire','fighting','poison','flying','ghost','steel','fairy'],s:['grass','psychic','dark']},rock:{w:['fighting','ground','steel'],s:['fire','ice','flying','bug']},ghost:{w:['dark'],s:['psychic','ghost'],i:['normal']},dragon:{w:['steel'],s:['dragon'],i:['fairy']},dark:{w:['fighting','dark','fairy'],s:['psychic','ghost']},steel:{w:['fire','water','electric','steel'],s:['ice','rock','fairy']},fairy:{w:['fire','poison','steel'],s:['fighting','dragon','dark']}
};
function multiplier(attack, defense) { const row = CHART[attack]; return (row.i || []).includes(defense) ? 0 : (row.s || []).includes(defense) ? 2 : (row.w || []).includes(defense) ? 0.5 : 1; }
export function effectiveness(defendingTypes) {
  if (!Array.isArray(defendingTypes) || defendingTypes.length < 1 || defendingTypes.length > 2 || defendingTypes.some(t => !TYPES.includes(t))) throw new TypeError('Expected one or two valid defensive types');
  return Object.fromEntries(TYPES.map(attack => [attack, defendingTypes.reduce((value, defense) => value * multiplier(attack, defense), 1)]));
}
export class Round {
  constructor(defendingTypes) {
    this.defendingTypes = [...defendingTypes];
    this.answers = TYPES.filter(type => effectiveness(this.defendingTypes)[type] >= 2);
    this.foundTypes = [];
    this.missedTypes = [];
    this.attemptsRemaining = 3;
    this.status = 'active';
  }
  get revealedTypes() {
    if (this.attemptsRemaining === 2) return this.defendingTypes.slice(0, 1);
    if (this.attemptsRemaining === 1 || this.status !== 'active') return [...this.defendingTypes];
    return [];
  }
  snapshot(status) {
    return {status, attemptsRemaining:this.attemptsRemaining, foundTypes:[...this.foundTypes], missedTypes:[...this.missedTypes], revealedTypes:this.revealedTypes};
  }
  choose(attackType) {
    if (this.status !== 'active') return this.snapshot('ended');
    if (!TYPES.includes(attackType) || this.foundTypes.includes(attackType) || this.missedTypes.includes(attackType)) return this.snapshot('ignored');
    if (this.answers.includes(attackType)) {
      this.foundTypes.push(attackType);
      if (this.foundTypes.length === this.answers.length) {
        this.status = 'won';
        return this.snapshot('won');
      }
      return this.snapshot('correct');
    }
    this.missedTypes.push(attackType);
    this.attemptsRemaining--;
    if (this.attemptsRemaining === 0) {
      this.status = 'lost';
      return this.snapshot('lost');
    }
    return this.snapshot('incorrect');
  }
  chooseNone() {
    if (this.status !== 'active') return this.snapshot('ended');
    if (this.answers.length !== 0) return this.snapshot('ignored');
    this.status = 'won';
    return this.snapshot('won');
  }
}
