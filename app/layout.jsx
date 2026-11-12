import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preload" href="/fonts/cc-monster.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/loading.mp4" as="video" type="video/mp4" />
        <link rel="preload" href="/bluni.png" as="image" />
        <link rel="preload" href="/lunii.png" as="image" />
      </head>
      <body>{children}</body>
    </html>
  )
}
