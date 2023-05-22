"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const channelModel_1 = __importDefault(require("./src/models/channelModel"));
const connect_1 = require("./src/models/connect");
dotenv_1.default.config();
(0, connect_1.databaseConnect)();
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function getStreamers() {
    const valid = true;
    let offset = 0;
    while (valid) {
        await sleep(2500);
        const holoRes = await (0, node_fetch_1.default)(`https://holodex.net/api/v2/channels?type=vtuber&offset=${offset++}&limit=1`, {
            method: 'GET',
            headers: {
                'x-api-key': process.env.HOLODEX_API,
            },
        });
        const json = (await holoRes.json());
        if (json[0]) {
            const findAlreadyExisting = await channelModel_1.default.findOne({
                name: json[0].name,
            });
            if (!findAlreadyExisting) {
                console.log(`Added ${json[0].english_name}`);
                await channelModel_1.default.create(json);
            }
            console.log(`Database already has ${json[0].english_name}`);
        }
    }
}
getStreamers();
