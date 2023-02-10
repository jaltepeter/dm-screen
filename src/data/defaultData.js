export default function DefaultData() {
  return {
    images: [
      {
        folderName: 'Goblins',
        images: [
          'https://legendary-digital-network-assets.s3.amazonaws.com/geekandsundry/wp-content/uploads/2016/11/goblin-step1.png'
        ]
      }
    ],
    characters: [
      {
        id: 1,
        name: 'Bruenor',
        charClass: 'Fighter',
        background: 'Soldier',
        ac: 18,
        pp: 10,
        pi: 10,
        init: 2
      }
    ]
  };
}
