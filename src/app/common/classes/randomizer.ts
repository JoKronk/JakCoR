import { Cell } from "./cell";
import { CellList } from "./cell-list";
import { OrbWallet } from "./orb-wallet";
import { Rule } from "./rule";
import * as seedrandom from "seedrandom";

export class Randomizer {
    endAtFinalBoss: boolean;
    cellsInRun: number;
    cellsShownInAdvance: number | null;
    sameLevelPercent: number | null;
    sameLevelPercentOrbCells: number | null;
    sameHubPercent: number | null;
    
    seed?: number;
    randomizeCompleted: boolean;

    cells: Cell[];
    restrictions: Rule[];
    injections: Rule[];
    orbWallet: OrbWallet;

    private previousCell: Cell | null;
    private currentCellNumber: number;
    private availableCellPool: Cell[];
    private requiredCellsForFinalBoss: number[];

    private mathRandom: seedrandom.PRNG;

    private consoleLogDebugText: boolean = false;

    reset() {
        if (this.consoleLogDebugText)
            console.clear();

        if (!this.seed) {
            for (let i = 0; i < 25; i++) {
                this.seed = seedrandom().int32();
                if (this.seed > 0)
                    break;
            }
        }

        this.mathRandom = seedrandom(this.seed?.toString());
        this.randomizeCompleted = false;
        this.requiredCellsForFinalBoss = [];
        this.cells.forEach(x => { x.cellNumber = null; x.hasBeenRandomized = false });
        this.orbWallet = new OrbWallet();
        this.previousCell = null;
        this.requiredCellsForFinalBoss = [0, 1, 2, 3, 34, 67, 94, 99];

        this.injections.forEach(x => {
            x.cleared = false;
            if (x.cellIdsNeeded)
                x.cellIdsNeededLeft = JSON.parse(JSON.stringify(x.cellIdsNeeded));
            if (x.cellCountNeededAfterCellIdsRequired)
                x.cellCountsNeededCellIdsLeft = JSON.parse(JSON.stringify(x.cellCountNeededAfterCellIdsRequired));
            if (x.cellIdsAnyNeededBeforeActive)
                x.started = false;
        });

        this.restrictions.forEach(x => {
            x.cleared = false;
            if (x.cellIdsNeeded)
                x.cellIdsNeededLeft = JSON.parse(JSON.stringify(x.cellIdsNeeded));
            if (x.cellCountNeededAfterCellIdsRequired)
                x.cellCountsNeededCellIdsLeft = JSON.parse(JSON.stringify(x.cellCountNeededAfterCellIdsRequired));
            if (x.cellIdsAnyNeededBeforeActive)
                x.started = false;
        });
    }

    randomizeOrder(): void {
        this.reset();

        for (this.currentCellNumber = 1; this.currentCellNumber <= this.cellsInRun; this.currentCellNumber++) {
            this.runCellRandomizeCycle();
        }
        this.randomizeCompleted = true;
    }

    getNewCell(nextId?: number): Cell {
        if (nextId && this.cells.find(x => x.id === nextId)?.hasBeenRandomized)
        nextId = undefined;

        //get cell (gets given cell id EVEN IF IT'S NOT AVAILABLE IN POOL, else a randomized cell with level persistance percentage radomization)
        const cellId: number = nextId ?? this.getNextCellId(this.previousCell && this.randomizeIfSameLevel() ? this.previousCell.endLevel : undefined, this.previousCell && this.randomizeIfSameHub() ? this.previousCell.hub : undefined);
        const cell: Cell = this.cells.find(x => x.id === cellId) as Cell;

        if (this.consoleLogDebugText)
            console.log("RANDOMIZED CELL", this.currentCellNumber + " - " + cell.level + ": " + cell.name);

        cell.hasBeenRandomized = true;
        return cell;
    }

