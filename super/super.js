const { connect, JSONCodec, credsAuthenticator } = require("nats")
const { readFileSync } = require("fs")

// find a node that is least busy on event bus channel: channelWho

class EventBus {
    nc
    jc
    constructor() {
        this.jc = JSONCodec()
    }//()

    async init() {
        const creds = readFileSync('../nats.creds')
        this.nc =  await connect({ servers: ['connect.ngs.global'], authenticator: credsAuthenticator(creds) })
        console.log('NATS ready')
    }

    async selectLeastBusyWorkerNode(job) {        
        let arg = this.jc.encode({'job': job })
        const THIZ = this
        this.nc.request('channelWho', arg)
            .then((msg) => {
                console.log(THIZ.jc.decode(msg))
            })
    }//()


}

let job = 0

async function selectNodes() {
    const eb = new EventBus()
    await eb.init()

    let node = await eb.selectLeastBusyWorkerNode(job++)

    node = await eb.selectLeastBusyWorkerNode(job++)
    
    node = await eb.selectLeastBusyWorkerNode(job++)
    
    node = await eb.selectLeastBusyWorkerNode(job++)
    
    node = await eb.selectLeastBusyWorkerNode(job++)
    
    node = await eb.selectLeastBusyWorkerNode(job++)

}
selectNodes()