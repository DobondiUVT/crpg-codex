/*
 * The CRPG Codex — catalogue
 * Adapted from the r/CRPG recommendations wiki.
 *
 * Each line: Title | Released | Platforms | Note
 * Platform names are normalised on load (see platformAliases below).
 * Cover art is stored at assets/covers/<id>.jpg.
 */
(function () {
  const raw = `
Age of Decadence|2015-10-14|Windows|
Arcanum: Of Steamworks and Magick Obscura|2001-08-21|Windows|
ATOM RPG|2018-12-19|Windows, macOS, Linux, Android, iOS, Nintendo Switch, PlayStation 4, Xbox One, Xbox Series|
ATOM RPG: Trudograd|2021-09-13|Windows, Linux, iOS, Nintendo Switch, PlayStation 4, Xbox One|
Avadon: The Black Fortress|2011-08-17|Windows, macOS, Linux, iOS, Android|
Avadon 2: The Corruption|2013-10-30|Windows, macOS, iOS|
Avadon 3: The Warborn|2016-09-14|Windows, macOS, iOS|
Avernum: Escape from the Pit|2011-12-14|Windows, macOS, iOS, Android|
Avernum 2: Crystal Souls|2015-01-14|Windows, macOS, iOS|
Avernum 3: Ruined World|2018-01-31|Windows, macOS, iOS|
Avernum 4: Greed and Glory|2025-10-22|Windows, macOS|
Avernum 5|2007-12-05|Windows, macOS|
Avernum 6|2009-11-20|Windows, macOS, iOS|
Avernum: The Complete Saga (1–6)|2000-01-02|Windows|Collects the original Avernum 1–6 and Blades of Avernum.
Baldur's Gate: Enhanced Edition|2012-11-28|Windows, macOS, Linux, iOS, Android, Nintendo Switch, PlayStation 4, Xbox One|
Baldur's Gate II: Enhanced Edition|2013-11-15|Windows, macOS, Linux, iOS, Android, Nintendo Switch, PlayStation 4, Xbox One|
Baldur's Gate 3|2023-08-03|Windows, macOS, PlayStation 5, Xbox Series|
Banquet for Fools|2026-03-05|Windows, macOS|
Betrayal Collection|1993-06-22|Windows|Includes Betrayal at Krondor and Betrayal in Antara.
Beyond Divinity|2004-04-01|Windows, macOS|
Black Geyser: Couriers of Darkness|2022-03-17|Windows, macOS, Linux|
Broken Roads|2024-04-10|Windows, Nintendo Switch, PlayStation 4, PlayStation 5, Xbox One, Xbox Series|
Caves of Lore|2023-01-21|Windows, macOS, Android|
Colony Ship: A Post-Earth Roleplaying Game|2023-11-09|Windows, macOS, Linux|
Dark Envoy|2023-10-24|Windows, Linux, PlayStation 4, Xbox One|
Dawnsbury Days|2024-03-08|Windows|
Disco Elysium: The Final Cut|2019-10-15|Windows, macOS, Nintendo Switch, PlayStation 4, PlayStation 5, Xbox One, Xbox Series|
Divine Divinity|2002-08-02|Windows, macOS|
Divinity II: Developer's Cut|2012-10-29|Windows, Xbox 360|
Divinity: Original Sin — Enhanced Edition|2014-06-30|Windows, macOS, Linux, PlayStation 4, Xbox One|
Divinity: Original Sin 2 — Definitive Edition|2017-09-14|Windows, macOS, Nintendo Switch, PlayStation 4, Xbox One, iPadOS|
Dragon Age: Origins — Ultimate Edition|2009-11-03|Windows, macOS, PlayStation 3, Xbox 360|
Drakensang|2008-08-01|Windows|
Drakensang: The River of Time|2010-02-19|Windows|
Drova: Forsaken Kin|2024-10-15|Windows, macOS, Linux, Nintendo Switch, PlayStation 4, PlayStation 5, Xbox One, Xbox Series|
Dungeons & Dragons: Dark Sun Series|2022-03-29|Windows|Contains Dark Sun: Shattered Lands and Dark Sun: Wake of the Ravager.
Dungeons & Dragons: Krynn Series|2022-03-29|Windows|Contains Champions of Krynn, Death Knights of Krynn and The Dark Queen of Krynn.
Dungeons & Dragons: Ravenloft Series|2022-03-29|Windows|Contains Ravenloft: Strahd's Possession and Ravenloft: Stone Prophet.
Dungeons of Chaos|2017-09-15|Windows, macOS, Linux, Android|
Dungeon of Dragon Knight|2019-07-10|Windows, macOS|
Elex|2017-10-17|Windows, PlayStation 4, Xbox One|
Elex II|2022-03-01|Windows, macOS, PlayStation 4, PlayStation 5, Xbox One, Xbox Series|
Encased: A Sci-Fi Post-Apocalyptic RPG|2021-09-07|Windows|
Eschalon: Book I|2007-11-17|Windows, macOS, Linux|
Eschalon: Book II|2010-05-12|Windows, macOS, Linux|
Eschalon: Book III|2014-02-14|Windows, macOS, Linux|
Esoteric Ebb|2026-03-03|Windows|
Expeditions: Rome|2022-01-20|Windows|
Expeditions: Viking|2017-04-27|Windows|
Fallout|1997-10-10|MS-DOS, Windows, macOS|
Fallout 2|1998-10-29|Windows, macOS|
Fallout: New Vegas|2010-10-19|Windows, PlayStation 3, Xbox 360|Viva New Vegas is recommended for better handling on modern hardware.
Forgotten Realms: The Archives — Collection One|2022-03-29|Windows|Includes Eye of the Beholder, Eye of the Beholder II: The Legend of Darkmoon and Eye of the Beholder III: Assault on Myth Drannor.
Forgotten Realms: The Archives — Collection Two|2022-03-29|Windows|Contains Pool of Radiance, Curse of the Azure Bonds, Hillsfar, Secret of the Silver Blades, Pools of Darkness, Gateway to the Savage Frontier, Treasures of the Savage Frontier and Forgotten Realms Unlimited Adventures.
Forgotten Realms: The Archives — Collection Three|2022-03-29|Windows|Contains Dungeon Hack and Menzoberranzan.
Geneforge 1 — Mutagen|2021-02-24|Windows, macOS|
Geneforge 2 — Infestation|2024-03-27|Windows, macOS|
Geneforge Saga|2001-12-12|Windows, macOS|Includes Geneforge 1 through 5.
Gothic|2001-03-15|Windows, Nintendo Switch|
Gothic II: Gold Edition|2002-11-29|Windows, Nintendo Switch|
Gothic 3|2006-10-13|Windows|
GreedFall|2019-09-10|Windows, PlayStation 4, PlayStation 5, Xbox One, Xbox Series|
GreedFall: The Dying World|2026-03-10|Windows, PlayStation 5, Xbox Series|
Grimoire: Heralds of the Winged Exemplar|2017-08-04|Windows|
Heroes of the Monkey Tavern|2016-09-22|Windows|
Icewind Dale: Enhanced Edition|2014-10-30|Windows, macOS, Linux, iOS, Android, Nintendo Switch, PlayStation 4, Xbox One|
Icewind Dale II|2002-08-27|Windows|
Islands of the Caliph|2023-09-30|Windows|
Jade Empire: Special Edition|2005-04-12|Windows, macOS, Xbox, Xbox 360, Xbox One, iOS, Android|
Knights of the Chalice|2009-08-10|Windows|
Knights of the Chalice 2|2022-03-25|Windows, macOS|
Lands of Lore 1+2|1993-01-02|Windows, macOS|
Legend of Grimrock|2012-04-11|Windows, macOS, Linux, iOS, Nintendo Switch|
Legend of Grimrock 2|2014-10-15|Windows, macOS|
Legends of Amberland: The Forgotten Crown|2019-08-01|Windows|
Legends of Amberland II: The Song of Trees|2023-12-05|Windows|
Legends of Amberland III: The Crimson Tower|2026-03-02|Windows|
Lionheart: Legacy of the Crusader|2003-08-12|Windows|
Lords of Xulima|2014-11-14|Windows, macOS, Linux|
Mechajammer|2021-12-02|Windows, macOS, Linux|
Might and Magic 6-Pack Limited Edition|1998-04-30|Windows|Includes Might and Magic 1 through 6, Swords of Xeen and Might and Magic VI: The Mandate of Heaven.
Might and Magic VII: For Blood and Honor|1999-01-02|Windows|
Might and Magic VIII: Day of the Destroyer|2000-02-29|Windows|
Might and Magic IX|2002-03-28|Windows|
Might & Magic X — Legacy|2014-01-23|Windows|
Moonring|2023-09-28|Windows, macOS, Nintendo Switch|
Nethergate: Resurrection|2008-03-01|Windows|
Neverwinter Nights: Enhanced Edition|2018-03-27|Windows, macOS, Linux, iOS, Android, Nintendo Switch, PlayStation 4, Xbox One|
Neverwinter Nights 2|2006-10-31|Windows, macOS|
Neverwinter Nights 2: Enhanced Edition|2025-07-15|Windows|Enhanced re-release of the 2006 original.
Nox Archaist|2020-12-12|Windows, macOS|
Operencia: The Stolen Sun|2020-03-31|Windows, Nintendo Switch, PlayStation 4, Xbox One|
Passageway of the Ancients|2024-10-16|Windows, Linux|
Pathfinder: Kingmaker — Enhanced Plus Edition|2018-09-25|Windows, macOS, Linux, PlayStation 4, Xbox One|
Pathfinder: Wrath of the Righteous — Enhanced Edition|2021-09-02|Windows, macOS, Nintendo Switch, PlayStation 4, Xbox One|
Pillars of Eternity|2015-03-26|Windows, macOS, Linux, Nintendo Switch, PlayStation 4, Xbox One|
Pillars of Eternity II: Deadfire|2018-05-08|Windows, macOS, Linux, PlayStation 4, Xbox One|
Planescape: Torment — Enhanced Edition|2017-04-11|Windows, macOS, Linux, iOS, Android, Nintendo Switch, PlayStation 4, Xbox One|
Prince of Qin|2002-08-09|Windows|
Queen's Wish: The Conqueror|2019-09-11|Windows, macOS, iOS|
Queen's Wish 2: The Tormentor|2022-08-24|Windows, macOS, iOS|
Realms of Antiquity: The Shattered Crown|2020-12-29|Windows|
Realms of Arkania 1 — Blade of Destiny Classic|1992-04-30|Windows, Linux, macOS|
Realms of Arkania 2 — Star Trail Classic|1994-09-30|Windows, Linux, macOS|
Realms of Arkania 3 — Shadows over Riva Classic|1996-12-31|Windows, Linux, macOS|
Realms of Arkania: Blade of Destiny|2013-07-30|Windows, macOS, Linux|Remake of the original 1992 game.
Realms of Arkania: Star Trail|2017-08-10|Windows, macOS, Linux, PlayStation 4, Xbox One|Remake of the original 1994 game.
Risen|2009-10-02|Windows, Nintendo Switch, PlayStation 4, Xbox One, Xbox 360|
Risen 2: Dark Waters|2012-04-24|Windows, PlayStation 3, Xbox 360|
Risen 3: Titan Lords|2014-08-12|Windows, PlayStation 3, PlayStation 4, Xbox 360|
Sector Unknown|2026-02-12|Windows|
Serpent in the Staglands|2015-05-28|Windows, macOS, Linux|
Seven: Enhanced Edition|2017-12-01|Windows, PlayStation 4|
Shadowrun Returns|2013-07-25|Windows, macOS, Linux, iOS, Android, Nintendo Switch, PlayStation 4, PlayStation 5, Xbox One, Xbox Series|
Shadowrun: Dragonfall — Director's Cut|2014-02-27|Windows, macOS, Linux, iOS, Android, Nintendo Switch, PlayStation 4, PlayStation 5, Xbox One, Xbox Series|
Shadowrun: Hong Kong — Extended Edition|2015-08-20|Windows, macOS, Linux, Nintendo Switch, PlayStation 4, PlayStation 5, Xbox One, Xbox Series|
SKALD: Against the Black Priory|2024-05-30|Windows, macOS|
Solasta: Crown of the Magister|2021-05-27|Windows, macOS, PlayStation 5, Xbox One, Xbox Series|
Space Wreck|2023-10-10|Windows|
Spelljammer: Pirates of Realmspace|2023-03-27|Windows|
StarCrawlers|2017-05-23|Windows, macOS, Linux|
Star Wars: Knights of the Old Republic|2003-07-16|Windows, macOS, Xbox, iOS, Android, Nintendo Switch|
Star Wars: Knights of the Old Republic II — The Sith Lords|2004-12-06|Windows, macOS, Linux, Xbox, iOS, Android, Nintendo Switch|
Swordhaven: Iron Conspiracy|2025-12-16|Windows, macOS, Linux|
The Bard's Tale Trilogy|2018-08-14|Windows, macOS|Remastered versions of The Bard's Tale: Tales of the Unknown, The Bard's Tale II: The Destiny Knight and The Bard's Tale III: Thief of Fate.
The Bard's Tale IV — Director's Cut|2019-08-27|Windows, macOS, Linux, PlayStation 4, Xbox One|
The Elder Scrolls: Arena|1994-03-25|Windows|
The Elder Scrolls II: Daggerfall|1996-09-20|Windows|Daggerfall Unity, an open-source recreation, is also worth a look.
The Elder Scrolls III: Morrowind — Game of the Year Edition|2002-05-01|Windows, Xbox|
The Temple of Elemental Evil|2003-09-16|Windows|
The Temple of Elemental Evil — Re-Release|2025-12-10|Windows|A 2025 re-release of the 2003 classic.
The Quest|2016-02-19|Windows, macOS, Windows Mobile, Palm OS, Android, iOS|
Torment: Tides of Numenera|2017-02-28|Windows, macOS, Linux, PlayStation 4, Xbox One|
Tyranny|2016-11-10|Windows, macOS, Linux|
Ultima 1+2+3|1989-12-31|Windows, macOS|
Ultima IV: Quest of the Avatar|1985-09-16|Windows, macOS|
Ultima 4+5+6|1985-06-15|Windows, macOS|
Ultima VII: The Complete Edition|1992-04-16|Windows, macOS|
Ultima Underworld 1+2|1992-03-01|Windows, macOS|
Underrail|2015-12-18|Windows, macOS|
Vampire: The Masquerade — Bloodlines|2004-11-16|Windows|
Vaporum|2017-09-28|Windows, macOS, Linux, Nintendo Switch, PlayStation 4, Xbox One|
Vaporum: Lockdown|2020-09-15|Windows, macOS, Linux, Nintendo Switch, PlayStation 4, Xbox One|
Vendir: Plague of Lies|2024-05-30|Windows, macOS, Android, iOS|
Warhammer 40,000: Rogue Trader|2023-12-07|Windows, macOS, PlayStation 5, Xbox Series|
Wasteland 1 — The Original Classic|1988-01-02|Windows, macOS, Linux|
Wasteland Remastered|2020-02-25|Windows, macOS, Linux, Xbox One|
Wasteland 2 — Director's Cut|2014-09-19|Windows, macOS, Linux, Nintendo Switch, PlayStation 4, Xbox One|
Wasteland 3|2020-08-28|Windows, macOS, Linux, PlayStation 4, Xbox One|
Wizardry: Proving Grounds of the Mad Overlord|2024-05-23|Windows, Nintendo Switch, PlayStation 4, PlayStation 5, Xbox One, Xbox Series|A full 3D remake of the original game.
Wizardry 6: Bane of the Cosmic Forge|2013-09-10|Windows, macOS, Linux|
Wizardry 7: Crusaders of the Dark Savant|2013-09-10|Windows, macOS, Linux|
Wizardry 8|2001-11-15|Windows, macOS|
Wizardry: The Five Ordeals|2023-10-26|Windows, Nintendo Switch|
`;

  const platformAliases = {
    'microsoft windows': 'Windows',
    windows: 'Windows',
    'mac os x': 'macOS',
    'mac os': 'macOS',
    'mac operating systems': 'macOS',
    'os x': 'macOS',
    osx: 'macOS',
    mac: 'macOS',
    macos: 'macOS',
    linux: 'Linux',
    'ms-dos': 'MS-DOS',
    dos: 'MS-DOS',
    'nintendo switch': 'Nintendo Switch',
    switch: 'Nintendo Switch',
    'playstation 3': 'PlayStation 3',
    ps3: 'PlayStation 3',
    'playstation 4': 'PlayStation 4',
    ps4: 'PlayStation 4',
    'playstation 5': 'PlayStation 5',
    ps5: 'PlayStation 5',
    xbox: 'Xbox',
    'xbox 360': 'Xbox 360',
    'xbox one': 'Xbox One',
    'xbox series': 'Xbox Series',
    'xbox series x/s': 'Xbox Series',
    'xbox series x and series s': 'Xbox Series',
    ios: 'iOS',
    ipados: 'iPadOS',
    android: 'Android',
    'windows mobile': 'Windows Mobile',
    'palm os': 'Palm OS',
    palm: 'Palm OS',
    'geforce now': null,
  };

  const platformOrder = [
    'Windows', 'macOS', 'Linux', 'MS-DOS',
    'PlayStation 5', 'PlayStation 4', 'PlayStation 3',
    'Xbox Series', 'Xbox One', 'Xbox 360', 'Xbox',
    'Nintendo Switch', 'iOS', 'iPadOS', 'Android', 'Windows Mobile', 'Palm OS',
  ];

  const rank = new Map(platformOrder.map((platform, index) => [platform.toLowerCase(), index]));

  function sanitizePlatforms(value) {
    const seen = new Set();
    return value
      .split(',')
      .map((platform) => platform.trim())
      .filter(Boolean)
      .map((platform) => platformAliases[platform.toLowerCase()] || platform)
      .filter((platform) => {
        if (!platform) return false;
        const key = platform.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => (rank.get(a.toLowerCase()) ?? 99) - (rank.get(b.toLowerCase()) ?? 99));
  }

  function slugify(value) {
    return value
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/['’]/g, '')
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  window.CRPG_GAMES = raw
    .trim()
    .split('\n')
    .map((line) => {
      const [title, released, platforms, note] = line.split('|');
      return {
        id: slugify(title),
        title: title.trim(),
        released,
        year: Number(released.slice(0, 4)),
        platforms: sanitizePlatforms(platforms),
        note: (note || '').trim(),
      };
    });
})();
