## Cloud9
To be written.

### Application Programming Interface (API)

#### Plugins:
To be written.

#### ide.html:
Apart from with plugins, some of the functionality can also be controlled by extending the URL
with a query string of the form:

```
?method1=argument1&method2=argument2&...&methodN=argumentN
``` 

Currently supported methods are:

##### openFile:
`openFile`, as the name suggests, is a method which opens files in the Online IDE. To this end,
the method expects an argument which specifies what files should be opened. The argument can
either be a single path or a comma-separated list of paths to one or more files. The last path
in the list is the file whose tab will have focus in the IDE. With each path, a developer can
also pass a line and a column at which the cursor will be positioned once the file has been
opened. This is achieved by appending `:line:column` to the respective list entry.

As an example, one could consider the following situation. A workspace consists of three files
`/a/A.txt`, `/b/B.txt` and `/c/C.txt` which should be opened in the Online IDE and with a
cursor position of `0:0`, `5:0` and `10:5` respectively. In order to achieve this, a developer
can extend the URL like follows:

```
/ide.html?openFile=/a/A.txt,/b/B.txt:5,/c/C.txt:10:5
```

##### hideControls:
`hideControls` is a method which hides some of the GUI elements of the Online IDE. To this end,
the method expects an argument which specifies which elements should be hidden. The argument
is a comma-separated list of flags. The list must always have a length of 3 and each entry
represents one of the sides: top, right or left respectively. All entries support the flags
`0` and `1`, apart from the top entry which also supports `2`. In all cases, `0` indicates
that nothing should be changed on the respective side. For the sides, `1` indicates that the
side panels should be hidden. For the top, `1` indicates that the menu bar should be hidden
and `2` indicates that everything up to the tabs included should be hidden.

As an example, one could consider the following situation. A developer wants to open the
Online IDE with all the controls hidden except for the tabs. In order to achieve this, she
would open it with the following URL:

```
/ide.html?hideControls=1,1,1
```