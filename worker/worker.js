"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NATS = require('nats');
const uuid_1 = require("uuid");
class EventBus {
    constructor() {
        this.guid = uuid_1.v4(); // or your can read a properties yaml
        this.loadLevel = 0; // you can set the load level of the instances up or down
        this.nc = NATS.connect('connect.ngs.global', { userCreds: '../nats.creds', json: true });
        this.nc.on('error', (err) => {
            console.log(err);
        });
        console.log('starting...');
        const THIZ = this;
        this.nc.subscribe('channelWho', { queue: 'job.workers' }, async (msg, replyTo, subject, sid) => {
            console.log(msg);
            // if free, respond, if busy, wait to respond. 
            let doneArg = await THIZ.delay(THIZ.loadLevel);
            THIZ.loadLevel += 5; // increase the load level of this instance
            THIZ.nc.publish(replyTo, doneArg);
        });
    } //()
    delay(t) {
        const THIZ = this;
        return new Promise(function (resolve) {
            setTimeout(function () {
                resolve(THIZ.guid); // the ID of this instance
            }, t);
        });
    }
}
//start
new EventBus();
