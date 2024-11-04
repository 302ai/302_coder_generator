'use client'
import { Footer } from '@/app/components/footer'
import Main from '@/app/components/main'
import { useTranslation } from '@/app/i18n/client'
import { CodeInfoShare, useCodeStore } from '@/app/stores/use-code-store'
import { showBrand } from '@/lib/brand'
import { cn } from '@/lib/utils'
import ky from 'ky'
import { useParams } from 'next/navigation'
import { debounce } from 'radash'
import { useEffect, useRef, useState } from 'react'

export default function Share({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const { t } = useTranslation(locale)
  const { id: shareId } = useParams()
  const { updateCodeInfo } = useCodeStore((state) => ({
    updateCodeInfo: state.updateAll,
  }))

  useEffect(() => {
    const _getCodeInfo = async () => {
      if (!shareId) {
        return
      }
      const codeInfo = await ky
        .get(`/api/share?id=${shareId}`)
        .json<CodeInfoShare>()
      updateCodeInfo(codeInfo)
    }
    _getCodeInfo()
  }, [shareId, updateCodeInfo])

  const onSubmit = async (url: string) => {}

  const headerRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)
  const [mainHeight, setMainHeight] = useState(0)

  useEffect(() => {
    const calculateMainHeight = () => {
      if (!footerRef.current) return

      const footerRect = footerRef.current.getBoundingClientRect()
      const footerMargin =
        parseFloat(window.getComputedStyle(footerRef.current).marginBottom) +
        parseFloat(window.getComputedStyle(footerRef.current).marginTop)
      const mainHeight = window.innerHeight - footerRect.height - footerMargin

      mainRef.current?.style.setProperty('height', `${mainHeight}px`)
      setMainHeight(mainHeight)
    }

    const debouncedCalculateMainHeight = debounce(
      {
        delay: 100,
      },
      calculateMainHeight
    )

    calculateMainHeight()

    const resizeObserver = new ResizeObserver(debouncedCalculateMainHeight)

    if (headerRef.current) {
      resizeObserver.observe(headerRef.current)
    }
    if (footerRef.current) {
      resizeObserver.observe(footerRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <div className='flex h-fit min-h-screen flex-col justify-between'>
      <main className={cn('mx-auto w-full')} ref={mainRef}>
        <Main height={mainHeight} onSubmit={onSubmit} />
      </main>
      {!showBrand && <footer ref={footerRef} />}
      {showBrand && <Footer className='mb-4' ref={footerRef} />}
    </div>
  )
}
