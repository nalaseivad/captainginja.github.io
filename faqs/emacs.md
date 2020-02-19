---
layout: faq
title: Emacs
sub_title: The one true editor!
faq: true
---

## Editing bash scripts in emacs

[sh-mode](https://www.emacswiki.org/emacs/ShMode) (aka shell-script-mode) is the default minor mode for editing Bash
scripts.  The [source](https://github.com/emacs-mirror/emacs/blob/master/lisp/progmodes/sh-script.el) is on GitHub.

On my Ubuntu 18.04 install this is implemented in this file ...

```
/usr/share/emacs/25.2/lisp/progmodes/sh-script.elc
```

This mode should autoload when editing .sh files.

### Customization

Indentation is controlled by various variables.  After much experimentation I have found that this is the magic
incantation that I need in my .emacs file in order to have bash scripts indented the way I like ...

```
(custom-set-variables
 ;; ...

 ;; sh-mode
 '(sh-basic-offset 2)
 '(sh-indentation 2)
 '(sh-indent-after-continuation 'always))

 ;; ... 
)
```

It seems that I need to set both `sh-basic-offset` and `sh-indentation` in order to achieve my desired indent across
all situations in a script.

The last line is critical in order to ensure that I always have two space indenting after the line continuation
character, e.g. ...

```
docker run \
  --rm \
  --name prometheus \
  -d \
  -p 9090:9090 \
  prom/prometheus
```

The default behavior is for the first continuation line to be indented to line up with the first non-space character
in the first line, i.e. like this ...

```
docker run \
       --rm \
       --name prometheus \
       -d \
       -p 9090:9090 \
       prom/prometheus
```
