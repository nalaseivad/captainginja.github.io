---
layout: post
title: "On Tech Conferences"
sub_title: "Where the beautiful people hang out"
featured_image: /images/wind_power_conference.png
featured_image_alt_text: "Wind Power Conference"
featured_image_title: >
  But soft, what rancid flatulence through yonder window breaks.  If it is the east, well then I’m heading west.
featured_image_width: 450
featured_image_link: https://www.youtube.com/watch?v=R6dm9rN6oTs&t=22
tags: [me, sql, conferences]
---

For some time now I've wanted to attend a big tech conference.  Part of the motivation was to attend a large event but
the main part was to be exposed to a concentrated collection of information and learning opportunities.  I finally
managed to remember to bring a proposal to my employer and I got approval to attend the 2017
[PASS Summit](http://www.pass.org/AttendanEvent/Conferences/PASSSummit.aspx) in Seattle in November.

PASS is the Professional Association for SQL Server.  It's a community organization for users of the Microsoft Data
Platform (SQL Server and related technologies) that "facilitates member networking and the exchange of information
through local groups, online events, local/regional events and international conferences", or so their blurb says.
They hold an international summit each year, typically in Seattle, which is sponsored by Microsoft and other vendors of
tools and technologies related to the Microsoft Data Platform.  This was the event that I was going to attend.

The main conference was held over three days (Wed-Fri) but there were two days of pre-conference events to be held on
the Monday and Tuesday as well.  On these days one could attend a full day focused seminar on various topics.  Since I
was going to be flying all the way from New York to Seattle for this thing I thought that I may as well make the most of
it and booked myself into the pre-conference sessions as well.

PASS has historically been a conference for [DBAs](https://en.wikipedia.org/wiki/Database_administrator),
[Data Architects](https://en.wikipedia.org/wiki/Data_architect) and
[BI](https://en.wikipedia.org/wiki/Business_intelligence) ([an oxymoron?](https://twitter.com/managerspeak))
professionals.  More recently though they have been trying to include developers in their ranks and the tracks on offer
at the summit (and pre-conference) reflected that.  I chose to attend a full day on "Modern Web API Design" on Monday
and another full day on "Entity Framework" (the Microsoft full-fat
[ORM framework](https://en.wikipedia.org/wiki/Object-relational_mapping)) on the Tuesday.  The Tuesday session was
ultimately cancelled due to the fact that the presenter's inbound flight was cancelled due to bad weather on the East
Coast and I ended up attending a full day workshop on "Expert Performance Tuning" instead.

These pre-conference sessions were interesting  and well attended but come the first day of the main conference (on
Wednesday) I realized just how many people were actually going to attend this thing; literally thousands.  The event was
held at the Washington State Conference Center in downtown Seattle, a huge facility that we took over for the week.
Catering for this many people was a military exercise and the food was about as good as you would expect.  I suffered
the breakfast buffet for a few days before I finally gave it up and just grabbed some good coffee (this was Seattle
after all) and pastries in the hotel each morning.

One other colleague from work was attending the conference with me but we were exploring different tracks and although
we did reconnect regularly our paths didn't cross too much.  Every session, meal and coffee break was an opportunity to
meet other SQL Server professionals and users and meet them I did, many of whom were deeply knowledgeable.  It was a
truly international event with a big European contingent and I met people from the UK, Denmark, Sweden, France & Germany
as well as all across the US.  As expected, the attendees were predominently DBAs but I did meet a fair share of fellow
developers as well.

I must say though that sterotypes aside the PASS [Massive](https://www.urbandictionary.com/define.php?term=massive) was
an eclectic mix of people with [impressive diversity](/images/tech_conference_restrooms.png), overwhelmingly of
[rude health](/images/buff_geek.png) and [sartorial good taste](/images/brent_ozar_mullet_wig.jpg).  The
[beards](/images/dba_beard.jpg) though ... what can I say?  Hirsuite is not a sufficiently descriptive word.

During the main conference there was a "keynote" presentation each morning followed by a series of roughly one hour long
presentations running in sixteen parallel tracks.  At any time you had a choice of sixteen things to see; a lot of
content to choose from.  The presentations were all delivered by members of the PASS community and on the whole were not
marketing pieces for related products and tools, which can be the case at some conferences.  Most of the sessions were
interesting and useful to me and only a few were disappointing.  Clearly I only managed to experience a sixteenth of the
material that was on offer but I should be able to access slides and recordings of all of the presentations in due
course.  It was definitely worth my time to attend, although I'm glad that I wasn't the one paying for the flights,
hotel and conference fee ...

Of course, Microsoft are the largest sponsor of this event and I would say that it is the biggest single conference for
SQL Server that there is, although there are bigger conferences for Microsoft technologies in general, and for Microsoft
platform developers in particular (Ignite, Build, etc.).  As such there were some significant new releases for the
Microsoft data platform that were showcased during the week, SQL Server 2017 in particular.  In addition to several new
features, the 2017 release of SQL Server brings full(ish) support for Linux as a platform and there were some
fascinating presentations on the details of how that port was achieved.  Psst: It wasn't a port.  More on that in
another blog post.

Here are some of my takeaways from the summit experience.

# Notable Quotes

"If you want the data model to be simple then go out and make the world simple, then come back to me"

"SQL Server does key-value, it's just a table with two columns"

# Notable presentations

Hacking SQL Server

* Of course you should protect against SQL Injection attacks
* Encrypt your connections and use certificates to authenticate servers in order to prevent man in the middle attacks
  and TDS inspection/injection
* Divide by zero exceptions can facilitate some clever brute force attacks against encrypted data.  If you know the
  types of the fields in a table (and if I recall correctly the system tables are not encrypted so you can query for
  them) then you can create successive queries of the form `SELECT 1 / (testValue - fieldName) FROM tableName` that
  explore the space of possible values of each field and wait until you get a divide by zero exception.  Once you do
  then you know that the field value is equal to `testValue`.

Data Architecture and NoSQL

* Data models still matter in the NoSQL world
* There is no schemaless data
* Data patterns have existed for a long time and are just as relevant today, it's just that now we have more database
  systems within which to express them, especially true graph databases

Lightweight ORMs

* Entity Framework is not the only game in town when it comes to ORMs for C#.  Dapper is simple (based on POCOs),
  lightweight and fast.  I will be giving it a try.

SQL Server Service Broker

* It has a bad rep and is not "cool"
* However it is very powerful and has a legitimate tool in many workflows
* We should all keep it in our toolboxes

SQL Server Client Tools

* There's a new Electron-based (i.e. like VS Code) cross-platform client app for SQL Server called
  [SQL Server Operations Studio](https://docs.microsoft.com/en-us/sql/sql-operations-studio/what-is).  It's not fully
  featured but is featured enough, lightweight and fast.  It's a real alternative to SSMS for general querying and
  database management.

SQL Server on Linux

* Works and works well.  It's the same binaries that run on Windows.
* When SQL Server runs on Linux it thinks it's running on Windows
* It installs simply and quickly.  Far quicker than the install on Windows ...
* Performance is basically the same
* You can run it in Docker and that makes for a very compelling DevOps story for dev/testing
* I wouldn't consider running it in prod right now (HADR is not so rubust yet) but the Docker use case is fascinating
  and I will definitely be looking at that for dev/test

# Notable Unplanned Events

Bob Ward (Principal SQL Server Architect at Microsoft) was in the middle of his presentation on how they conceieved of,
and delivered, a version of SQL Server that runs on Linux when his laptop started installing automatic updates for
Windows which couldn't be cancelled.  It then proceeded to reboot (several times) while it proceeded with the update.
His presentation was completely hosed and morphed into a (still very interesting) Q&A session.  I must say that he
handled the whole affair with some grace.

Later I found this Haiku which I profer in his honor ...

![Windows Update Haiku](/images/windows_update_haiku.jpg)

# Random Observations

On the PASS Summit ...

* I am not old relative to the DBA community but there are a bunch of super smart and really knowledgeable people out
  there who are a lot younger than me.  So ... I still feel old.
* Brent Ozar is a funny dude; and he is the [Stig](/images/brent_ozar_stig.jpg).
* [Erland Sommarskog](http://www.sommarskog.se/) may write very informative articles but, in person, he's pretty dull.
  Sorry Erland.
* All .Net/ C# references I saw were to .Net Core and all demos were using VS Code and .Net Core.  It's the future.
* I didn't win any of the vendor raffles.  Life is so unfair.
* Why does a conference of this size only choose to lay on coffee stations in the morning and at lunch?!?  Don't they
  understand that tech workers need regular cafination in order to function?

On Seattle ...

* It has cool out of the way jazz restaurants
* It has great dive bars that play great music
* It has great coffee
* And I thought London had a lot of [Hipsters](/images/hippies_use_side_door.jpg)
* It has great [craft beer](/images/seattle_beer.jpg)
* It's very [progressive](/images/gender_neutral_restrooms.jpg)
