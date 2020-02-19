---
layout: faq
title: Tmux
sub_title: 
faq: true
---

## Installation

```
$ sudo apt-get install tmux
```

## Config

I use Electric Buffer List in emacs and bind it to `C-x C-b`.  The default tmux command prefix keybinding of `C-b`
messes with this and so I have to change it.  I do this in `~/.tmux.conf` like so ...

```
unbind C-b
  set -g prefix C-t
```

## Usage

Connect to a Linux host using SSH from PuTTY.  Run ...

```
$ tmux
```

... to create the initial session and then just use Linux.

When I want to disconnect, just close PuTTY, do NOT type `exit` to leave the shell session since that will close the
virtual terminal that tmux has created.  This protects my work from network issues, my Linux session will persist if
I disconnect.  To recover the session I just need to reconnect to the host and then type ...

```
$ tmux a
```

... to reattach to the virtual terminal.

Tmux can do a lot more but the immediate benefit is the protection from a flaky network.