    runCellRandomizeCycle(incrementCellNumber: boolean = false, nextId?: number, isRandomInject: boolean = false, isEndCell: boolean = false) {

        this.checkSetAvailableCellPool();

        //breakout if softlocked order
        if (this.availableCellPool.length == 0) {
            console.log("Empty Cell Pool Reached!");
            return;
        }

        const cell = this.getNewCell(nextId);

        //previous cell assigned here in case updateInjection inserts new cell
        this.previousCell = cell;

        if (!isEndCell && !isRandomInject)
            this.updateInjections(cell);

        if (!(this.currentCellNumber <= this.cellsInRun))
            return;

        this.checkRuleActivation(cell);

        //assign values
        cell.cellNumber = this.currentCellNumber;

        if (this.consoleLogDebugText)
            console.log("ADDED CELL", this.currentCellNumber + " - " + cell.level + ": " + cell.name);

        this.orbWallet.checkForOrbsSpent(cell);
        this.orbWallet.checkForOrbsUnlocked(cell);
        
        if (incrementCellNumber) //if function is ran by updateInjections() instead of main for loop.
            this.currentCellNumber++;

        if (this.endAtFinalBoss && !isEndCell)
            this.checkRunEndRequirements(cell, incrementCellNumber);
    }

    
    checkRunEndRequirements(cell: Cell, hasAlreadyIncremented: boolean) {
        if (this.requiredCellsForFinalBoss.includes(cell.id)) {
            this.requiredCellsForFinalBoss.splice(0, this.requiredCellsForFinalBoss.indexOf(cell.id) + 1);
        }
        if ((cell.cellNumber as number) >= this.cellsInRun - this.requiredCellsForFinalBoss.length) {

            if (!hasAlreadyIncremented) //prevents cell counter to skip a cell if incremented from injection right before the ending
                this.currentCellNumber++;

            this.requiredCellsForFinalBoss.forEach(cellId => {
                this.runCellRandomizeCycle(true, cellId, false, true);
            });
        }
    }

    updateInjections(currentCell: Cell): void {
        this.injections.filter(x => !x.cleared && x.started).map(x => x.id).forEach(id => {
            const injection: Rule = this.injections.find(x => x.id === id) as Rule;
            //!TODO: Figure out why this happens..
            if (injection.cleared || !injection.started)
                return;

            //remove existing cell requirements from injection if future requirement is randomized
            if (injection.cellIdsNeededLeft?.includes(currentCell.id)) 
                injection.cellIdsNeededLeft.splice(injection.cellIdsNeededLeft.indexOf(currentCell.id), 1);

            //execute injection if randomized cell is part of rule
            if (this.cellIsPartOfCellList(currentCell, injection.cellsUnlocked) && (!injection.cellCountNeeded || injection.cellCountNeeded >= this.currentCellNumber)) {
                
                const availableCellIds: number[] = this.availableCellPool.map(x => x.id);
                if (injection.cellIdsNeededLeft && !injection.cellIdsNeededLeft.every(id => availableCellIds.includes(id))) { //check if all required cells are available
                    return;
                }
                
                if (this.consoleLogDebugText)
                    console.log("RUNNING INJECTION LOGIC FOR " + injection.name + ": ", JSON.parse(JSON.stringify(injection)));

                if (injection.cellIdsNeededLeft) {
                    JSON.parse(JSON.stringify(injection.cellIdsNeededLeft)).forEach((id: number) => {
                        this.runCellRandomizeCycle(true, id);
                    });
                }
                
                if (!injection.cellIdsNeededLeft?.length) {

                    if (injection.cellCountsNeededCellIdsLeft) {
                        while (injection.cellCountsNeededCellIdsLeft > 0) {
                            injection.cellCountsNeededCellIdsLeft--;
                            this.runCellRandomizeCycle(true, undefined, true);
                            if (injection.cleared) //as this can self loop if it randomizes a cell that belongs to current rule which causes this to loop multiple times
                                return;
                        }
                    }
                    this.previousCell = currentCell;
                    injection.cleared = true;
    
                    if (this.consoleLogDebugText)
                        console.log("INJECTION COMPLETE:", injection.name);
                }
            }
        });
    }

    cellIsPartOfCellList(cell: Cell, cells: CellList): boolean {
        return cells.hubs?.includes(cell.hub) || cells.levels?.includes(cell.level) || cells.cellIds?.includes(cell.id);
    }

