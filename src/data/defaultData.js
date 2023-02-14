export function DefaultImages() {
  return [
    {
      folderName: 'Goblins',
      images: [
        {
          url: 'https://legendary-digital-network-assets.s3.amazonaws.com/geekandsundry/wp-content/uploads/2016/11/goblin-step1.png'
        }
      ]
    }
  ];
}

export function DefaultCharacters() {
  return [
    {
      id: 1,
      name: 'Bruenor',
      charClass: 'Fighter',
      background: 'Soldier',
      ac: 18,
      pp: 10,
      pi: 10,
      init: 2,
      sheetUrl: 'https://dndbeyond.com'
    },
    {
      id: 2,
      name: 'Meepo',
      charClass: 'Rogue',
      background: 'Criminal',
      ac: 14,
      pp: 15,
      pi: 13,
      init: 3,
      sheetUrl: 'https://dndbeyond.com'
    }
  ];
}
