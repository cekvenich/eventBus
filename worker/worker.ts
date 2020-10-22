const { connect, JSONCodec, credsAuthenticator } = require("nats");
const { readFileSync } = require("fs");
import { v4 as uuidv4 } from "uuid";
const jc = JSONCodec();

class EventBus {
  guid = uuidv4(); // or your can read a properties yaml
 _loadLevel = 0; // you can set the load level of the instances up or down via this private var
  nc;

  setLoad(n) { // and fire an event, like flux or a bit like state machine
    this._loadLevel=n
    this.nc.request("channel.who", jc.encode({ node: this.guid, load:n }));
  }

  async init() {
    const creds = readFileSync("../nats.creds");
    this.nc = await connect(
      { servers: "connect.ngs.global", authenticator: credsAuthenticator(creds) },
    );
    this.setLoad(0)// init
    console.log("running fake load...");
    setInterval(()=>{
      this.setLoad(this.getRandomInt(0,10))
    }, 2000)

    setInterval(()=>{// i'm alive heartbeat
      this.nc.request("channel.who", jc.encode({ node: this.guid, load:this._loadLevel }));
    }, 900)
  }//()

  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }//()
}

//start
new EventBus().init()
