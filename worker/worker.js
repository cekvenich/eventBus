"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { connect, JSONCodec } = require("nats");
const uuid_1 = require("uuid");
class EventBus {
    constructor() {
        this.guid = uuid_1.v4(); // or your can read a properties yaml
        this.loadLevel = 0; // you can set the load level of the instances up or down
        this.init();
    } //()
    async init() {
        this.nc = await connect({ servers: 'connect.ngs.global', userCreds: '../nats.creds', json: true });
        const jc = JSONCodec();
        const THIZ = this;
        console.log('running...');
        const sub = this.nc.subscribe('channelWho');
        for await (const msg of sub) {
            // if free, respond with 0 ms delay, if busy, wait to respond, maybe there is a node that is less busy
            let doneArg = await THIZ.delay(THIZ.loadLevel);
            THIZ.loadLevel += 1000; // increase the load level of this instance 
            console.log('job', jc.decode(msg), THIZ.guid, THIZ.loadLevel);
            msg.respond(jc.encode({ 'done': doneArg }));
        }
    } //()
    delay(t) {
        const THIZ = this;
        return new Promise(function (resolve) {
            setTimeout(function () {
                resolve(THIZ.guid); // the ID of this instance
            }, t);
        });
    } //()
}
//start
new EventBus();
