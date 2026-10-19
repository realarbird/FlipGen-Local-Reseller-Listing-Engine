// Sample vintage & thrift inventory items for FlipGen

export const SAMPLE_BATCH_ITEMS = [
  {
    id: 'sample-1',
    item_name: 'Vintage 1998 Sony Walkman WM-FX195 Radio Cassette Player',
    condition: 'Good / Gently Used',
    raw_notes: 'Tested with 2 AA batteries. Cassette plays, rewinds, and fast forwards smoothly. AM/FM tuner pulls stations clearly. Battery compartment is clean with zero corrosion. Light surface scuffs on rear casing. Includes original OEM belt clip.',
    price: '48.00',
    cost: '6.00',
    category: 'Vintage Electronics'
  },
  {
    id: 'sample-2',
    item_name: 'Vintage 90s Carhartt Detroit Jacket J97 MOS Moss Green',
    condition: 'Fair / Minor Flaws',
    raw_notes: 'Iconic J97 MOS moss green canvas Detroit work jacket with blanket lining and corduroy collar. Natural sun fade and authentic distressing on sleeves and hem. Heavy duty brass zipper works smoothly. Small paint speckle on left chest, adds genuine vintage patina. Tag size XL, Made in USA.',
    price: '185.00',
    cost: '22.00',
    category: 'Workwear / Outerwear'
  },
  {
    id: 'sample-3',
    item_name: 'Nintendo Game Boy Color Atomic Purple Handheld Console',
    condition: 'Like New / Mint',
    raw_notes: 'Original 1998 CGB-001 transparent purple chassis. Screen lens replaced with glass for scratch-free clarity. Speaker sounds loud and crisp. All buttons (D-pad, A/B, Select, Start) are responsive and tactile. Clean battery contacts. Tested with Tetris DX.',
    price: '89.00',
    cost: '15.00',
    category: 'Retro Gaming'
  },
  {
    id: 'sample-4',
    item_name: 'Nike Dunk Low Retro Panda White Black 2021 Size 10.5',
    condition: 'Like New / Mint',
    raw_notes: 'Men\'s US Size 10.5 (DD1391-100). Worn twice indoors only. Stars on outsole fully intact, minimal to zero creasing on toebox. Insole logos 100% visible. Replacement laces included, original box included with minor shelf wear.',
    price: '115.00',
    cost: '40.00',
    category: 'Sneakers / Footwear'
  },
  {
    id: 'sample-5',
    item_name: 'Vintage Pyrex Gooseberry Cinderella Mixing Bowls Set of 4 (441-444)',
    condition: 'Good / Gently Used',
    raw_notes: 'Complete 4-piece nesting set (441, 442, 443, 444) from 1957. Pink on white and white on pink gooseberry vine pattern. High gloss shine, zero dishwasher etching. Minor pinprick scratches when held to light on the 444 bowl. Handles intact without chips or flea bites.',
    price: '145.00',
    cost: '18.00',
    category: 'Vintage Kitchen / Collectibles'
  }
];

export const PRESET_ITEMS = [
  {
    label: '📻 Vintage Electronics',
    name: 'Vintage 1998 Sony Walkman WM-FX195',
    condition: 'Good / Gently Used',
    price: '48.00',
    cost: '6.00',
    notes: 'Tested working with cassette & AM/FM radio. Clean battery bay, light surface scuffs on rear, includes original belt clip.'
  },
  {
    label: '🧥 Thrift Workwear',
    name: 'Vintage Carhartt Detroit Jacket J97 MOS',
    condition: 'Fair / Minor Flaws',
    price: '185.00',
    cost: '22.00',
    notes: 'Made in USA. Authentic blanket lined, corduroy collar. Natural fade, minor sleeve wear and small paint flecks. Tag size XL.'
  },
  {
    label: '🎮 Retro Gaming',
    name: 'Nintendo Game Boy Color Atomic Purple',
    condition: 'Like New / Mint',
    price: '89.00',
    cost: '15.00',
    notes: 'New scratch-resistant glass lens. Clean battery contacts, crisp loud sound, responsive tactile buttons. 100% authentic OEM shell.'
  },
  {
    label: '👟 Sneaker Flip',
    name: 'Nike Dunk Low Retro Panda Size 10.5',
    condition: 'Like New / Mint',
    price: '115.00',
    cost: '40.00',
    notes: 'Worn twice indoors. Full outsole stars, zero heel drag, pristine toebox. Comes with original box.'
  }
];

export const SAMPLE_CSV_CONTENT = `item_name,condition,raw_notes,price
"Vintage 1998 Sony Walkman WM-FX195 Radio Cassette Player","Good / Gently Used","Tested with 2 AA batteries. Cassette plays rewinds and fast forwards. AM/FM tuner works. Clean battery contacts. Light scratches on rear. Includes belt clip.",48.00
"Vintage 90s Carhartt Detroit Jacket J97 MOS Moss Green","Fair / Minor Flaws","Iconic J97 MOS moss green canvas blanket lined corduroy collar. Natural sun fade and authentic distressing. Heavy duty brass zipper. Made in USA Size XL.",185.00
"Nintendo Game Boy Color Atomic Purple Handheld Console","Like New / Mint","Original 1998 CGB-001 transparent purple chassis. Glass lens replacement. Speaker loud and crisp. Clean battery terminals.",89.00
"Nike Dunk Low Retro Panda White Black 2021 Size 10.5","Like New / Mint","Mens US 10.5 DD1391-100. Worn twice indoors only. Stars intact no creasing on toebox. Original box included.",115.00
"Vintage Pyrex Gooseberry Cinderella Mixing Bowls Set of 4","Good / Gently Used","Complete 4-piece set 441-444 from 1957. Pink/white gooseberry pattern. Glossy shine zero dishwasher haze. No chips or cracks.",145.00
`;