    checkRuleActivation(cell: Cell): void {
        this.restrictions.filter(x => !x.started).forEach(x => {
            if (x.cellIdsAnyNeededBeforeActive && x.cellIdsAnyNeededBeforeActive.includes(cell.id)) {
                x.started = true;
                this.checkRuleCleared(x);
            }
        });
        this.injections.filter(x => !x.started).forEach(x => {
            if (x.cellIdsAnyNeededBeforeActive && x.cellIdsAnyNeededBeforeActive.includes(cell.id)) {
                x.started = true;
                this.checkRuleCleared(x);
            }
        });
    }

    checkRuleCleared(rule: Rule): boolean {
        let cellAfterRequiermentFulfilled = true;
        if (rule.cellIdsNeededLeft) {
            rule.cellIdsNeededLeft = rule.cellIdsNeededLeft.filter(cellId => !(this.cells.find(x => x.id === cellId) as Cell).cellNumber); //can't take use of .hasBeenRandomized here as injections could cause cells waiting to be injected to falsly toggle this, opening the pool to cells not yet available

            if (rule.cellIdsNeededLeft.length === 0 && rule.cellCountsNeededCellIdsLeft && rule.cellIdsNeeded) {
                for (let cellId of rule.cellIdsNeeded) {
                    const cell = (this.cells.find(x => x.id === cellId) as Cell);
                    if (!cell.cellNumber)
                        continue;

                    if (cell.cellNumber + rule.cellCountsNeededCellIdsLeft <= this.currentCellNumber) {
                        cellAfterRequiermentFulfilled = false;
                        break;
                    }
                }
            }
        }

        if (!(rule.cellIdsNeededLeft?.length) && (!rule.cellCountNeeded || rule.cellCountNeeded < this.currentCellNumber) && cellAfterRequiermentFulfilled)
            rule.cleared = true;
            
        return rule.cleared;
    }

    checkSetAvailableCellPool(): void {
        //get unobtained cells
        const unobtainedCells = this.cells.filter(x => !x.hasBeenRandomized).map(x => Object.assign({}, x));
        this.availableCellPool = unobtainedCells.map(x => Object.assign({}, x));

        //filter out by restrictions
        this.restrictions.filter(x => !x.cleared && x.started).forEach(rule => {
            if (this.checkRestrictionClear(rule))
                return;

            this.removeCellsAccordingToRule(rule.cellsUnlocked);
        });
        
        //filter out by cell cost
        if (this.orbWallet.orbsAvailable < 120)
            this.availableCellPool = this.availableCellPool.filter(x => !x.orbCost || x.orbCost < this.orbWallet.orbsAvailable);
    }

    checkRestrictionClear(rule: Rule) : boolean {
        if (!this.previousCell)
            return false;

        if (rule.cellIdsNeededLeft?.includes(this.previousCell.id))
            rule.cellIdsNeededLeft.splice(rule.cellIdsNeededLeft.indexOf(this.previousCell.id), 1);

        if (rule.cellCountsNeededCellIdsLeft && !(rule.cellIdsNeededLeft?.length))
            rule.cellCountsNeededCellIdsLeft--;

        const cleared = !(rule.cellIdsNeededLeft?.length) && (!rule.cellCountNeeded || rule.cellCountNeeded < this.currentCellNumber) && (!rule.cellCountsNeededCellIdsLeft || rule.cellCountsNeededCellIdsLeft <= 0);
        if (cleared) {
            rule.cleared = cleared;

            if (this.consoleLogDebugText)
                console.log("RULE CLEARED:", rule.name);
        }
            
        return cleared;
    }

    removeCellsAccordingToRule(cellsToBlock: CellList) {
        if (cellsToBlock.hubs.length)
            this.availableCellPool = this.availableCellPool.filter(x => !cellsToBlock.hubs.includes(x.hub));
        if (cellsToBlock.levels.length)
            this.availableCellPool = this.availableCellPool.filter(x => !cellsToBlock.levels.includes(x.level));
        if (cellsToBlock.cellIds.length)
        this.availableCellPool = this.availableCellPool.filter(x => !cellsToBlock.cellIds.includes(x.id));
    }

    randomizeIfSameLevel(): boolean {
        return this.mathRandom() < ((this.previousCell?.orbCost ? this.sameLevelPercentOrbCells ?? 1 : this.sameLevelPercent ?? 1) / 100);
    }

    randomizeIfSameHub(): boolean {
        return this.mathRandom() < (this.sameHubPercent ?? 1 / 100);
    }

