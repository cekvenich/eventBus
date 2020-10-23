const { connect, credsAuthenticator, JSONCodec } = require("nats");
const { readFileSync } = require("fs");
const jc = JSONCodec();

// find a node that is least busy on event bus channel: channelWho
class EventBus {
    nc;
    nodes = {}
    async init() {
        const creds = readFileSync("../nats.creds");
        this.nc = await connect(
            { servers: ["connect.ngs.global"], authenticator: credsAuthenticator(creds) })
        console.log('starting:')
    }
    async init2() {
        //on message
        const sub = this.nc.subscribe("channel.who");
        (async ()=> { for await (const msg of sub) {
          let dat = jc.decode(msg.data)
          dat['time']= new Date()  
          //console.log(dat)
          this.nodes[dat.node]=dat
        }})()
    } //()

    selectLeastBusyWorkerNode() { // a map/dictionary of nodes that includes load
       console.log(this.nodes)
    } //()

    delay(t) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve()
            }, t)
        })
    }//()
}

(async () => {
    let eb = new EventBus()
    await eb.init()
    eb.init2()

    eb.selectLeastBusyWorkerNode();
    await eb.delay(2000)
    eb.selectLeastBusyWorkerNode();
    await eb.delay(2000)
    eb.selectLeastBusyWorkerNode();
    await eb.delay(2000)
    eb.selectLeastBusyWorkerNode();
    await eb.delay(2000)
    eb.selectLeastBusyWorkerNode();
    await eb.delay(2000)
    eb.selectLeastBusyWorkerNode();
    await eb.delay(2000)
    eb.selectLeastBusyWorkerNode();
    await eb.delay(2000)
    eb.selectLeastBusyWorkerNode();
    await eb.delay(2000)
    eb.selectLeastBusyWorkerNode();
    await eb.delay(2000)

})()



