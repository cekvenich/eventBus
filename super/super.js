const NATS = require('nats');


// find a node that is least busy on event buss channel: channelWho

class EventBus {
    nc
    constructor() {
        this.nc =  NATS.connect('connect.ngs.global', { userCreds:'../nats.creds', json: true })
        this.nc.on('error', (err) => {
            console.log(err)
        })
    }//()


    clusterSelectWorker(job) {        
        const THIZ = this
        let arg = {job: job }

        //host
        return new Promise(function(resolve, reject) {
            THIZ.nc.requestOne('channelWho', arg, (resp) => {// one worker in the q will build and send one response
                console.log(resp)
                resolve(resp)
            })
        })//pro

    }//()


}