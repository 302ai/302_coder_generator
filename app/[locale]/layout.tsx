import '@/lib/check-env'
import { PublicEnvScript } from 'next-runtime-env'
import '../globals.css'

import ClientOnly from '@/app/components/client-only'
import { ErrorHandler } from '@/app/components/error-handler'
import { languages } from '@/app/i18n/settings'
import { showBrand } from '@/lib/brand'
import { dir } from 'i18next'
import { Metadata, ResolvingMetadata } from 'next'
import { headers } from 'next/headers'
import { Toaster } from 'react-hot-toast'
import { Providers } from '../components/providers'
import { Toolbar } from '../components/toolbar'

export async function generateStaticParams() {
  return languages.map((locale) => ({ locale }))
}

type Props = {
  params: { locale: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  { params: { locale } }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const headers_ = headers()
  const hostname = headers_.get('host')

  const previousImages = (await parent).openGraph?.images || []
  const seoRes = {
    data: {
      id: 'videosum',
      supportLanguages: ['zh', 'en', 'ja'],
      fallbackLanguage: 'en',
      languages: {
        zh: {
          title: 'AI网页生成器2.0',
          description: '一键生成高质量的网页',
          image: '/images/desc_zh.png',
          _id: '66d2de547e3b177ca1c3b490',
        },
        en: {
          title: 'AI Web Page Generator 2.0',
          description:
            'Generate high-quality web pages with one click',
          image: '/images/desc_en.png',
          _id: '66d2de547e3b177ca1c3b491',
        },
        ja: {
          title: 'AIウェブページジェネレーター2.0',
          description:
            'ワンクリックで高品質なウェブページを生成します',
          image: '/images/desc_ja.png',
          _id: '66d2de547e3b177ca1c3b492',
        },
      },
    },
  }

  const defaultSEO = {
    title: 'Default Title',
    description: 'Default Description',
    image: '/default-image.jpg',
  }

  const info = seoRes?.data?.languages || { [locale]: defaultSEO }
  // @ts-ignore
  const images = [info[locale].image || defaultSEO.image, ...previousImages]

  return {
    // @ts-ignore
    title: info[locale].title || defaultSEO.title,
    // @ts-ignore
    description: info[locale].description || defaultSEO.description,
    metadataBase: new URL(`https://${hostname}`),
    alternates: {
      canonical: `/${locale}`,
      languages: languages
        .filter((item) => item !== locale)
        .map((item) => ({
          [item]: `/${item}`,
        }))
        .reduce((acc, curr) => Object.assign(acc, curr), {}),
    },
    openGraph: {
      url: `/${locale}`,
      images,
    },
    twitter: {
      site: `https://${hostname}/${locale}`,
      images,
    },
  }
}

export default function RootLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode
  params: { locale: string }
}>) {
  return (
    <html lang={locale} dir={dir(locale)}>
      <head>
        <PublicEnvScript />
      </head>
      <body className='bg-[#fafafa] dark:bg-background'>
        <ClientOnly>
          <Providers>
            <Toaster />
            <ErrorHandler />
            <Toolbar />
            {children}
            {showBrand && (
              <script
                src='https://assets.salesmartly.com/js/project_177_61_1649762323.js'
                async
              />
            )}
          </Providers>
        </ClientOnly>
      </body>
    </html>
  )
}
