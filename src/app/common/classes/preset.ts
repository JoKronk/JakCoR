import { Randomizer } from "./randomizer";
import { Rule } from "./rule";

export class Preset {

    name: string;
    description: string;
    randomizer: Randomizer;
    rules: Rule[];
    lockLevel: number; //0 - nothing. 1 - cellsInRun. 2 - endAtFinalBoss. 3 - sameLevelPercent,sameLevelPercentOrbcells. 4 - cellsShownInAdvance.

    constructor(name: string, description: string) {
        this.name = name;
        this.description = description;
        this.randomizer = new Randomizer();
        this.rules = Rule.ListRules();
        this.lockLevel = 0;
    }

    public static FiddyCellRando(): Preset {
        const preset: Preset = new Preset("50 Cells", "Estimated time: 1h 30min+");
        preset.randomizer.cellsInRun = 50;
        preset.randomizer.cellsShownInAdvance = 1;
        preset.randomizer.endAtFinalBoss = false;
        preset.randomizer.sameLevelPercent = 60;
        preset.randomizer.sameLevelPercentOrbCells = 50;
        preset.lockLevel = 2;
        return preset;
    }

    public static SeventyTwoCellRando(): Preset {
        const preset: Preset = new Preset("74 Cells", "Estimated time: 3h+");
        preset.randomizer.cellsInRun = 74;
        preset.randomizer.cellsShownInAdvance = 2;
        preset.randomizer.endAtFinalBoss = true;
        preset.randomizer.sameLevelPercent = 65;
        preset.randomizer.sameLevelPercentOrbCells = 55;
        preset.lockLevel = 1;
        return preset;
    }

    public static ClassicRando(): Preset {
        const preset: Preset = new Preset("Classic", "Stays as true as possible to the original randomizer by SixRock with the improvments from tp971's online version. <br />Estimated time: 3h+");
        preset.randomizer.cellsInRun = 74;
        preset.randomizer.cellsShownInAdvance = 100;
        preset.randomizer.endAtFinalBoss = true;
        preset.randomizer.sameLevelPercent = 0;
        preset.randomizer.sameLevelPercentOrbCells = 0;
        preset.lockLevel = 3;

        preset.rules.find(x => x.id == 2).type = Rule.RestrictionType();
        preset.rules.find(x => x.id == 2).changeableType = true;
        preset.rules.find(x => x.id == 2).hidden = false;
        preset.rules.find(x => x.id == 3).type = Rule.RestrictionType();
        preset.rules.find(x => x.id == 3).changeableType = true;
        preset.rules.find(x => x.id == 3).hidden = false;
        preset.rules.find(x => x.id == 5).type = Rule.RestrictionType();
        preset.rules.find(x => x.id == 5).changeableType = false;
        preset.rules.find(x => x.id == 5).hidden = true;
        preset.rules.find(x => x.id == 6).type = Rule.RestrictionType();
        preset.rules.find(x => x.id == 6).changeableType = false;
        preset.rules.find(x => x.id == 6).hidden = true;
        preset.rules.find(x => x.id == 7).type = Rule.RestrictionType();
        preset.rules.find(x => x.id == 7).changeableType = false;
        preset.rules.find(x => x.id == 7).hidden = true;
        preset.rules.find(x => x.id == 10).type = Rule.RestrictionType();
        preset.rules.find(x => x.id == 10).changeableType = false;
        preset.rules.find(x => x.id == 11).type = Rule.RestrictionType();
        preset.rules.find(x => x.id == 11).changeableType = false;
        preset.rules.find(x => x.id == 11).hidden = true;
        preset.rules.find(x => x.id == 12).type = Rule.RestrictionType();
        preset.rules.find(x => x.id == 12).changeableType = false;
        preset.rules.find(x => x.id == 12).hidden = true;
        preset.rules.find(x => x.id == 13).type = Rule.RestrictionType();
        preset.rules.find(x => x.id == 13).changeableType = false;
        preset.rules.find(x => x.id == 14).type = Rule.RestrictionType();
        preset.rules.find(x => x.id == 14).changeableType = false;
        preset.rules.find(x => x.id == 15).type = Rule.RestrictionType();
        preset.rules.find(x => x.id == 15).changeableType = false;
        preset.rules.find(x => x.id == 16).type = Rule.RestrictionType();
        preset.rules.find(x => x.id == 16).changeableType = false;
        console.log(preset.rules);
        return preset;
    }

    public static FullCustomRando(): Preset {
        const preset: Preset = new Preset("Custom", "Fully customizable randomizer.");

        preset.rules.find(x => x.id == 2).changeableType = true;
        preset.rules.find(x => x.id == 2).hidden = false;
        preset.rules.find(x => x.id == 3).changeableType = true;
        preset.rules.find(x => x.id == 3).hidden = false;

        return preset;
    }

    public static HundoRando(): Preset {
        const preset: Preset = new Preset("All Cells", "Estimated time: unknown");
        preset.randomizer.cellsInRun = 101;
        preset.randomizer.cellsShownInAdvance = 100;
        preset.randomizer.endAtFinalBoss = true;
        preset.randomizer.sameLevelPercent = 70;
        preset.randomizer.sameLevelPercentOrbCells = 60;
        preset.lockLevel = 2;
        return preset;
    }

    public static ListPresets(): Preset[] {
        return [ 
            Preset.FiddyCellRando(),
            Preset.SeventyTwoCellRando(),
            Preset.ClassicRando(),
            Preset.FullCustomRando(),
            Preset.HundoRando()
        ]
    }
}