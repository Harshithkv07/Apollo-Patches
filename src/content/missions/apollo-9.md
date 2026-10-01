---
mission: Apollo 9
number: 9
tagline: First flight of the lunar module
patch: ../../assets/patches/apollo-9.webp
patchAlt: A Saturn V rocket stands at the left of a mottled blue field. A yellow orbit line curves from it past a command and service module and a lunar module. The names McDivitt, Scott and Schweickart arc across the top, with a red D, and APOLLO IX runs along the bottom, inside a red border.
patchSource:
  id: S69-18569
  url: https://images.nasa.gov/details/S69-18569
launch: 1969-03-03
splashdown: 1969-03-13
callsigns:
  csm: Gumdrop
  lm: Spider
crew:
  - name: James A. McDivitt
    role: Commander
  - name: David R. Scott
    role: Command Module Pilot
  - name: Russell L. Schweickart
    role: Lunar Module Pilot
designers:
  - Allen Stevens, North American Rockwell
lettering:
  - McDIVITT SCOTT SCHWEICKART
  - APOLLO IX
  - USA
namesOnPatch: true
shape: circle
composition: >-
  A mottled blue field inside a thin red border. A Saturn V rises along the left
  edge. A yellow orbit line swings out from it and around, past a command and
  service module and a lunar module flying apart in the middle. The crew's
  names arc across the top and APOLLO IX runs along the bottom, all in big white
  capitals.
colors:
  - name: Border Red
    hex: '#e70603'
  - name: Field Blue
    hex: '#0462a6'
  - name: Deep Blue
    hex: '#034b6c'
    note: The darker mottle in the field
  - name: Black
    hex: '#020404'
  - name: White
    hex: '#fafdfb'
  - name: Orbit Yellow
    hex: '#efd30f'
iconography:
  - id: saturn-v
    symbol: Saturn V
    denotes: the launch vehicle
    note: It stands at the left, lettered USA.
    hotspot:
      polygon: 215,80 235,80 250,200 265,250 265,720 290,760 295,835 150,835 155,760 185,720 185,250 205,200
  - id: csm
    symbol: Command and service module
    denotes: the command module, call sign Gumdrop
    hotspot:
      polygon: 410,320 450,295 520,320 580,345 625,390 620,440 565,460 520,450 460,400 415,350
  - id: lm
    symbol: Lunar module
    denotes: the first crewed flight of the spacecraft that would land on the Moon
    note: NASA's description has it orbiting near the command module. Its call sign was Spider.
    hotspot:
      polygon: 565,545 610,520 690,470 730,445 780,500 785,560 760,610 780,690 750,705 700,640 660,620 640,590 570,580
  - id: orbit
    symbol: Orbit line
    denotes: the flight path in Earth orbit
    note: It links the rocket to both spacecraft.
    hotspot:
      polygon: 409,277 335,243 255,243 178,284 132,342 115,420 131,507 173,591 236,664 319,736 422,793 545,834 669,855 785,849 857,801 870,719 849,642 822,599 788,621 811,658 830,721 823,779 775,811 671,815 555,796 438,757 341,704 264,636 207,569 169,493 155,420 168,358 202,316 265,281 325,281 391,313
  - id: red-d
    symbol: Red D
    denotes: the D mission
    note: Apollo 9 was the D mission in NASA's lettered sequence of test flights, the one that tried out the lunar module in Earth orbit.
    hotspot:
      polygon: 50,462 102,462 102,530 50,530
construction:
  bands:
    - name: Red border
      outer: 1
      inner: 0.957
    - name: Dark keyline
      outer: 0.957
      inner: 0.948
  features:
    - kind: arc
      label: Crew names baseline
      r: 362
      from: -200
      to: 20
      cap: 100
      capToward: rim
    - kind: arc
      label: APOLLO IX baseline
      r: 455
      from: 122
      to: 60
      cap: 100
      capToward: center
    - kind: line
      label: Saturn V axis
      segments:
        - [225, 85, 225, 835]
  notes:
    - The lettering is big. Both the names and the title have a cap height of about a tenth of the diameter.
    - The Saturn V stands upright, three-quarters of the diameter tall, just over a quarter of the diameter left of center.
    - The red border is thin, about 0.02 D on each side.
sources:
  - title: Emblem – Apollo 9 Space Mission (S69-18569)
    publisher: NASA Image and Video Library
    url: https://images.nasa.gov/details/S69-18569
  - title: Apollo 9 mission overview
    publisher: NASA
    url: https://www.nasa.gov/mission/apollo-9/
  - title: Apollo Mission Patches
    publisher: NASA Science
    url: https://science.nasa.gov/resource/apollo-mission-patches/
  - title: The man behind the moon mission patches
    publisher: collectSPACE
    url: https://www.collectspace.com/news/news-052008a-stevens-man-behind-apollo-mission-patches.html
  - title: Apollo 9 Mission Patch
    publisher: National Space Centre, Leicester
    url: https://www.spacecentre.co.uk/collections/categories/space-memorabilia/apollo-9-mission-patch/
review:
  - Allen Stevens's credit comes from collectSPACE, not NASA.
  - The meaning of the red D comes from the National Space Centre, not NASA.
---

Apollo 9 was the first flight of the complete set of Apollo hardware and the first flight of the lunar module. For ten days in Earth orbit, from 3 to 13 March 1969, Jim McDivitt, Dave Scott and Rusty Schweickart put the lunar module, *Spider*, through its first crewed tests alongside the command module, *Gumdrop*.

The emblem lays out the whole stack. In NASA's description, the lunar module orbiting near the command module stands for the first piloted flight of the spacecraft that would take people to the Moon, with the Saturn V at the left.

According to collectSPACE, Allen Stevens of North American Rockwell created the final art, after several versions were turned down.
