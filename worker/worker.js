"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { connect, JSONCodec, credsAuthenticator } = require("nats");
const { readFileSync } = require("fs");
const uuid_1 = require("uuid");
const jc = JSONCodec();
class EventBus {
    constructor() {
        this.guid = uuid_1.v4(); // or your can read a properties yaml
        this._loadLevel = 0; // you can set the load level of the instances up or down via this private var
    }
    async setLoad(n) {
        this._loadLevel = n;
        await this.nc.publish("channel.who", jc.encode({ node: this.guid, load: n }));
        console.log(n);
    }
    async init() {
        const creds = readFileSync("../nats.creds");
        this.nc = await connect({ servers: "connect.ngs.global", authenticator: credsAuthenticator(creds) });
        this.setLoad(0); // init
        console.log("running fake load...");
        setInterval(() => {
            this.setLoad(this.getRandomInt(0, 10));
        }, 2000);
        setInterval(() => {
            this.nc.publish("channel.who", jc.encode({ node: this.guid, load: this._loadLevel }));
        }, 900);
    } //()
    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    } //()
}
//start
new EventBus().init();
