---
layout: faq
title: Bash
sub_title: Wham, bam, thank you ma'am
faq: true
---

## Helpful Stuff

`!!` - repeat the command that you last typed.  This is very useful to use with `sudo` if you type a command only to
then realize that you need elevated privs to run it.

```
$ mount /dev/sdb /mnt
mount: only root can do that
$ sudo !!
sudo mount /dev/sdb /mnt
$
```
