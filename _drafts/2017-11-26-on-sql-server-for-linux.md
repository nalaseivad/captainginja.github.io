---
layout: post
title: "On SQL Server for Linux"
sub_title: "This is the sub title"
featured_image:
featured_image_alt_text: "Alt text"
featured_image_title: "image title"
featured_image_width: 450
---

When SQL Server runs on Linux it thinks it’s running on Windows. It runs in a platform abstraction layer and actually runs the same binaries as in Windows. And the distribution actually includes the binaries for many other Windows DLLs and EXEs that are also exactly the same images as in Windows. They are all loaded into the same process space in Linux and all the calls are marshaled by the SQLPAL. It even has its own proxy call stacks to handle the differences in calling convention in the Windows and Linux ABIs. I’ve not yet decided whether this is one almighty hack or absolute genius. I’m leaning towards the latter.

This is all possible of course since Windows and Linux, in the main, target the same Intel CPUs, so absent different image header formats (PE vs ELF), the actual machine code is the same

https://blogs.technet.microsoft.com/dataplatforminsider/2016/12/16/sql-server-on-linux-how-introduction/
https://blogs.msdn.microsoft.com/slavao/2005/07/20/platform-layer-for-sql-server/
https://www.microsoft.com/en-us/research/project/drawbridge/
https://techcrunch.com/2016/03/07/microsoft-is-bringing-sql-server-to-linux/
https://arstechnica.com/information-technology/2016/03/sql-server-for-linux-coming-in-mid-2017/
https://arstechnica.com/information-technology/2016/12/how-an-old-drawbridge-helped-microsoft-bring-sql-server-to-linux/
http://www.zdnet.com/article/review-sql-server-2017-adds-python-graph-processing-and-runs-on-linux/
https://blogs.msdn.microsoft.com/slavao/2016/12/20/sql-server-on-linux-aka-project-helsinki-story-behind-the-idea/

