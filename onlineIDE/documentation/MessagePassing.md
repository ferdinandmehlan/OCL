## Message Passing
As previously explained, for security and privacy reasons, iframes of different origin than
their embedding website cannot access the functionality of their parent nor can their parent
access their functionality. In order to loosen this restriction, a Message Application
Programming Interface (API) has been introduced to the HTML Standard which allows to send
messages from either of the sides to the corresponding opposing side.

The Message API has been used to implement a Network Architecture which enables communication
between the Online IDE and embedded iframes or embedding websites. Furthermore, it enables
cross-iframe communication. In the following, this architecture is depicted in more detail.

### Network Architecture
In real world Local Area Networks (LANs), different end systems are either connected directly
(wired or wireless) or indirectly over an intermediate system. There exist a multitude of
different intermediate systems, the most popular amongst them being the Switch and the Hub.
This documentation primarily focuses on the Switch.

A Switch is a hardware device which interconnects different systems, coordinates their
inter-communication and therefore forms a network consisting of all the connected devices.
To this end, a device's port on its Network Interface Card (NIC) is connected to one of the
available ports on the Switch. In contrast to a Hub which broadcasts a frame along all
available ports except for the one where the original frame arrived, a Switch only forwards the
frame along the port on which the receiver is directly or indirectly connected. The position of
a receiver is established in an initial learning phase.

This real world situation acts as schematic for the implemented architecture. To this end, the
Online IDE has been extended by a plugin `api.switch` which emulates the functionality of a
Switch. Furthermore, a `Port` script has been developed which emulates a port. An overview of
this architecture can be seen in Figure 1.

![./images/MessagePassing/Network.svg](./images/MessagePassing/Network.svg)

Figure 1. An overview of the Network Architecture used in the Online IDE.

Nonetheless, there are a few differences. First of all, due to the architecture having been
developed in software, the syntax of a frame sent in this architecture deviates from the one
of a frame sent in a real world network. A frame sent in the context of this Online IDE is of
the form:

```
{
  source: string,
  destination: string,
  eventName: string,
  pid: string,
  payload: any
}
```

`source` and `destination` are the `id`s of sender and receiver respectively. The `id` is
established upon construction of a `Port`.

Different types of messages have been introduced to differentiate between different types of
events. `eventName` represents the type of message and can have one of the following values:

Message Type|Description|
---|---
`online`|The Switch has successfully been initiated and is ready for connections.
`connect`|A `Port` wants to connect to the Switch.
`connected`|A `Port` has been connected to the Switch.
`message`|A message to be  transferred to a `Port`.
`disconnect`|A `Port` wants to disconnect from the Switch.
`disconnected`|A `Port` has been disconnected from the Switch.

Much like in a real world network where responses to packets could arrive in a different order
than initially sent, answers to sent frames in this architecture could also arrive in a
different order than initially sent. For this reason, each frame receives a `pid` which
uniquely distinguishes the responses to the different frames.

Lastly, `payload` holds the data to be transferred to the receiver. The payload has to be of
a type which is cloneable by the
[Structured Clone Algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm).

#### Application Programming Interface (API)

##### Port(id: string): Port
`Port(id: string)` is a constructor function which returns an object representing a port. It
accepts as parameter a mandatory string which represents the `id` of the port.

Example:
```JavaScript
var port = Port("peterapis");
```

##### port.connectTo(context: Window, callback: (error: string) => void)
`connectTo` is a method of `Port` which connects a port to a specified context in which a
Switch is currently running. A context can either be the local `window` object, the
`window.parent` object or the `contentWindow` object of an iframe. Furthermore, a `callback`
has to be provided which is called once a response from the Switch has arrived.

Example:
```JavaScript
var iframes = document.getElementsByTagName("iframe");
var contentWindow = iframes[0].contentWindow;

function onConnect(data) {
    var error = data.payload;
    
    if(error) console.error(error);
}

port.connectTo(contentWindow, onConnect);
```

##### port.disconnect(callback: (error: string) => void)
`disconnect` is a method of `Port` which disconnects a connected port from the Switch. A
`callback` has to be provided which is called once a response from the Switch has arrived.

