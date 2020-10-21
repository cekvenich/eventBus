"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { connect, JSONCodec, credsAuthenticator } = require("nats");
const { readFileSync } = require("fs");
const uuid_1 = require("uuid");
class EventBus {
    constructor() {
        this.guid = uuid_1.v4(); // or your can read a properties yaml
        this.loadLevel = 0; // you can set the load level of the instances up or down
    }
    async init() {
        const creds = readFileSync("../nats.creds");
        this.nc = await connect({ servers: "connect.ngs.global", authenticator: credsAuthenticator(creds) });
        const jc = JSONCodec();
        console.log("running...");
        const sub = this.nc.subscribe("channel.who");
        for await (const msg of sub) {
            // if free, respond with 0 ms delay, if busy, wait to respond, maybe there is a node that is less busy
            let doneArg = await this.delay(this.loadLevel);
            this.loadLevel += 200; // increase the load level of this instance
            console.log("job", jc.decode(msg.data), this.guid, this.loadLevel);
            msg.respond(jc.encode({ "done": doneArg }));
        }
    }
    delay(t) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(this.guid); // the ID of this instance
            }, t);
        });
    }
}
//start
new EventBus().init();
