export type Art = {
  name: string
  link: string
  line?: string
}

export interface Operator {
  _id: string;
  name: string;
  rarity: number;
  alter: string;
  artist: string;
  va: string;
  biography: string;
  description: string;
  quote: string;
  voicelines: { [key: string]: string };
  lore: { [key: string]: string };
  affiliation: Array<string>;
  class: Array<string>;
  tags: Array<string>;
  range: Array<{ elite: string; range: ("attackable" | "unit" | "null")[][] }>;
  statistics:
    | { [key: string]: { hp: string; atk: string; def: string; block: string;
        resist?: string; deploy?: string; cost?: string; interval?: string; } }
    | {
        base: { error: string };
        e0max: { error: string };
        e1max: { error: string };
        e2max: { error: string };
      };
  trait: string;
  costs: { name: string; amount: number; }[];
  potential: Array<{ name: string; value: string }>;
  trust: Array<{ name: string; value: string }>;
  talents: Array<
    {name: string, variation: Array<{
      description: string, elite: string, potential: string, moduleName?: string, moduleLevel?: number
    }>
  }>;
  skills: Array<{
    name: string;
    variations: {
        level: string | number;
        description: string;
        sp_cost: string;
        initial_sp: string;
        duration: string;
        range: string | ("attackable" | "unit" | "null")[][];
    }[];
    skill_charge: string;
    skill_activation: string;
  }>;
  module: Array<{[key: string]: any;}>;
  base: Array<{name: string; level: string; effects: string; building: string;}>;
  headhunting: string;
  recruitable: string;
  art: Array<{name: string, link: string, line?: string}>;
  availability: string;
  release_dates: { cn: string; global: string;}
  url: string;
  dateAdded?: Date;
}