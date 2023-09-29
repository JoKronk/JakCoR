export class Cell {
    id: number;
    level: string;
    endLevel: string;
    name: string;
    hub: number;
    cellNumber?: number;
    hasBeenRandomized: boolean;

    orbCost?: number;

    constructor(id: number, hub: number, level: string, name: string, orbCost?: number, endsIn?: string) {
        this.id = id;
        this.hub = hub;
        this.level = level;
        this.name = name;
        this.orbCost = orbCost;
        this.cellNumber = null;
        this.endLevel = endsIn ?? level;
        this.hasBeenRandomized = false;
    }
}