# Leveraging an Enterprise EventBus design pattern

## Intro
Microservices is a type of distributed computing that enables finer granularity of scaling and other benefits. (eg working with legacy code.) 
But the popular use of micro services is to be able to scale a micro service by adding nodes, and you have to design the ability to do that. 

Obviously point to point communication between microservices is silly, so nodes are architecturally discouraged of calling each other directly: instead they talk to each other via an enterprise event bus. (It looks to me that people have outgrown things like MuleSoft. RabbitMQ and 3Scale). Mostly everything on the back end is 'connected' to the event bus to listen to things that they maybe interested it. This way you can add new types of microservices or deprecate other types of micro services. There are many event bus alternatives, one is NATS, and it supports many languages. You can host NATS locally or use it as a cloud service via Synadia. I find NATS easier to work with than Kafka for Enterprise EventBus(EEB). I don't see how anyone can do microservices without a good enterprise event bus. 

## A specific EEB design pattern example - pick the last busy node

A common need is to pick a node within a specific type of *a* microservice cluster that is least busy so that you can assign some work to the least busy node. This can also be used to add nodes to your microservices cluster as needed, in order to scale that microservice. That is one of the points of micro services - independent scaling of microservice culsters. 

# Code example of 'pick the last busy node' via an enterprise event bus.
First, sign up for Synadia for free so you have an enterprise event bus. Or install NATS if you wish to run the event bus by self and not in the cloud.

You can glance the NATS docs here: https://github.com/nats-io/nats.js/tree/nd 

There are two blocks of code you need. First code block of two, sends the current node's current load to the supper node:
```
class EventBus {
  guid = uuidv4(); // or your can read a properties yaml
  _loadLevel = 0; // you can set the load level of the instances up or down via this private var
  nc;
  async setLoad(n) { // and fire an event, like flux or a bit like state machine
    this._loadLevel=n
    await this.nc.publish("channel.who", jc.encode({ node: this.guid, load:n }));
    console.log(n)
  }

  async init() {
    const creds = readFileSync("../nats.creds");
    this.nc = await connect(
      { servers: "connect.ngs.global", authenticator: credsAuthenticator(creds) });
    this.setLoad(0)// init
    console.log("running fake load...");
    setInterval(()=>{
      this.setLoad(this.getRandomInt(0,10))
    }, 2000)

    setInterval(()=>{// i'm alive heartbeat
      this.nc.publish("channel.who", jc.encode({ node: this.guid, load:this._loadLevel }));
    }, 900)
  }//()
}
```

And second, the code on supper node to show load by node:
```
class EventBus {
    nodes = {}

    async init2() {
        const sub = this.nc.subscribe("channel.who");
        //on message:
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
}

let eb = new EventBus()
await eb.init()
eb.init2()

eb.selectLeastBusyWorkerNode();
await eb.delay(2000)
eb.selectLeastBusyWorkerNode();
await eb.delay(2000)

```
That is the code.

## How to run

Download or clone the code in this git repo.

You have two folders, super and worker, do 'npm i' in each. Get nats.creds from Synadia or configure your own NATS.

First start a few workers by running this a few times: node worker.js

And then run: node super.js
That is it, it should allow you to pick the least busy node! 


## More

You can read about other distributed patterns on ZeroMQ website ( https://zguide.zeromq.org )
Code above is a bit opposite of Raft, where you elected the leader - here we can select the worker. 