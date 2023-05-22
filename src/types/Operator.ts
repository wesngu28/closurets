type stats = {
  hp: string;
  atk: string;
  def: string;
  resist: string;
  redeploy: string;
  cost: string;
  block: string;
  interval: string;
};

type skill = {
  name: string;
  spcost: string;
  initialSP: string;
  chargeType: string;
  skillActivation: string;
  skillDescription: string;
};

type module = {
  name: string;
  level: string;
  trust: string;
  availability: string;
  trait: string;
  missions: string[];
};

type base = {
  name: string;
  level: string;
  effects: string;
  building: string;
};

export type Art = {
  name: string
  link: string
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
  statistics: { base: stats; e0max: stats; e1max: stats; e2max: stats };
  trait: string;
  costs: { [key: string]: string };
  potential: Array<{ name: string; value: string }>;
  trust: { [key: string]: string };
  talents: Array<{ name: string; value: string }>;
  skills: Array<skill>;
  module: module;
  base: Array<base>;
  headhunting: string;
  recruitable: string;
  art: Array<Art>;
  availability: string;
  url: string;
  dateAdded?: Date;
}
