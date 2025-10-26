import Head from 'next/head'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  author?: string
  publishedTime?: string
  modifiedTime?: string
  section?: string
  tags?: string[]
}

export function SEO({
  title = 'Zingarito Kids - Tienda Mayorista de Ropa Infantil',
  description = 'Tienda mayorista especializada en ropa infantil de calidad. Productos para niños y niñas con compra mínima de 5 unidades.',
  keywords = ['zingarito kids', 'ropa infantil', 'mayorista', 'villa ramallo'],
  image = '/og-image.jpg',
  url = 'https://zingaritokids.com',
  type = 'website',
  author = 'Zingarito Kids',
  publishedTime,
  modifiedTime,
  section,
  tags = [],
}: SEOProps) {
  const fullTitle = title.includes('Zingarito Kids') ? title : `${title} | Zingarito Kids`
  const fullUrl = url.startsWith('http') ? url : `https://zingaritokids.com${url}`
  const fullImage = image.startsWith('http') ? image : `https://zingaritokids.com${image}`

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="Zingarito Kids" />
      <meta property="og:locale" content="es_AR" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      
      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#8B5CF6" />
      <meta name="msapplication-TileColor" content="#8B5CF6" />
      
      {/* Article specific */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && section && (
        <meta property="article:section" content={section} />
      )}
      {type === 'article' && tags.length > 0 && (
        tags.map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))
      )}
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Zingarito Kids',
            description: 'Tienda mayorista especializada en ropa infantil de calidad',
            url: 'https://zingaritokids.com',
            logo: 'https://zingaritokids.com/logo.png',
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: '+54-3407-498045',
              contactType: 'customer service',
              availableLanguage: 'Spanish'
            },
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'San Martín 17',
              addressLocality: 'Villa Ramallo',
              addressRegion: 'Buenos Aires',
              addressCountry: 'AR'
            },
            sameAs: [
              'https://www.instagram.com/zingaritokids'
            ]
          })
        }}
      />
    </Head>
  )
}
