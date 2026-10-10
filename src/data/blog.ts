import type { Review } from './products'

export type Post = {
  slug: string
  title: string
  excerpt: string
  date: string
  author: string
  read: number
  tag: string
  cat: string
  body: string[]
  comments: Review[]
}

export const posts: Post[] = [
  {
    slug: 'how-to-style-an-oversized-shirt',
    title: 'How to style an oversized shirt',
    excerpt: 'Three easy ways to wear the loosest piece in your closet without looking lost in it.',
    date: '2026-10-02',
    author: 'Nina Voss',
    read: 4,
    tag: 'Style',
    cat: "Men's Shirts",
    body: [
      'Oversized shirts work best when one other piece is fitted. Pair yours with slim trousers or a tight tee underneath to keep the silhouette balanced.',
      'Roll the sleeves twice, tuck only the front, and add a belt if you want structure. A clean pair of shoes ties the whole look together.',
      'Stick to two or three colors. A bold shirt calls for neutral bottoms, and a neutral shirt is the perfect place to try a loud accessory.',
    ],
    comments: [
      {
        id: 'b1a',
        name: 'Jonas',
        text: 'The front tuck tip changed how I wear my shirts. Thanks!',
        date: '2026-10-04',
        likes: 6,
      },
      {
        id: 'b1b',
        name: 'Amira',
        text: 'Would love a follow up on layering with jackets.',
        date: '2026-10-05',
        likes: 2,
      },
    ],
  },
  {
    slug: 'sneaker-care-guide',
    title: 'The sneaker care guide',
    excerpt: 'Keep your favorite pairs fresh with a five minute routine and two household items.',
    date: '2026-09-24',
    author: 'Leo Marsh',
    read: 5,
    tag: 'Care',
    cat: "Men's Shoes",
    body: [
      'Start by removing laces and insoles. Brush off loose dirt with a soft brush before any water touches the shoe.',
      'Mix a drop of mild soap in warm water and clean the upper in small circles. Wipe with a damp cloth and let the pair dry at room temperature, never on a heater.',
      'Rotate between pairs and use cedar shoe trees to absorb moisture. Your sneakers will last twice as long.',
    ],
    comments: [
      {
        id: 'b2a',
        name: 'Sam',
        text: 'Cedar trees really work. My white pair looks new.',
        date: '2026-09-26',
        likes: 8,
      },
    ],
  },
  {
    slug: 'size-guide-find-your-fit',
    title: 'Find your fit: a simple size guide',
    excerpt: 'Measure once, order with confidence, and skip the return label.',
    date: '2026-09-15',
    author: 'Nina Voss',
    read: 3,
    tag: 'Guides',
    cat: 'Tops',
    body: [
      'Use a soft tape to measure the widest part of your chest and the narrowest part of your waist. Compare the numbers with the size guide on each product page.',
      'If you are between sizes, size up for a relaxed fit and size down for a close fit. Check the fabric: knits stretch, woven cotton does not.',
      'Still unsure? Our returns are free for 30 days, so you can always swap for another size.',
    ],
    comments: [
      {
        id: 'b3a',
        name: 'Leila',
        text: 'Finally a guide that explains between sizes. Very helpful.',
        date: '2026-09-18',
        likes: 4,
      },
      {
        id: 'b3b',
        name: 'Tomas',
        text: 'Ordered a size up like you suggested and it fits great.',
        date: '2026-09-20',
        likes: 3,
      },
    ],
  },
  {
    slug: 'five-watches-under-100',
    title: 'Five watches worth your money',
    excerpt: 'Good design does not need a luxury price tag. Here is what to look for.',
    date: '2026-09-05',
    author: 'Leo Marsh',
    read: 4,
    tag: 'Picks',
    cat: "Men's Watches",
    body: [
      'Start with the case size. Between 38 and 42 mm suits most wrists. Look for scratch resistant glass and a strap you can swap easily.',
      'A simple dial is easier to match with outfits. Metal bracelets dress up, leather and rubber straps keep things casual.',
      'Check the warranty and return policy on the product page before you buy.',
    ],
    comments: [
      {
        id: 'b4a',
        name: 'Yuki',
        text: 'Great picks, bought the second style last week.',
        date: '2026-09-09',
        likes: 5,
      },
    ],
  },
  {
    slug: 'summer-dress-edit',
    title: 'The late summer dress edit',
    excerpt: 'Light fabrics, easy shapes and the shoes that go with all of them.',
    date: '2026-08-28',
    author: 'Nina Voss',
    read: 4,
    tag: 'Style',
    cat: 'Dresses',
    body: [
      'A good dress needs no effort. Choose breathable cotton or linen blends, and look for a cut that moves with you.',
      'Pair with flat sandals for daytime and add a sleek bag and jewellery for the evening.',
      'Keep a light jacket nearby. Evenings cool down quickly at the end of the season.',
    ],
    comments: [
      {
        id: 'b5a',
        name: 'Amira',
        text: 'The linen tip is spot on, so comfortable in the heat.',
        date: '2026-08-30',
        likes: 7,
      },
      {
        id: 'b5b',
        name: 'Noor',
        text: 'Love this edit. More dresses please.',
        date: '2026-09-01',
        likes: 2,
      },
    ],
  },
  {
    slug: 'bag-capsule-guide',
    title: 'Build a three bag capsule',
    excerpt: 'One for work, one for weekends, one for nights out. That is all you need.',
    date: '2026-08-12',
    author: 'Leo Marsh',
    read: 3,
    tag: 'Guides',
    cat: 'Bags',
    body: [
      'Start with a structured everyday bag in a neutral color that fits a laptop and a water bottle.',
      'Add a soft crossbody for weekends. Look for adjustable straps and a zip closure.',
      'Finish with a small statement bag for evenings. This is where bold colors and textures belong.',
    ],
    comments: [
      {
        id: 'b6a',
        name: 'Lena',
        text: 'The capsule idea saved me from buying five bags I did not need.',
        date: '2026-08-15',
        likes: 6,
      },
    ],
  },
]
