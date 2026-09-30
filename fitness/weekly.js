/* ============================================================================
   WEEKLY: the two lists you update each week, and nothing else.

   The Pilates site (fitness/) and the Instagram link page (quickbio/) both load
   this file before their own scripts, so one edit here updates both. Mind the
   commas between entries: a typo here keeps the playlists and Mega Moves from
   showing until it is fixed.
   ============================================================================ */

/* ============================================================================
   PLAYLISTS

   Add each new week to the END, newest last, and move `latest: true` onto it.
   `fav: true` marks a clients' favorite. Weeks you skip show as gaps on the
   rail, so the spacing stays honest. The hero's Latest Playlist button and
   quickbio's Recent and Favorite lists read from this list too, so there is
   nothing else to update.

   Dates are automatic. Week 15 was the week of Monday 07/13/26 (counted back
   from SLT #26 on 09/28/26) and each number after it is one week later, so the
   rail labels itself MM/DD/YY. If a playlist ever lands on a different week
   than its number says, give it its own:  date: "2026-07-20"

   The Apple Music player for each week is built from its url, so there is no
   embed code to paste. It follows the site's light/dark theme on its own.
   ============================================================================ */
var JC_PLAYLIST_WEEK_ONE = { week: 15, monday: "2026-07-13" };

var JC_PLAYLISTS = [
  {w:15, name:"SLT #15",   url:"https://music.apple.com/us/playlist/slt-15/pl.u-2aoqMJyiLgWgLJ", fav:true},
  {w:16, name:"SLT #16",   url:"https://music.apple.com/us/playlist/slt-16/pl.u-kv9l4EdtW8V8W9"},
  {w:17, name:"SLT #17",   url:"https://music.apple.com/us/playlist/slt-17/pl.u-gxblqkDTMo0oMD"},
  {w:18, name:"SLT #18",   url:"https://music.apple.com/us/playlist/slt-18/pl.u-2aoqMXesLgWgLJ", fav:true},
  {w:19, name:"SLT #19",   url:"https://music.apple.com/us/playlist/slt-19/pl.u-kv9l4b5FW8V8W9"},
  {w:20, name:"SLT #20",   url:"https://music.apple.com/us/playlist/slt-20/pl.u-KVXBxD3tm3R3m2"},
  {w:21, name:"SLT #21",   url:"https://music.apple.com/us/playlist/slt-21/pl.u-xlyNBBWtpPDPp3", fav:true},
  {w:22, name:"SLT #22v2", url:"https://music.apple.com/us/playlist/slt-22v2/pl.u-WabZ11jUvDlDvr"},
  {w:23, name:"SLT #23",   url:"https://music.apple.com/us/playlist/slt-23/pl.u-oZyl55YI09l90Z"},
  {w:24, name:"SLT #24",   url:"https://music.apple.com/us/playlist/slt-24/pl.u-8aAVMMeSaKLKaP"},
  {w:25, name:"SLT #25",   url:"https://music.apple.com/us/playlist/slt-25/pl.u-xlyNBylIpPDPp3"},
  {w:26, name:"SLT #26",   url:"https://music.apple.com/us/playlist/slt-26/pl.u-oZyl5yWI09l90Z", latest:true}
];

/* ============================================================================
   MEGA MOVE MONDAY: paste each Monday's Instagram link here, newest last.

   Each entry needs a url. `move` is the name shown on the card, and `date` is
   the Monday it went up, written YYYY-MM-DD. `clip` is optional: a short,
   silent copy of the video in fitness/media/ that autoplays on the card, so
   visitors see you doing the move before they tap through (Recipe 7 in
   EDITING.md has the one-line command to make it). Leave the list empty and the
   row shows four placeholders dated with the coming Mondays; every entry you
   add takes over one of them. Once four are filled, one card for next Monday
   always stays at the end.

   An entry with a move and a date but no url yet shows as a named placeholder,
   if you want to tease the next one.

   Example:
     { date: "2026-10-05", move: "Spider Kick",
       url: "https://www.instagram.com/reel/XXXXXXXXXXX/",
       clip: "media/mmm-2026-10-05.mp4" },
   ============================================================================ */
var JC_MEGA_MOVES = [
];