Example:
```JavaScript
function onDisconnect(data) {
    var error = data.payload;
    
    if(error) console.error(error);
}

port.disconnect(onDisconnect);
```

##### port.sendTo(destination: string, payload: any, callback: (frame: object) => void)
`sendTo` is a method of `Port` which can be used to transfer a provided `payload` to a
specified `destination` port. A `callback` has to be provided which is called once the
response frame from the receiver has arrived.

Example:
```JavaScript
function onResponse(data) {
    console.log(data.payload); //Prints "Hello World!"
}

port.sendTo("echo", "Hello World!", onResponse);
```

##### port.answerTo(frame: object, payload?: any)
`answerTo` is a method of `Port` which can be used to transfer a response to a received frame.
To this end, the received `frame` has to be passed as first argument as it is used to derive
the response frame information. Furthermore, an optional `payload` has to be provided as
second argument.

Example:
```JavaScript
function onMessage(data) {
    port.answerTo(data, "The answer is 42!");
}

port.on("message", onMessage);
```

##### port.on(eventName: string, callback: (...args: any[]) => void)
`on` is a method of `Port` which can be used to bind a `callback` to a specified `eventName`.
`eventName` has to be one the previously described message types.

Example:
```JavaScript
function onConnect(data) {
    var error = data.payload;
    
    if(error) console.error(error);
}

port.on("connect", onConnect);
```

##### port.off(eventName: string, callback: (...args: any[]) => void)
`off` is the opposing method of `on` as it unbinds a `callback` from a specified `eventName`.

Example:
```JavaScript
function onConnect(data) {
    var error = data.payload;
    
    if(error) console.error(error);
    else port.off("connect", onConnect);
}

port.on("connect", onConnect);
```

#### Full Example
As a full example, one could consider the following situation. A website has embedded the
Online IDE with an iframe having an `id` of `ide`. Furthermore, the `Port` script has been
added to the website. The Online IDE executes a plugin which registers a port with an `id`
of `echo`. `echo` reacts to each message with a response having the same `payload` as the
initial frame from the sender. The website registers a port with an `id` of `sender` and
prints the `payload` of the response to the console. The code for this situation would look
something along these lines:

```JavaScript
var port = Port("sender");
var iframe = document.getElementById("ide");

function onResponse(data) {
    console.log(data.payload);
}

function onConnected(data) {
    if(data.source === "echo") port.sendTo("echo", "Hello World!", onResponse);
}

function onConnect(data) {
    var error = data.payload;
    
    if(error) console.error(error);
    else port.on("connected", onConnected);
}

function onOnline() {
    port.connectTo(iframe.contentWindow, onConnect);
}

port.on("online", onOnline);
```

First, the newly created port waits for the `online` signal of the Switch indicating that the
Switch is now ready for connections. Following this, the port connects to the Switch and
waits for the `connected` signal of the `echo` port. Having received this signal, the port
can now start sending messages to the `echo` port.

### Online IDE Control Protocol
The previous section depicted a Network Architecture which enables the coordinated
transmission of messages between the Online IDE and embedding websites or embedded iframes.
The logical next step is the coordinated control of the Online IDE over this newly established
communication channel.

#### Naive Approach
A naive approach to this would be the implementation of a procedure which allows to request a
resource from the Online IDE and the Online IDE fetching and responding with the requested
resource. This naive approach is, however, not feasible as the transmission of full objects 
(objects with functions, except for a few exceptions) throws an exception in comparison to
plain objects (objects without functions) as these are not cloneable by the 
[Structured Clone Algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm).

One can make a few observations from this approach. First, the requested resource has to stay
on the side of the Online IDE. Nonetheless, it should be addressable by the other context in
order to call its methods or to change or read its properties. Second, eventual return or
callback values from methods applied to the resource should also be addressable from the other
context in order to further process them. These observations and requirements have lead to the
development of an Online IDE plugin `api.ide` which implements a new protocol which has been
labeled Online IDE Control Protocol.

