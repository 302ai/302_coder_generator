'use client'
import { useIsSharePath } from '@/app/hooks/use-is-share-path'
import { LanguageSwitcher } from './language-switcher'
import { ThemeSwitcher } from './theme-switcher'

function Toolbar() {
  const { isSharePage } = useIsSharePath()
  return (
    <>
      {!isSharePage && (
        <div className='fixed right-4 top-2 z-50 flex gap-2'>
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      )}
    </>
  )
}

export { Toolbar }
