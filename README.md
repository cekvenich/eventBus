# Enterprise EventBus design pattern

## Intro
Microservices is a type of distributed computing that enables finer granularity of scaling. 
One popular use of micro services is to be able to scale a micro service by adding nodes, so you have to design ability to do that.

Obviously point to point communication between microservices is silly, so nodes are architecturally discouraged of calling each other directly: instead they talk to each other via an enterprise event bus. Mostly everything on the back end is 'connected' to the event buss to listen to things that they maybe interested it. There are many event bus alternatives, one is NATS, and it supports many languages. You can host NATS locally or use it as a cloud service via Synadia. I find NATS easier to work with than Kafka.


## Specific example - pick the last busy node

A common need is to pick a node in *a* microservice cluster that is least busy so that you can assign some work to the least busy node.

# Example of 'select least busy node' via an enterprise event bus.
First, sign up for Synadia for free so you can have an cloud even bus.

There are two blocks of code you need. First code block of two, ask the nodes, from the super node:
```

```


And. second of two: the code on each worker node:

```


```

## How to run

You can glance the NATS docs here: https://github.com/nats-io/nats.js/tree/nd


Download or clone the code and sign up for Synadia (or install NATS if you wish).
Here you have two folders, super and worker
First start a few workers by running this a few times: node worker.js

And then give the work, by running: node super.js

It should pick the least busy node.


## Appendix

You can read about other distributed patters on ZeroMQ website.
Code above is a bit opposite of Raft, where you elected the leader - here we select the worker.