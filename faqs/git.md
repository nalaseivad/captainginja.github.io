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

```
$ git tag <tag-name>
```

Create an annotated tag with the message inline

```
$ git tag -a <tag-name> -m <message>
```

Create an annotated tag.  An editor will then start to allow you to type the message text, which can be multi-line.

```
$ git tag -a <tag-name>
```

List tags

```
$ git tag -l
```

List tags with messages with up to max-lines lines of the message

```
$ git tag -l -n<max-lines>
```

List remote tags

```
$ git ls-remote --tags <remote-name>
```


Delete a local tag

```
$ git tag --delete <tag-name>
```

Delete a remote tag

```
$ git push --delete origin <tag-name>
```

## Staging and unstaging files

Stage a file

```
$ git add <file-name>
```

Stage all files

```
$ git add --all
```

Stage new and modified files (not deleted)

```
$ git add .
```

Stage modified and deleted files (not new)

```
$ git add -u
```

Unstage a file

```
$ git reset <file-name>
```

Unstage all currently staged changes

```
$ git reset
```

## Removing files

Remove a file from the repo and also from the workspace (local filesystem).

```
$ git rm file1.txt
$ git commit -m "remove file1.txt"
```

Remove the file from the repo but leave it in the workspace.

```
$ git rm --cached file1.txt
$ git commit -m "remove file1.txt"
```

## Committing

Amend the last commit message

```
$ git commit --amend
```

Commit and specify a single line commit message.  Do not lauch the default editor to create the commit message.

```
$ git commit -m "This is my commit message"
```

## Squash commits together

To squash the last n commits into one commit we can use an interactive rebase.  Execute the following command.

```
$ git rebase -i HEAD~n
```

This will then launch an editor instance that contains a list of the last n commits.  We can mark these commits to be
picked, squashed, edited, etc.  To abort the rebase just close the editor without saving any changes to the file.  To
proceed with the rebase, mark the first/top commit (the latest one) as 'p' and all the others as 's'.  Then save the
file and close the editor.  Another editor instance will launch that will allow us to create a new commit message for
the resulting single commit.  Compose the message, save the file and then close the editor.  Job done.

## Stashing

Save the current state of your working directory, and the index, and revert to a clean working directory

```
$ git stash
```

or equivalently ...

```
$ git stash push
```

List all current stashes

```
$ git stash list
```

Apply the latest stashed state back to your working directory but do not remove it from the stash list

```
$ git stash apply
```

Apply the latest stashed state back to your working directory and remove it from the stash list

```
$ git stash pop
```

Clear the stash list

```
$ git stash clear
```

## Branching

Create a branch.  Note that this just creates the branch, it doesn't automatically make if the current branch.

```
$ git branch <branch-name>
```

Switch to a branch

```
$ git checkout <branch-name>
```

Delete a branch

```
$ git branch -d <branch-name>
```

List all branches

```
$ git branch --list
```

or equivalently ...

```
$ git branch
```

List all remote branches

```
$ git branch --list -r
```

or equivalently ...

```
$ git branch -r
```

Delete a remote branch

```
$ git branch -d -r <branch-name>
```
