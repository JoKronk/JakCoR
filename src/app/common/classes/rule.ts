import { CellList } from "./cell-list";

export class Rule {

    id: number;
    name: string;
    description: string;
    mandatory: boolean;
    hidden: boolean;
    type: string;
    changeableType: boolean;

    cleared: boolean;

    cellCountNeeded?: number;
    cellIdsNeeded?: number[];
    cellIdsNeededLeft?: number[];
    cellCountNeededAfterCellIdsRequired?: number;

    cellsUnlocked: CellList; //unlocked when rule is lifted


    constructor(id: number, name: string, type: string, description: string) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.description = description;
        this.mandatory = false;
        this.hidden = false;
        this.cellsUnlocked = new CellList();
        this.cleared = false;
        this.changeableType = true;
    }

    //REQUIRED BASE RULES
    public static Geyser(): Rule {
        const rule: Rule = new Rule(1, "Geyser Rock First", Rule.RestrictionType(), "Prevents cells after Geyser Rock from appearing in the cell pool before 4 cells are obtained.");
        rule.mandatory = true;
        rule.hidden = true;
        rule.changeableType = false;
        rule.cellCountNeeded = 4;
        rule.cellsUnlocked.hubs = [1, 2, 3, 4];
        return rule;
    }

    public static Hub2(): Rule { //"Kinda" the same as No FCS rule but seperated here to not cause confusion
        const rule: Rule = new Rule(2, "Hub 2", Rule.InjectionType(), "Makes sure End of FC comes before Hub 2 cells.");
        rule.mandatory = true;
        rule.hidden = true;
        rule.changeableType = false;
        rule.cellIdsNeeded = [34];
        rule.cellsUnlocked.hubs = [2];
        return rule;
    }

    public static Hub3andCitadel(): Rule {//"Kinda" the same as No LTS rule but seperated here to not cause confusion
        const rule: Rule = new Rule(3, "Hub 3", Rule.InjectionType(), "Makes sure End of FC and End of Mountain Pass comes before Hub 3 and Citadel cells.");
        rule.mandatory = true;
        rule.hidden = true;
        rule.changeableType = false;
        rule.cellIdsNeeded = [34, 67];
        rule.cellsUnlocked.hubs = [3, 4];
        return rule;
    }
    
    public static SnowyOrbBoxCell(): Rule {
        const rule: Rule = new Rule(4, "Snowy: Secret Cell", Rule.InjectionType(), "Makes sure Flut Flut is unlocked before Snowy Secret Cell.");
        rule.mandatory = true;
        rule.hidden = true;
        rule.cellIdsNeeded = [11];
        rule.cellsUnlocked.cellIds = [89];
        return rule;
    }

    //MANDATORY RULES
    public static Misty(): Rule {
        const rule: Rule = new Rule(5, "Misty", Rule.InjectionType(), "Makes sure FJ Fish is done before Misty cells.");
        rule.mandatory = true;
        rule.cellIdsNeeded = [22];
        rule.cellsUnlocked.levels = ["Misty"];
        return rule;
    }

    public static Snowy(): Rule {
        const rule: Rule = new Rule(6, "Snowy", Rule.InjectionType(), "Makes sure End of FC and End of Mountain Pass as well as two random cells are obtained before Snowy.");
        rule.mandatory = true;
        rule.cellIdsNeeded = [34, 67];
        rule.cellCountNeededAfterCellIdsRequired = 2;
        rule.cellsUnlocked.levels = ["Snowy"];
        return rule;
    }

    public static BlueRings(): Rule {
        const rule: Rule = new Rule(7, "Blue Rings", Rule.InjectionType(), "Makes sure Puprle Rings comes before Blue Rings.");
        rule.mandatory = true;
        rule.cellIdsNeeded = [47];
        rule.cellsUnlocked.cellIds = [48];
        return rule;
    }

    //NONE-CHANGEALBE RULES
    public static NoFCS(): Rule {
        const rule: Rule = new Rule(8, "No FCS", Rule.RestrictionType(), "Prevents cells after Hub 1 or in FC to appear in the pool before 20 cells are obtained.");
        rule.cellCountNeeded = 20;
        rule.changeableType = false;
        rule.cellsUnlocked.hubs = [2, 3, 4];
        rule.cellsUnlocked.levels = ["FC"];
        return rule;
    }

    public static NoLTS(): Rule {
        const rule: Rule = new Rule(9, "No LTS", Rule.RestrictionType(), "Prevents cells after Hub 3 to appear in the pool before 72 cells are obtained.");
        rule.cellCountNeeded = 72;
        rule.changeableType = false;
        rule.cellsUnlocked.hubs = [4];
        rule.cellsUnlocked.levels = ["Lava Tube"];
        return rule;
    }

    //OPTIONAL RULES
    public static NmsCitadel(): Rule {
        const rule: Rule = new Rule(10, "NMS Citadel", Rule.InjectionType(), "Makes sure all other sage cells are obtained before Green Sage cell.");
        rule.cellIdsNeeded = [96, 97, 98];
        rule.cellsUnlocked.cellIds = [99];
        return rule;
    }

    public static NoCitadelHops(): Rule {
        const rule: Rule = new Rule(11, "No Citadel Hops", Rule.InjectionType(), "Makes sure End of Lava Tube is obtained if a Citadel Cell is randomized.");
        rule.cellIdsNeeded = [94];
        rule.cellsUnlocked.hubs = [4];
        return rule;
    }
    
    public static NoTreeHops(): Rule {
        const rule: Rule = new Rule(12, "No Tree Hops", Rule.InjectionType(), "Makes sure End of Mountain Pass is obtained if Mountian Pass Secret Cell is randomized.");
        rule.cellIdsNeeded = [67];
        rule.cellsUnlocked.cellIds = [68];
        return rule;
    }
    
    public static NoEarlyTemple(): Rule {
        const rule: Rule = new Rule(13, "FJ: No Early Temple", Rule.InjectionType(), "Makes sure Top of tower Cell is obtained before entering the Temple.");
        rule.cellIdsNeeded = [19];
        rule.cellsUnlocked.cellIds = [20, 21];
        return rule;
    }
    
    public static NoEarlyPlantBoss(): Rule {
        const rule: Rule = new Rule(14, "FJ: No Early Plant Boss", Rule.RestrictionType(), "Makes sure Blue eco vent Cell is obtained before Plant Boss.");
        rule.cellIdsNeeded = [20];
        rule.cellsUnlocked.cellIds = [21];
        return rule;
    }
    
    public static NoClosedFortress(): Rule {
        const rule: Rule = new Rule(15, "Snowy: No Fortress while Closed", Rule.InjectionType(), "Makes sure Fortress Gate is open before Snowy Fortress.");
        rule.cellIdsNeeded = [91];
        rule.cellsUnlocked.cellIds = [90, 93];
        return rule;
    }
    
    public static NoFortressWithoutFlutFlut(): Rule {
        const rule: Rule = new Rule(16, "Snowy: No Fortress without Flut Flut", Rule.InjectionType(), "Makes sure Flut Flut is unlocked before Snowy Fortress.");
        rule.cellIdsNeeded = [11];
        rule.cellsUnlocked.cellIds = [90, 93];
        return rule;
    }


    public static ListRules(): Rule[] {
        return [ 
            Rule.Geyser(),
            Rule.Hub2(),
            Rule.Hub3andCitadel(),

            Rule.Misty(),
            Rule.Snowy(),
            Rule.SnowyOrbBoxCell(),
            Rule.BlueRings(),

            Rule.NoFCS(),
            Rule.NoLTS(),

            Rule.NmsCitadel(),
            Rule.NoCitadelHops(),
            Rule.NoTreeHops(),
            Rule.NoEarlyTemple(),
            Rule.NoEarlyPlantBoss(),
            Rule.NoClosedFortress(),
            Rule.NoFortressWithoutFlutFlut()
        ]
    }

    public static RestrictionType(): string {
        return "Restricted";
    }
    public static InjectionType(): string {
        return "Injected";
    }

    public static ListRuleTypes(): string[] {
        return [ 
            Rule.RestrictionType(),
            Rule.InjectionType()
        ]
    }
}