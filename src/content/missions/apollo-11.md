---
mission: Apollo 11
number: 11
tagline: First crewed lunar landing
patch: ../../assets/patches/apollo-11.webp
patchAlt: A bald eagle with an olive branch in its talons lands on the cratered Moon, with Earth in a black sky and "APOLLO 11" arched above, inside blue and gold rings.
patchSource:
  id: S69-34875
  url: https://images.nasa.gov/details/S69-34875
launch: 1969-07-16
splashdown: 1969-07-24
callsigns:
  csm: Columbia
  lm: Eagle
crew:
  - name: Neil A. Armstrong
    role: Commander
  - name: Michael Collins
    role: Command Module Pilot
  - name: Edwin E. “Buzz” Aldrin Jr.
    role: Lunar Module Pilot
designers:
  - Michael Collins, with the crew
  - Eagle suggested by Jim Lovell
  - Olive branch suggested by Tom Wilson
lettering:
  - APOLLO 11
namesOnPatch: false
shape: circle
composition: >-
  A circular field of black space inside a blue ring and a gold border. An eagle
  comes in to land on the cratered lunar surface, an olive branch held in its
  talons. Earth hangs in the upper left and APOLLO 11 arcs across the top. The
  crew's names are not on it.
colors:
  - name: Border Gold
    hex: '#e6be64'
    note: Border ring and lettering
  - name: Keyline Blue
    hex: '#0269a9'
  - name: Space
    hex: '#010302'
  - name: Eagle Brown
    hex: '#6b3424'
  - name: Talon Gold
    hex: '#d1a157'
  - name: Lunar White
    hex: '#f5efef'
  - name: Earth Blue
    hex: '#3c6e9c'
  - name: Olive Green
    hex: '#084c4a'
iconography:
  - id: eagle
    symbol: Bald eagle
    denotes: the United States
    note: Backup commander Jim Lovell suggested it. Collins traced the bird from a National Geographic book. The lunar module flew as Eagle.
    hotspot:
      polygon: 262,470 330,455 350,440 400,415 470,415 490,430 540,330 580,290 640,260 800,235 870,295 860,330 835,390 790,420 740,440 690,480 660,540 650,580 690,620 690,660 640,690 580,720 520,740 510,790 470,790 420,780 370,770 360,740 400,700 330,720 300,730 270,660 255,560
  - id: olive-branch
    symbol: Olive branch
    denotes: a peaceful expedition
    note: Tom Wilson's idea. It moved from the beak to the talons so the landing would look less warlike.
    hotspot:
      polygon: 285,735 360,725 480,735 560,740 630,755 625,782 540,777 480,797 400,792 330,772 290,762
  - id: earth
    symbol: Earth
    denotes: home
    note: It's shaded on the left. Seen from the Moon, its dark edge would be at the bottom. The mistake was never corrected.
    hotspot:
      circle: [285, 313, 92]
  - id: moon
    symbol: Lunar surface
    denotes: the destination
    note: A cratered plain in realistic greys. No particular landing site is shown.
    hotspot:
      polygon: 100,715 300,700 500,705 700,700 905,705 905,760 880,820 830,880 760,930 680,955 600,965 500,968 400,965 320,955 240,930 170,880 120,820 95,760
  - id: numerals
    symbol: “11”
    denotes: a name anyone can read
    note: Armstrong vetoed spelling out “Eleven” because foreigners might not understand it.
    hotspot:
      polygon: 250,160 300,110 400,75 500,65 600,70 700,100 780,140 760,215 690,185 600,152 500,142 400,152 300,197 268,208
construction:
  bands:
    - name: Stitched edge
      outer: 1
      inner: 0.984
    - name: Gold border
      outer: 0.984
      inner: 0.947
    - name: Black keyline
      outer: 0.947
      inner: 0.941
    - name: Blue ring
      outer: 0.941
      inner: 0.911
  features:
    - kind: arc
      label: Lettering baseline
      r: 365
      from: -127
      to: -48
      cap: 72
      capToward: rim
    - kind: circle
      label: Earth
      cx: 285
      cy: 313
      r: 92
    - kind: line
      label: Lunar horizon
      segments:
        - [95, 705, 905, 705]
  notes:
    - The lunar horizon sits about a fifth of the diameter below center, leaving roughly the top 70% of the field for sky.
    - The lettering follows an arc concentric with the border. Its cap height is about twice the combined width of the gold and blue rings.
    - Earth measures about a fifth of the field's diameter.
sources:
  - title: The Making of the Apollo 11 Mission Patch
    publisher: NASA, via Google Arts & Culture
    url: https://artsandculture.google.com/story/the-making-of-the-apollo-11-mission-patch-nasa/nwURVwusFJUoJg
  - title: Official Emblem – Apollo 11 (S69-34875)
    publisher: NASA Image and Video Library
    url: https://images.nasa.gov/details/S69-34875
  - title: Apollo 11 mission overview
    publisher: NASA
    url: https://www.nasa.gov/mission/apollo-11/
  - title: Apollo Landing Sites and spacecraft names
    publisher: NASA Space Science Data Coordinated Archive
    url: https://nssdc.gsfc.nasa.gov/planetary/lunar/apolloloc.html
---

Apollo 11 launched on 16 July 1969. Four days later Neil Armstrong and Buzz Aldrin landed the lunar module *Eagle* on the Moon while Michael Collins orbited overhead in *Columbia*. The crew splashed down on 24 July.

Collins drew the emblem. Jim Lovell, the backup commander, suggested making an eagle the centerpiece. Collins found one in a National Geographic book, *Water, Prey, and Game Birds of North America*, and traced it onto tissue paper. Tom Wilson, a computer expert and simulator instructor, proposed an olive branch as a symbol of a peaceful expedition.

Collins first put the branch in the eagle's beak, with the talons reaching for the surface. NASA's Bob Gilruth objected that the extended talons looked too hostile and warlike, so the branch moved down into the talons.

The crew left their names off so the emblem would represent everyone who had worked toward a lunar landing. Armstrong also ruled out spelling the number as a word, which foreigners might not understand, so the patch reads APOLLO 11 in numerals.
