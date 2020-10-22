# Enterprise EventBus design pattern

## Intro
Microservices is a type of distributed computing that enables finer granularity of scaling. 
One popular use of micro services is to be able to scale a micro service by adding nodes, so you have to design ability to do that.

Obviously point to point communication between microservices is silly, so nodes are architecturally discouraged of calling each other directly: instead they talk to each other via an enterprise event bus. Mostly everything on the back end is 'connected' to the event buss to listen to things that they maybe interested it. There are many event bus alternatives, one is NATS, and it supports many languages. You can host NATS locally or use it as a cloud service via Synadia. I find NATS easier to work with than Kafka.


## Specific example - pick the last busy node

A common need is to pick a node in *a* microservice cluster that is least busy so that you can assign some work to the least busy node.

# Example of 'select least busy node' via an enterprise event bus.
First, sign up for Synadia for free so you can have an cloud even bus. (or install NATS if you wish to run the event bus by self).

There are two blocks of code you need. First code block of two, send the current node's current load to the supper node:
```
class EventBus {
  guid = uuidv4(); // or your can read a properties yaml
 _loadLevel = 0; // you can set the load level of the instances up or down via this private var
  nc;
  async setLoad(n) { // and fire an event, like flux or a bit like state machine
    this._loadLevel=n
    await this.nc.request("channel.who", jc.encode({ node: this.guid, load:n }));
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
      this.nc.request("channel.who", jc.encode({ node: this.guid, load:this._loadLevel }));
    }, 900)
  }//()
}
```


And second, the code on supper to show load by node:

```
class EventBus {
    nodes = {}

    async init2() {
        //on message
        const sub = this.nc.subscribe("channel.who");
        for await (const msg of sub) {
          let dat = jc.decode(msg.data)
          dat['time']= new Date()  
          //console.log(dat)
          this.nodes[dat.node]=dat
        }
    } //()

    selectLeastBusyWorkerNode() {
       console.log(this.nodes)
    } //()
}

```

## How to run

You can glance the NATS docs here: https://github.com/nats-io/nats.js/tree/nd

Download or clone the code. 
Here you have two folders, super and worker
First start a few workers by running this a few times: node worker.js

And then give the work, by running: node super.js

It should allow you to pick the least busy node.


## More

You can read about other distributed patters on ZeroMQ website ( https://zguide.zeromq.org )
Code above is a bit opposite of Raft, where you elected the leader - here we can select the worker. His can be used to add nodes to your Microservices cluster as needed.