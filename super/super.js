const NATS = require('nats');


// find a node that is least busy on event bus channel: channelWho

class EventBus {
    nc
    constructor() {
        this.nc =  NATS.connect('connect.ngs.global', { userCreds:'../nats.creds', json: true })
        this.nc.on('error', (err) => {
            console.log(err)
        })
    }//()


    async selectLestBusyWorkerNode(job) {        
        const THIZ = this
        let arg = {job: job }

        //host
        return new Promise(function(resolve, reject) {
            THIZ.nc.requestOne('channelWho', arg, (resp) => {// one worker will respond
                resolve(resp)
            })
        })//pro

    }//()


}

let job = 0
let eb = new EventBus()

async function selectNodes() {
    let node = await eb.selectLestBusyWorkerNode(job++)
    console.log(node)
    
    node = await eb.selectLestBusyWorkerNode(job++)
    console.log(node)
    
    node = await eb.selectLestBusyWorkerNode(job++)
    console.log(node)
    
    node = await eb.selectLestBusyWorkerNode(job++)
    console.log(node)
    
    node = await eb.selectLestBusyWorkerNode(job++)
    console.log(node)
    
    node = await eb.selectLestBusyWorkerNode(job++)
    console.log(node)
}
selectNodes()