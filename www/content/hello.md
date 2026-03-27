---
title: hello
date: 2023-02-26
---

i've always had some sort of homepage. it was originally on bebo, then that died and i didn't ever get into other social media, so i made a website

i kept my last site updated for years, but every time i updated it i also ended up tacking on features i liked, and ultimately it became a mess. over the last year or two i spent more time fixing issues rather than doing anything that was actually interesting to me, so i decided it should be put down in favour of a fresh slate

this site is very simple and i've set myself some arbitrary rules for it. i've been doing a lot of php lately and there's been a lot of search param usage there, so i'm using that here. instead of lots of different routes, i want to have as few pages as i can possibly afford, and anything else has to be done through search params

in terms of routes: there's one massive [index](https://wynne.rs) of everything on the site, and each bit of text gets its own page

:right[anything that takes more than a few seconds to read gets a proper page, and the short stuff, like my [cv](https://wynne.rs/cv.txt), is just a plain txt file]

right now, *just* and *has* are params for filtering—[?just=guestbook](https://wynne.rs/?just=guestbook) hides anything not in the guestbook category, and [?has=hello](https://wynne.rs/?has=hello) hides anything not including "hello"—and *do* does some kind of one-off action, like [?do=random](https://wynne.rs/?do=random) which takes you to a random page or [?do=newest](https://wynne.rs/?do=newest) to go to the newest addition

:left[the [manpage](https://wynne.rs/man.txt) exists as an up-to-date reference for search params and their usage]

and that's it. i don't need anything else to archive things i care about

cheers,
lewis x
