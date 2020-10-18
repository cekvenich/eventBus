# EventBus design pattern

Micro-services is a type of distributed computing that enables finer granularity of scaling. 
Obviously point to point communication between micro-services is silly, so nodes are architecturally discouraged of calling each other directly: instead they talk to each other via an enterprise event bus. There are many event bus alternatives, one is NATS, and it supports many languages. You can host NATS locally or use it as a cloud service via Synadia. I find NATS easier to work with than Kafka.


A common need is to pick a node in a micro-service cluster that is least busy so that you can assign some work to the least busy node.

# Example of 'select least busy node' via an enterprise event bus.
You can sign up for Synadia for free.

There are two blocks of code you need.

Ask the nodes, from the super node:
```
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

```


And the code on each worker node:

```
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
        
            // if free, respond with 0 ms delay, if busy, wait to respond, maybe there is a node that is less busy
            let doneArg = await THIZ.delay(THIZ.loadLevel)
            THIZ.loadLevel+=1000 // increase the load level of this instance 
            console.log('job',msg, THIZ.guid, THIZ.loadLevel)
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

```

## How to run

Here you have two folders, super and worker.
First start a few workers via: node worker.js

And then give the work, by running: node super.js