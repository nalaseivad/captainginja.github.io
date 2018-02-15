---
layout: faq
title: Git
sub_title: Common commands and how-tos
faq: true
---
# Tags

Annotated vs lightweight tags

* "Annotated tags are meant for release while lightweight tags are meant for private or temporary object labels."
* Annotated tags have an associated message whereas lightweight tags do not
* git describe without command line options only sees annotated tags

Create a lightweight tag

``` bash
git tag <tag-name>
```

Create an annotated tag with the message inline

``` bash
git tag -a <tag-name> -m <message>
```

Create an annotated tag.  An editor will then start to allow you to type the message text, which can be multi-line.

``` bash
git tag -a <tag-name>
```

List tags

``` bash
git tag -l
```

List tags with messages with up to max-lines lines of the message

``` bash
git tag -l -n<max-lines>
```

List remote tags

``` bash
git ls-remote --tags <remote-name>
```


Delete a local tag

``` bash
git tag --delete <tag-name>
```

Delete a remote tag

``` bash
git push --delete origin <tag-name>
```