const { connect, credsAuthenticator, JSONCodec } = require("nats");
const { readFileSync } = require("fs");
const jc = JSONCodec();

// find a node that is least busy on event bus channel: channelWho
class EventBus {
    nc;
    constructor(nc) {
    this.nc = nc;
    } //()

    async selectLeastBusyWorkerNode(job) {
        return new Promise(async (resolve) => {
            const msg = await this.nc.request("channel.who", jc.encode({ job: job }), {timeout: 100000});
            resolve(jc.decode(msg.data));
        })
    } //()
}


(async () => {
    const creds = readFileSync("../nats.creds");
    const nc = await connect(
        { servers: ["connect.ngs.global"], authenticator: credsAuthenticator(creds) },
    );
    console.log('starting:')
    let job = 0;
    let eb = new EventBus(nc);

    let node = await eb.selectLeastBusyWorkerNode(job++);
    console.log(node);

    node = await eb.selectLeastBusyWorkerNode(job++);
    console.log(node);

    node = await eb.selectLeastBusyWorkerNode(job++);
    console.log(node);

    node = await eb.selectLeastBusyWorkerNode(job++);
    console.log(node);

    node = await eb.selectLeastBusyWorkerNode(job++);
    console.log(node);
​
    node = await eb.selectLeastBusyWorkerNode(job++);
    console.log(node);

})();

