import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSliderChange } from '@angular/material/slider';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Cell } from '../common/classes/cell';
import { Preset } from '../common/classes/preset';
import { Rule } from '../common/classes/rule';

@Component({
  selector: 'app-random-cell',
  templateUrl: './random-cell.component.html',
  styleUrls: ['./random-cell.component.scss']
})
export class RandomCellComponent implements OnInit {

  presets: Preset[] = Preset.ListPresets();
  preset: Preset = this.presets[0];

  sortedCells: Cell[] = [];
  displayedCells: Cell[] = [];
  cellsShown: number = 0;

  headers: string[] = ["selected", "name", "type", "description"];
  ruleSource: MatTableDataSource<Rule> = new MatTableDataSource(this.preset.rules.filter(x => !x.hidden));
  ruleSelection = new SelectionModel<Rule>(true, []);
  private ruleSort : MatSort;
  @ViewChild('ruleSort') set rSort(ms: MatSort) {
    if (!this.ruleSort)
      this.ruleSort = ms;
    this.ruleSource.sort = this.ruleSort;
  }

  @ViewChild('drawer') drawer: MatDrawer;

  constructor() { }

  ngOnInit(): void {
    this.ruleMasterToggle();
  }

  randomize(element?: HTMLElement, resetSeed: boolean = true) {
    this.drawer.opened = false;
    
    if (resetSeed)
      this.preset.randomizer.seed = null;

    const rules = this.ruleSelection.selected.concat(Rule.ListRules().filter(x => x.hidden));
    this.preset.randomizer.injections = rules.filter(x => x.type === Rule.InjectionType());
    this.preset.randomizer.restrictions = rules.filter(x => x.type === Rule.RestrictionType());
    this.preset.randomizer.randomizeOrder();

    this.sortedCells = this.preset.randomizer.cells.filter(x => x.cellNumber).sort((a,b) => (a.cellNumber > b.cellNumber) ? 1 : ((b.cellNumber > a.cellNumber) ? -1 : 0));
    this.cellsShown = this.preset.randomizer.cellsShownInAdvance + 1;

    if (this.cellsShown < this.sortedCells.length) {
      this.displayedCells = this.sortedCells.slice(0, this.cellsShown);
      
      setTimeout(() => {
      this.drawer.opened = true;
      }, 1000); 
    }
    else {
      this.displayedCells = this.sortedCells;
    }

    if (element) {
      setTimeout(function (){
        element.scrollIntoView({behavior: 'smooth'});
      }, 350); 
    }
  }

  advanceRun(element) {
    this.displayedCells.push(this.sortedCells[this.cellsShown])
    this.cellsShown++;

    if (this.runHasEnded())
      this.drawer.opened = false;

    setTimeout(function (){
      element.scrollIntoView({behavior: 'smooth', block: 'end'});
    }, 100); 
  }

  runHasEnded() {
    return this.cellsShown >= this.sortedCells.length;
  }


  updateRunCellCount(event: MatSliderChange): void {
    this.preset.randomizer.cellsInRun = event.value;
  }

  updateCellsShownInAdvance(event: MatSliderChange): void {
    this.preset.randomizer.cellsShownInAdvance = event.value;
  }

  updateLevelPercent(event: MatSliderChange): void {
    this.preset.randomizer.sameLevelPercent = event.value;
  }

  updateOrbCellLevelPercent(event: MatSliderChange): void {
    this.preset.randomizer.sameLevelPercentOrbCells = event.value;
  }


  isAllRulesSelected(): boolean {
    const numSelected = this.ruleSelection.selected.filter(x => !x.mandatory).length;
    const numRows = this.ruleSource.data.filter(x => !x.mandatory).length;
    return numSelected === numRows;
  }

  isNoneSelected(): boolean {
    return this.ruleSelection.selected.filter(x => !x.mandatory).length === 0;
  }

  rowToggle(rule: Rule) {
    if (rule.mandatory)
      return;
      
    this.ruleSelection.toggle(rule);
  }

  ruleMasterToggle() {
    if (this.isAllRulesSelected()) {
      this.ruleSelection.selected.forEach(x => {
        if (!x.mandatory)
          this.ruleSelection.deselect(x);
      });
      return;
    }
    this.ruleSelection.select(...this.ruleSource.data);
  }

  ruleTypes(): string[] {
    return Rule.ListRuleTypes();
  }

  updateRules() {
    this.ruleSource = new MatTableDataSource(this.preset.rules.filter(x => !x.hidden));
    this.ruleSource.sort = this.ruleSort;
    this.ruleSelection.clear();
    this.ruleMasterToggle();
  }
}