    getNextCellId(ensureLevel?: string, ensureHub?: number): number {
        if (this.consoleLogDebugText && ensureLevel)
            console.log("Same Level Randomized", ensureLevel);

        else if (this.consoleLogDebugText && ensureHub)
                console.log("Same Hub Randomized As Cell", this.previousCell?.cellNumber);

        const cellPool: Cell[] = ensureLevel && this.availableCellPool.filter(x => x.level === ensureLevel).length != 0 ? this.availableCellPool.filter(x => x.level === ensureLevel) : ensureHub && this.availableCellPool.filter(x => x.hub === ensureHub).length != 0 ? this.availableCellPool.filter(x => x.hub === ensureHub) : this.availableCellPool;
        return cellPool[Math.floor(this.mathRandom() * cellPool.length)].id;
    }

    constructor() {
        this.randomizeCompleted = false;
        this.endAtFinalBoss = true;
        this.cellsInRun = 74;
        this.cellsShownInAdvance = 100;
        this.sameLevelPercent = 60;
        this.sameLevelPercentOrbCells = 50;
        this.orbWallet = new OrbWallet();
        this.requiredCellsForFinalBoss = [0, 1, 2, 3, 35, 68, 95, 100]; //End of Lava Tube included so we don't have to check for rules regarding it or force people to Citadel Hop

        this.cells = [
            new Cell(0, 0, "Geyser", "Cell on path"),
            new Cell(1, 0, "Geyser", "Open blue eco door"),
            new Cell(2, 0, "Geyser", "Climb the cliff"),
            new Cell(3, 0, "Geyser", "Scout flies"),
            new Cell(4, 1, "Sandover", "Mayor orbs", 90),
            new Cell(5, 1, "Sandover", "Uncle orbs", 90),
            new Cell(6, 1, "Sandover", "Yakows"),
            new Cell(7, 1, "Sandover", "Oracle orbs", 120),
            new Cell(8, 1, "Sandover", "Oracle orbs", 120),
            new Cell(9, 1, "Sandover", "Scout flies"),
            new Cell(10, 1, "Sentinel", "Green eco cloggers"),
            new Cell(11, 1, "Sentinel", "Flut flut egg"),
            new Cell(12, 1, "Sentinel", "Pelican"),
            new Cell(13, 1, "Sentinel", "Seagulls"),
            new Cell(14, 1, "Sentinel", "Cannon tower"),
            new Cell(15, 1, "Sentinel", "Explore the beach"),
            new Cell(16, 1, "Sentinel", "Middle sentinel"),
            new Cell(17, 1, "Sentinel", "Scout flies"),
            new Cell(18, 1, "FJ", "Mirrors", undefined, "Sandover"),
            new Cell(19, 1, "FJ", "Top of tower"),
            new Cell(20, 1, "FJ", "Blue eco vent"),
            new Cell(21, 1, "FJ", "Plant boss"),
            new Cell(22, 1, "FJ", "Fish"),
            new Cell(23, 1, "FJ", "Swim to island"),
            new Cell(24, 1, "FJ", "Locked blue eco door"),
            new Cell(25, 1, "FJ", "Scout flies"),
            new Cell(26, 1, "Misty", "Catch muse", undefined, "Sandover"),
            new Cell(27, 1, "Misty", "Lurker ship"),
            new Cell(28, 1, "Misty", "Cannon"),
            new Cell(29, 1, "Misty", "Dark eco pool"),
            new Cell(30, 1, "Misty", "Balloon lurkers"),
            new Cell(31, 1, "Misty", "Zoomer jump"),
            new Cell(32, 1, "Misty", "Pillar platform (Misty boosted)"),
            new Cell(33, 1, "Misty", "Scout flies"),
            new Cell(34, 1, "FC", "Reach end"),
            new Cell(35, 1, "FC", "Scout flies"),
            new Cell(36, 2, "Rock Village", "Gambler orbs", 90),
            new Cell(37, 2, "Rock Village", "Geologist orbs", 90),
            new Cell(38, 2, "Rock Village", "Warrior orbs", 90),
            new Cell(39, 2, "Rock Village", "Oracle orbs", 120),
            new Cell(40, 2, "Rock Village", "Oracle orbs", 120),
            new Cell(41, 2, "Rock Village", "Scout flies"),
            new Cell(42, 2, "Basin", "Moles", undefined, "Rock Village"),
            new Cell(43, 2, "Basin", "Flying lurkers"),
            new Cell(44, 2, "Basin", "Race", undefined, "Rock Village"),
            new Cell(45, 2, "Basin", "Over the lake"),
            new Cell(46, 2, "Basin", "Plants"),
            new Cell(47, 2, "Basin", "Purple rings"),
            new Cell(48, 2, "Basin", "Blue rings"),
            new Cell(49, 2, "Basin", "Scout flies"),
            new Cell(50, 2, "LPC", "Raise the chamber"),
            new Cell(51, 2, "LPC", "Pipe cell"),
            new Cell(52, 2, "LPC", "Bottom of city"),
            new Cell(53, 2, "LPC", "Quickly cross the pool (After piggyback)"),
            new Cell(54, 2, "LPC", "Puzzle"),
            new Cell(55, 2, "LPC", "Climb tube (Piggyback)"),
            new Cell(56, 2, "LPC", "Center of complex (Dark eco circle room)"),
            new Cell(57, 2, "LPC", "Scout flies"),
            new Cell(58, 2, "Boggy", "Ride Flut Flut"),
            new Cell(59, 2, "Boggy", "Rats"),
            new Cell(60, 2, "Boggy", "Ambush"),
            new Cell(61, 2, "Boggy", "Tether cell 1"),
            new Cell(62, 2, "Boggy", "Tether cell 2"),
            new Cell(63, 2, "Boggy", "Tether cell 3"),
            new Cell(64, 2, "Boggy", "Tether cell 4"),
            new Cell(65, 2, "Boggy", "Scout flies"),
            new Cell(66, 2, "Mountain Pass", "Klaww"),
            new Cell(67, 2, "Mountain Pass", "Reach end (Red sage after)", undefined, "VC"),
            new Cell(68, 2, "Mountain Pass", "Secret cell"),
            new Cell(69, 2, "Mountain Pass", "Scout flies"),
            new Cell(70, 3, "VC", "Miners", 90),
            new Cell(71, 3, "VC", "Miners", 90),
            new Cell(72, 3, "VC", "Miners", 90),
            new Cell(73, 3, "VC", "Miners", 90),
            new Cell(74, 3, "VC", "Oracle orbs", 120),
            new Cell(75, 3, "VC", "Oracle orbs", 120),
            new Cell(76, 3, "VC", "Secret cell"),
            new Cell(77, 3, "VC", "Scout flies"),
            new Cell(78, 3, "Spider Cave", "Shoot gnawing lurkers"),
            new Cell(79, 3, "Spider Cave", "Dark eco crystals"),
            new Cell(80, 3, "Spider Cave", "Dark cave"),
            new Cell(81, 3, "Spider Cave", "Top of robot"),
            new Cell(82, 3, "Spider Cave", "Poles"),
            new Cell(83, 3, "Spider Cave", "Spider tunnel"),
            new Cell(84, 3, "Spider Cave", "Platforms"),
            new Cell(85, 3, "Spider Cave", "Scout flies"),
            new Cell(86, 3, "Snowy", "Yellow eco vent"),
            new Cell(87, 3, "Snowy", "Stop 3 glacier troops"),
            new Cell(88, 3, "Snowy", "Blockers"),
            new Cell(89, 3, "Snowy", "Secret cell"),
            new Cell(90, 3, "Snowy", "Fortress"),
            new Cell(91, 3, "Snowy", "Fortress door"),
            new Cell(92, 3, "Snowy", "Lurker cave"),
            new Cell(93, 3, "Snowy", "Scout flies"),
            new Cell(94, 3, "Lava Tube", "Reach end"),
            new Cell(95, 3, "Lava Tube", "Scout flies"),
            new Cell(96, 4, "Citadel", "Blue sage"),
            new Cell(97, 4, "Citadel", "Red sage"),
            new Cell(98, 4, "Citadel", "Yellow sage"),
            new Cell(99, 4, "Citadel", "Green sage"),
            new Cell(100, 4, "Citadel", "Scout flies")
        ];
    }
}