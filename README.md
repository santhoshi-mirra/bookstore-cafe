# The Bookstore Café

A cozy pixel-art focus café. Walk in as a witch, order a drink, sit down and focus for 20 minutes to earn money ($10 a session). Drag the room to look around, scroll to zoom.

## Files
- `index.html`: the whole game (HTML, CSS and JavaScript in one file)
- `room.jpg`: the café background
- `witch.png`: the witch sprite sheet from PixelLab (96x96 cells)

## Run it
Hat recolouring needs a local server (browsers block it on file://):

    python -m http.server 8000

Then open http://localhost:8000

## Sprite sheet rows (witch.png)
0 standing in 8 directions (S, SE, E, NE, N, NW, W, SW)
1 sitting down (7 frames)
2 walking south (6 frames)
3 seated sip (7 frames)
4 standing drink (6 frames)
5 breathing idle (4 frames)

## Ideas for next
- Walking animations for north, east and west
- Barista and customer sprites
- Boy witch sprite
- Bag and makeup variants on the character
- Deploy to Vercel
