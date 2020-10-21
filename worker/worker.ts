const { connect, JSONCodec, credsAuthenticator } = require("nats");
const { readFileSync } = require("fs");

import { v4 as uuidv4 } from "uuid";

class EventBus {
  guid = uuidv4(); // or your can read a properties yaml
  loadLevel = 0; // you can set the load level of the instances up or down
  nc;

  async init() {
    const creds = readFileSync("../nats.creds");
    this.nc = await connect(
      { servers: "connect.ngs.global", authenticator: credsAuthenticator(creds) },
    );
    const jc = JSONCodec();
    console.log("running...");
    const sub = this.nc.subscribe("channel.who");

    for await (const msg of sub) {
      // if free, respond with 0 ms delay, if busy, wait to respond, maybe there is a node that is less busy
      let doneArg = await this.delay(this.loadLevel);
      this.loadLevel += 100; // increase the load level of this instance
      console.log("job", jc.decode(msg.data), this.guid, this.loadLevel);
      msg.respond(jc.encode({ "done": doneArg }));
    }
  }

  delay(t) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.guid); // the ID of this instance
      }, t);
    });
  }
}

//start
new EventBus().init()
