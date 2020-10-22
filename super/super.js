const { connect, credsAuthenticator, JSONCodec } = require("nats");
const { readFileSync } = require("fs");
const jc = JSONCodec();
// find a node that is least busy on event bus channel: channelWho
class EventBus {
    constructor() {
        this.nodes = {};
    }
    async init() {
        const creds = readFileSync("../nats.creds");
        this.nc = await connect({ servers: ["connect.ngs.global"], authenticator: credsAuthenticator(creds) });
        console.log('starting:');
        const sub = this.nc.subscribe("channel.who");
        //on message
        for await (const msg of sub) {
            let dat = jc.decode(msg.data);
            dat['time'] = new Date();
            this.nodes[dat.guid] = dat;
        }
    } //()
    async selectLeastBusyWorkerNode() {
        console.log(this.nodes);
    } //()
    delay(t) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, t);
        });
    } //()
}
(async () => {
    let eb = new EventBus();
    await eb.init();
    eb.selectLeastBusyWorkerNode();
    eb.delay(2000);
    eb.selectLeastBusyWorkerNode();
    eb.delay(2000);
    eb.selectLeastBusyWorkerNode();
    eb.delay(2000);
    eb.selectLeastBusyWorkerNode();
    eb.delay(2000);
    eb.selectLeastBusyWorkerNode();
    eb.delay(2000);
    eb.selectLeastBusyWorkerNode();
    eb.delay(2000);
    eb.selectLeastBusyWorkerNode();
    eb.delay(2000);
    eb.selectLeastBusyWorkerNode();
    eb.delay(2000);
})();
