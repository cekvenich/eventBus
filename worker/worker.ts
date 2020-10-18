const NATS = require('nats');
import { v4 as uuidv4 } from 'uuid';

class EventBus {
    guid = uuidv4() // or your can read a properties yaml
    loadLevel = 0 // you can set the load level of the instances up or down
    nc
    constructor() { // creating the class starts the listener in the constructor
        this.nc =  NATS.connect('connect.ngs.global', { userCreds:'../nats.creds', json: true })
        this.nc.on('error', (err) => {
            console.log(err)
        })

        console.log('running...')
        const THIZ = this
        this.nc.subscribe('channelWho', { queue: 'job.workers' },  async (msg, replyTo, subject, sid) => { // it is a Q
            console.log(msg)
        
            // if free, respond, if busy, wait to respond. 
            let doneArg = await THIZ.delay(THIZ.loadLevel)
            THIZ.loadLevel+=5 // increase the load level of this instance
            THIZ.nc.publish(replyTo, doneArg)

        })

    }//()

    delay(t) {
        const THIZ = this
        return new Promise(function(resolve) {
            setTimeout(function() {
                resolve(THIZ.guid) // the ID of this instance
            }, t)
        })
     }

}

//start
new EventBus()