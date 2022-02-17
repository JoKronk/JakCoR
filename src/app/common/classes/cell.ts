export class Cell {
    id: number;
    level: string;
    name: string;
    hub: number;
    cellNumber?: number;
    isHubCell: boolean;

    orbCost?: number;

    constructor(id: number, hub: number, level: string, name: string, orbCost?: number, isHubCell: boolean = false) {
        this.id = id;
        this.hub = hub;
        this.level = level;
        this.name = name;
        this.orbCost = orbCost;
        this.isHubCell = isHubCell;
        this.cellNumber = null;
    }
}