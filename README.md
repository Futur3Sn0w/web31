# Web31 - Windows 3.1 Recreated in CSS+JS
A pixel-for-pixel recreation of Windows 3.1- in design AND functionality- using web technologies. Utilizing real Windows assets, and carefully inspecting hundreds of sample screenshots and real Windows emulators, I've created what I hope is a faithful representation of what it was like to use Windows 3.1.  

<img src="https://github.com/user-attachments/assets/d38341a4-ab3b-4616-a89c-27f83cc793be" width="640" />

## Using Web31
As of writing, Web31 starts right to the Program Manager. As it's still fairly early in the process, there aren't a ton of 'programs' yet, but I've already added 3 games, some accessories, and the Desktop control panel applet which allows you to change the wallpaper and screensaver. If an app, game, or setting you're looking for isn't here yet, let me know, or give it some time and it might be added!  
<img width="508" src="https://github.com/user-attachments/assets/cd37167f-460c-4628-a8da-863f50809ee7" />
<img width="492" src="https://github.com/user-attachments/assets/609c1ea4-5930-4491-8886-6f6243911aa6" />
<img width="497" src="https://github.com/user-attachments/assets/61b601ee-fd58-40e8-8a7e-ff5d21d9dbba" />
<img width="509" src="https://github.com/user-attachments/assets/e36604ca-ca8d-415b-8fb3-2ae259e2040f" />


## Interpreting Windows
Windows 3.1 was software built using technology from over 30 years ago as a way to interact directly with hardware. Working on the web presents a unique challenge, and opportunity, for translating ideas from Windows for use on the web. Rather than emulating or even simulating in the traditional sense, my intent is to interpret Windows 3.1 in a way that utilizes web technologies as it’s backend.

### The "Registry"
My favorite example of this is the Registry Editor. Windows wouldn’t have the same Registry Editor we know today until NT, when RegEdit32, as it was known, was added. It was quite a bit more advanced (both visually and under-the-hood) as its intended usage was dramatically overhauled with NT versions. The new RegEdit32 wouldn't come bundled into Mainline/Home Windows until Windows XP, when it would finally supersede the legacy RegEdit.  

The real data found in the Windows registry is ... not quite the same as the web version (for some obvious reasons, some not so obvious). So, in my interpretation, I structured the site's usage of localStorage to be visually similar to what could be found in Windows. Although the data cannot be changed from the ‘program’, the visual (and even *some* of the functional) aspect remains. This includes a (sub)folder/tree view, expanding 'hives' to navigate the database, name/type/data display, and a real representation of the site’s settings and configuration (HKEY_LOCAL_STORAGE), the directories of the “programs” (HKEY_LOCAL_SOFTWARE), and “CPLs” (HKEY_LOCAL_CONFIG) of the site, so you can actually see some of it’s innerworkings in a functionally and visually similar way to Windows.

<img src="https://github.com/user-attachments/assets/a3ad5693-9861-4f5f-a02d-e07ad89b2fa6" width="640" height="auto" />

### Inspiration
Back in the early 2000s and into the early 2010s, there was a (now defunct) site that recreated Windows 3.1 using web technology, and in a damn good way. If you're interested in Web31, you may remember MichaelV.org, the inspiration for this project. The functionality was nearly spot-on, and it always filled me with joy and wonder to see such a [barrierless](https://www.oed.com/dictionary/barrierless_adj?tl=true) way to experience retro Windows. I realized as I got older how the design differed from the original OS, but how spot-on the functionality was. After many years of learning and practicing web development, I decided to take a run at making my own version of the idea.

<hr>

### Will return after this break....
