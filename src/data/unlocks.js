// Makeover options, bag items, activities and the Unlocks shop. Copied from legacy.html.
export const HATS={purple:{n:'Lavender',c:'#7d6aa8'},midnight:{n:'Midnight',c:'#3d4a7a',h:225,s:.38,l:-.1},rose:{n:'Rose',c:'#c9708e',h:338,s:.45,l:.03},sage:{n:'Sage',c:'#7a9a6a',h:100,s:.28,l:0,lock:'hat_sage'},gold:{n:'Golden',c:'#d9a441',h:42,s:.62,l:.05,lock:'hat_gold'}};
export const OUTFITS={cream:{n:'Cream',c:'#ead7b9'},blush:{n:'Blush',c:'#f2b8c6',h:345,s:.55},sage:{n:'Sage',c:'#b9d4b1',h:110,s:.3},lilac:{n:'Lilac',c:'#cdbff0',h:258,s:.45},sky:{n:'Sky',c:'#b8d8f0',h:205,s:.5},butter:{n:'Butter',c:'#f6df92',h:46,s:.75}};
export const BAGS={backpack:{n:'Backpack',c:'#c9b8f2',d:'#a796e0'},crossbody:{n:'Crossbody',c:'#f6b6c6',d:'#e392a7',lock:'bag_crossbody'},satchel:{n:'Satchel',c:'#b9d9b3',d:'#93c08c',lock:'bag_satchel'},tote:{n:'Tote',c:'#f6df92',d:'#e9c55f',lock:'bag_tote'}};
export const ITEMS=[
 {id:'book',n:'Book',bg:'#fde9ee',svg:'<path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z"/><path d="M5 18a2 2 0 0 1 2-2h11"/>'},
 {id:'notebook',n:'Notebook',bg:'#efeafd',svg:'<rect x="6" y="3" width="13" height="18" rx="2"/><path d="M4 7h3M4 12h3M4 17h3M10 8h6"/>'},
 {id:'pen',n:'Pen',bg:'#e3f0fb',svg:'<path d="M16 3l5 5L9 20H4v-5z"/><path d="M13 6l5 5"/>'},
 {id:'pencils',n:'Pencils',bg:'#fdf3d2',svg:'<path d="M4 20l2-6L16 4l4 4-10 10z"/><path d="M14 6l4 4M6 14l4 4"/>'},
 {id:'laptop',n:'Laptop',bg:'#e5f2e7',svg:'<rect x="5" y="5" width="14" height="10" rx="1.5"/><path d="M3 19h18"/>'},
 {id:'headphones',n:'Headphones',bg:'#fde9ee',svg:'<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>'},
 {id:'phone',n:'Phone',bg:'#efeafd',svg:'<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 18h2"/>'},
 {id:'makeup',n:'Makeup',bg:'#fde9ee',svg:'<path d="M9 21h6v-9H9z"/><path d="M10 12V7l4-3v8"/>'}];
export const ACTS=[['read','Read',['book']],['study','Study',['notebook','pencils','pen']],['work','Work',['laptop']],['chill','Chill',['headphones','phone']]];
export const SHOP=[
 ['Drinks',[{id:'d_matcha',n:'Matcha latte',c:15},{id:'d_chai',n:'Chai latte',c:12},{id:'d_cocoa',n:'Hot chocolate',c:12},{id:'d_straw',n:'Strawberry milk',c:18},{id:'d_boba',n:'Brown sugar boba',c:25}]],
 ['Bags',[{id:'bag_crossbody',n:'Crossbody bag',c:20},{id:'bag_satchel',n:'Satchel',c:25},{id:'bag_tote',n:'Tote bag',c:30}]],
 ['Hats',[{id:'hat_sage',n:'Sage witch hat',c:25},{id:'hat_gold',n:'Golden witch hat',c:40}]]];
