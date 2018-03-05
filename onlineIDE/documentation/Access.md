## Internal and External Access
An inline frame (iframe) enables the integration of multiple documents into a single web
browser window. The use of iframes has certain advantages. For instance, it simplifies the
integration or at least partial integration of third party websites into an existing website
while maintaining a maximum of security and privacy between the different actors as they cannot
access the content of each other.

This Online IDE also uses iframes in order to simplify the integration of tools written by
other developers. More often than not, such tools require access to the Online IDE and its
functionality, such as manipulating its tabs or the files in its workspace. However, as
previously established, such an access in either direction might not be available under certain
conditions for security and privacy reasons. For this reason, multiple interfaces have been
developed to enable such an access in most situations. These interfaces can be sub-divided into
those enabling an internal access and those enabling an external access.

### Application Programming Interface (API)

#### Internal Access:
Internal Access, in the context of this Online IDE, denotes the possibility of an iframe
embedded by the Online IDE to access the functionality of the IDE. Two different types of
interfaces providing internal access have been developed, namely `window.parent.api` and
`Message Passing`.

##### window.parent.api:
As previously mentioned, iframes cannot access the content of their parent nor can their
parent access their content. An exception to this rule are iframes which share the same origin
with their parent. In this case, an iframe can access the global scope of its parent with
`window.parent`.

For this reason, this approach exposes some of the Online IDE plugins via an
`api` object in the global scope. A plugin can then be accessed from the iframe by invoking
`window.parent.api.plugin` where `plugin` is the name of the plugin.

Currently available plugins are:

[fs](https://apidoc.c9.io/c9v3/#!/api/fs),
[tabManager](https://apidoc.c9.io/c9v3/#!/api/tabManager)

An advantage of this approach is that the entire scope of the plugin is available to the
iframe including eventual callback and return values. For this reason also, this approach is the
recommended way of interacting with the Online IDE whenever available!

As an example, one might consider the following situation. The Online IDE is currently working
on a workspace holding a file with path `/models/textual/main.model` which represents the main
model. Furthermore, a tool which renders a visual representation of the models in the workspace
has been embedded into the IDE. The visual representation is also interactive in the sense of a
developer being able to click on the representation in order to open the main model. Lastly,
both actors share the same origin `peterapis.com`. The click handler then might look something
along these lines:

```JavaScript
function onClick(event) {
    var api = window.parent.api;
    var tabManager = api.tabManager;
    
    function onOpenFile(error, tab) {
        if(error) console.error(error);
        else handleOpenFile(tab);
    }
    
    tabManager.openFile("/models/textual/main.model", true, onOpenFile);
}
```

##### [Message Passing](./MessagePassing.md)

#### External Access:
External Access, in the context of this Online IDE, denotes the possibility of a website
which embeds the Online IDE to access its functionality. This kind of access is provided by
the previously linked `Message Passing` API.