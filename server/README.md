# URL-to-PDf

{
  contentType: 'images' | 'text' | 'imagesAndText',
  imageUrls: string[],
  words: string[],
  layoutOption: 1 | 2 | 4 | 8 | 12 | 16 | 20
}

EXAMPLE: Images + Text:
{
  "contentType": "imagesAndText",
  "imageUrls": [
    "https://example.com/img1.jpg",
    "https://example.com/img2.png"
  ],
  "words": [
    "First line of text",
    "Second line of text"
  ],
  "layoutOption": 2
}