#### Protocol Specification
The Online IDE Control Protocol (OICP) is, as the name suggests, a protocol which enables and
coordinates the control of the Online IDE using new formats of `payload`. Two different kinds
are supported:

```
{
  plugin: string,
  method: string,
  arguments: any[],
  ttl?: number
}
```

```
{
  reference: string,
  method: string,
  arguments: any[],
  ttl?: number
}
```

Each kind of `payload` consists of four different parts and their difference lies within the
first field. With the mandatory field `plugin`, a developer can specify the name of one of
the supported plugins which should be used in the next execution. `method` specifies which
method of `plugin` should be executed and accordingly the array `arguments` specifies the
arguments which should be applied to `method`. `arguments` must, however, **not** contain the
potentially needed callback function. As some of the plugins also expose objects which have
attributes without setter or getter functions but which should also be accessible, two
special methods have been introduced which emulate these missing methods, namely `{{set}}`
and `{{get}}`. Both accept the name of the attribute as first element of `arguments`.
In addition, `{{set}}` also accepts a new value for the attribute as second element of
`arguments.`

The execution of a method on one of the plugins might yield one return value or multiple
callback values which should ideally be available to the other context. As previously
established, transmission might not be an option depending on the type of these values.
For this reason, these values are not directly transmitted to the other context but are first
cached under a unique key. This key is then transmitted to the other context instead of the
full object. Furthermore, it can be used as `reference` for the second kind of `payload`.
In this situation, `method` and `arguments` are not applied to a plugin but to the object
itself as all keys in `reference` and `arguments` are replaced by the original object upon
arrival at `api.ide`. The same rule also applies for `method` calls on a `plugin` which
expect an object in `arguments`. Since there is no elegant way for the Online IDE to check
whether a reference is transferable or not, a developer can make the conscious decision when a
reference should be transferred by specifying the special method `{{raw}}`. The `payload` of
the answer sent by `api.ide` is always an array of either a single value in the case of a
return value or multiple values in the case of callback values.

This procedure has, however, one disadvantage. Since the lifetime of references to objects has
artificially been increased, these references no longer go out of scope. As a consequence,
this procedure leads to a memory leak. In order to counter this behavior, each entry of the
cache is cleared 30 seconds after its addition. The timeout of each execution can be
controlled by the optional specification of a `ttl` (Time-To-Live). A `ttl` of 0 will keep the
reference in the cache until the Online IDE is reloaded.

Currently supported plugins are:

[fs](https://apidoc.c9.io/c9v3/#!/api/fs),
[tabManager](https://apidoc.c9.io/c9v3/#!/api/tabManager)

#### Full Example
As an example, one could consider the following situation. A developer of a website which
embeds the Online IDE wants to change the title of the currently focused tab to "Han Solo". To
achieve this, the code would look something along these lines:

```JavaScript
function onSetTitle(data) {}

function onGetFocussedTab(data) {
    port.sendTo("api.ide", {
        reference: data.payload[0],
        method: "{{set}}",
        arguments: ["title", "Han Solo"]
    }, onSetTitle);
}

function onConnected(data) {
    if(data.source === "api.ide") {
        port.sendTo("api.ide", {
            plugin: "tabManager",
            method: "{{get}}",
            arguments: ["focussedTab"]
        }, onGetFocussedTab);
    }
}
```

After having established a connection to the Switch, the port has to wait for the port of
`api.ide` to also be connected to the Switch. Upon receiving the signal that `api.ide` is now
ready for transmissions, the port can start sending messages to `api.ide` according to the
specification of the OICP. Here, the port first sends a message indicating that the developer
needs a reference to the property `focussedTab` of the `tabManager` object. The reference is
stored in the cache for 30 seconds and the key to the reference is sent back to the website.
Using this key, a second message can be sent to `api.ide` indicating that the title of
`focussedTab` should be changed to `Han Solo`. A Sequence Diagram of this situation can be
seen in Figure 2.

![./images/MessagePassing/SequenceDiagram.svg](./images/MessagePassing/SequenceDiagram.svg)

Figure 2. Sequence Diagram of an execution of the OICP which changes the title of the
currently focused tab to "Han Solo".