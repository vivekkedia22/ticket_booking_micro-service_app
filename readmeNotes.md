ticket file:
the ticket file will have the nats client whose jsm stream is "tickets"

```javascript
jsm = nc.jetstreamManager();
await jsm.streams.add({ name: "TICKETS", subjects: [subj] });
```

order file:
the order file will have the nats client whose jsm stream is "orders"

```javascript
jsm = nc.jetstreamManager();
await jsm.streams.add({ name: "ORDERS", subjects: [subj] });
```

for the publisher:

for the ticket side :
the nats client will have the js which is responsible for pubishing messages to particular subjects , here in this case the nats client which has jsm which is listening to the stream of 'TICKETS'

```javascript
js = nc.jetstream();
js.publish("tickets.created", message);
```

for the order side:
the nats client will have the js which is responsible for pubishing messages to particular subjects , here in this case the nats client which has jsm which is listening to the stream of 'ORDERS'

```javascript
js = nc.jetstream();
js.publish("order.created", message);
```

now for the listener

the ticket file:
the listener is dependent on consumers. there are jsm.consumers for both which consume/listen for certain streams.
eg:

```javascript
sc = StringCodec();
await jsm.consumers.add(stream, {
  durable_name: "me",
  ack_policy: AckPolicy.Explicit,
  filter_subjects: ["order.created"], //now for the consumer which is trying to consume the durable name consumer it will only receive the msgs of the mentioned filtered subjects
});
//! the above code not necessarily needs to be in this place
const consumer = await js.consumers.get("ORDERS", "me"); //this is the actual subcriber sort of thing. it will make this ready to listen to the messages
const msgs = await js.consumer.consume();
for await (const msg of msgs) {
  console.log("message is ", sc.decode(msg)); //tada we got our message
}
```

the orders file:
the listener is dependent on consumers. there are jsm.consumers for both which consume/listen for certain streams.
eg:

```javascript
sc = StringCodec();
await jsm.consumers.add(stream, {
  durable_name: "me",
  ack_policy: AckPolicy.Explicit,
  filter_subjects: ["ticket.created"], //now for the consumer which is trying to consume the durable name consumer it will only receive the msgs of the mentioned filtered subjects
});
//! the above code not necessarily needs to be in this place
const consumer = await js.consumers.get("TICKETS", "me"); //this is the actual subcriber sort of thing. it will make this ready to listen to the messages
const msgs = await js.consumer.consume();
for await (const msg of msgs) {
  console.log("message is ", sc.decode(msg)); //tada we got our message
}
```

now you must be wondering how can they intecommuniate bw themselves from different files with the different streams.
let me show you

```javascript
const nc=await nats.connect({servers:{"some url"}})
```

here we connect the nats client to the same server.
as soon as i said this did something click in your mind?
yes!
the nats client we create on both the folders are actually same and the streams which we add or delete as well as consumers are shared between them.
so dont worry and change the name of streams freely to use in other folders as well with same natsclient

NOW FOR THE LISTENERS OF THE ORDER CREATED,CANCELLED,COMPLETED etc

when we create a order of a ticket we need to lock the ticket. now lets say we sent the order created event. and its listening on the ticket side. order has the ticket field.

now lets assume we are creating an order.

```js
created ticket --version=0

const order = await Order.build({
  userId: "123",
  ticket: "id",
  status: "created",
  expiresAt: "",
});

// now i have not done order.save();
// but before that itself the ticket is updated
ticket = Ticket.findById("id");
ticket.update();
ticket.save();
--version=1


//now i try to do the order.save()  . now here the version of the ticket which is there is the older version which is version=0

this is wrong. i guess this shouldnt happen. so before saving the order we have to check for the ticket too. that the ticket is not updated and the version is consistent

orderSchema.pre('save',async function(done){
  const ticketId=this.get('ticket')
  const ticket=await Ticket.findById(ticketId)
  this.$where={
    ticket:{
      ...this.get(ticket)
    }
  }
})
```


the customer saw the price 100 and went to book. but before it could be saved the producer increased the price to 3000. the person is in the process of buying and now the price suddenly increased. do we have a way to fix this? to prevent this? atleast until the locking mechanism triggers


i mean in my system as soon as the buyer clicks on the buy then the order is created. but thats it. lets ay he was seeing that okay the price is 200. then he clicks on the buy but before he clicked i.e while he was seeing the detail then the seller increased the price. noe if he clicks on buy and proceeds to buy then he will see increased price. this will not be a good user experience



we create a order:
orderr created event is emitted:
then the ticket service listens to it. then it updates the ticket which is use to update the orderid field. since we update it the naturally the version will increase. we cant do it in this way that the version will not inccrease. cuz if we do so then the further updates will become impossible. 

so when the seller update the ticket here the version is affected naturally. so when the order created thing tries to update the ticket filed of object id after it then obviously it will not happen and shall give error. and thus the msg shall not be acknowledged. but when the message is not acknowledge it retries to send it. therefore the order is created after the ticket is updated.. 