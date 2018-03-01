---
layout: faq
title: Git
sub_title: Common commands and how-tos
faq: true
---
## Tags

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

## Staging and unstaging files

Stage a file

``` bash
git add <file-name>
```

Stage all files

``` bash
git add --all
```

Stage new and modified files (not deleted)

``` bash
git add .
```

Stage modified and deleted files (not new)

``` bash
git add -u
```

Unstage a file

``` bash
git reset <file-name>
```

Unstage all currently staged changes

``` bash
git reset
```

## Committing

Amend the last commit message

``` bash
git commit --amend
```

## Squash commits together

To squash the last n commits into one commit we can use an interactive rebase.  Execute the following command.

``` bash
git rebase -i HEAD~n
```

This will then launch an editor instance that contains a list of the last n commits.  We can mark these commits to be
picked, squashed, edited, etc.  To abort the rebase just close the editor without saving any changes to the file.  To
proceed with the rebase, mark the first/top commit (the latest one) as 'p' and all the others as 's'.  Then save the
file and close the editor.  Another editor instance will launch that will allow us to create a new commit message for
the resulting single commit.  Compose the message, save the file and then close the editor.  Job done.
