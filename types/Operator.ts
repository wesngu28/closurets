
type stats = {
  hp: string;
  atk: string;
  def: string;
  resist: string;
  redeploy: string;
  cost: string;
  block: string;
  interval: string;
}

type lore = {
  Gender: string;
  'Place of Birth': string;
  Birthday: string;
  Race: string;
  Height: string;
  'Combat Experience': string;
  'Infection Status': string;
  'Physical Strength': string;
  Mobility: String;
  'Physiological Endurance': string;
  'Tactical Planning': string;
  'Combat Skill': string;
  "Originium Adaptability": string;
}

type opDict = {
  name: string;
  value: string;
}

type skill = {
  name: string;
  spcost: string;
  initialSP: string;
  chargeType: string;
  skillActivation: string;
  skillDescription: string;
}

type module = {
  name: string;
  level: string;
  trust: string;
  availability: string;
  trait: string;
  missions: string;
}

type base = {
  name: string;
  level: string;
  effects: string;
  building: string;
}

type art = {
  image: string;
  name: string;
}

export interface Operator {
  name: string;
  urlName: string;
  rarity: string;
  alter: string;
  artist: string;
  va: string;
  biography: string;
  description: string;
  quote: string;
  voicelines: { [key: string]: string };
  lore: lore;
  affiliation: Array<String>;
  class: Array<String>;
  tags: Array<String>;
  statistics: Array<{[key: string]: stats}>;
  trait: string;
  costs: {[key: string]: string};
  potential: Array<opDict>;
  trust: [{ [key: string]: string }];
  talents: Array<opDict>;
  skills: Array<skill>;
  module: Array<module>;
  base: Array<base>;
  headhunting: string;
  recruitable: string;
  art: Array<art>;
  availability: string;
  url: string;
  dateAdded: Date;
}