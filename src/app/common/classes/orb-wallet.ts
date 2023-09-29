import { Cell } from "./cell";

export class OrbWallet {

    orbsAvailable: number;
    orbLocks: OrbLock[];

    checkForOrbsUnlocked(cell: Cell) {
        this.orbLocks.forEach(lock => {
            if ((lock.cellId && lock.cellId === cell.id) || (lock.cellCount && lock.cellCount <= cell.cellNumber)) {
                this.removeOrbLock(lock);
            }
        });
    }
    
    private removeOrbLock(lock: OrbLock) {
        this.orbsAvailable += lock.unlockedOrbs;
        this.orbLocks.splice(this.orbLocks.indexOf(lock), 1);
    }

    checkForOrbsSpent(cell: Cell) {
        if (cell.orbCost)
            this.orbsAvailable -= cell.orbCost;
    }

    constructor() {
        this.orbsAvailable = 50;

        //Enough Orbs to buy everything is available by Hub 3 (1700 out of 1530 needed) so no further logic for Snowy, Lava Tube & Citadel is added.
        this.orbLocks = [
            new OrbLock("Geyser Completed", (50 + 150 + 150), null, 4),
            new OrbLock("Misty Unlocked", 150, 19),
            new OrbLock("FC Zoomer Unlocked", 50, null, 20),
            new OrbLock("Hub 2 Unlocked", (50 + 200 + 200 + 200 + 50), 35),
            new OrbLock("Hub 3 Unlocked", (50 + 200), 68)
        ];
    }
}

export class OrbLock {
    name: string;
    unlockedOrbs: number;
    cellId?: number;
    cellCount?: number;

    constructor(name: string, orbs: number, cellId?: number, cellCount?: number) {
        this.name = name;
        this.unlockedOrbs = orbs;
        this.cellId = cellId;
        this.cellCount = cellCount;
    }
}