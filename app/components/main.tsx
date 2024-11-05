import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { ImageIcon, Loader2Icon, WandSparkles, XIcon } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useClientTranslation } from '../hooks/use-client-translation'
import { useIsSharePath } from '../hooks/use-is-share-path'
import { useIsSupportVision } from '../hooks/use-is-support-vision'
import { ImageStyle, useCodeStore } from '../stores/use-code-store'
import CodeViewer from './code-viewer'
import RightArrowIcon from './icons/right-arrow'
import { Share } from './toolbar/share'
export default function Main({
  height: wrapperHeight,
  onSubmit,
  handleUpload,
  isUploading,
  handleOptimizePrompt,
  isPromptOptimizing,
  isPromptForUpdateOptimizing,
}: {
  height: number
  onSubmit: (prompt: string) => void
  handleUpload?: (isUpdate?: boolean, callback?: () => void) => void
  isUploading?: boolean
  handleOptimizePrompt?: (prompt: string, isUpdate?: boolean) => void
  isPromptOptimizing?: boolean
  isPromptForUpdateOptimizing?: boolean
}) {
  const { t } = useClientTranslation()
  const { isSharePage } = useIsSharePath()
  const topRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)
  const isSupportVision = useIsSupportVision()

  const {
    status,
    generateCode,
    promptForUpdate,
    updateCodeInfo,
    imageForUpdate,
    referenceText,
    setReferenceText,
  } = useCodeStore((state) => ({
    status: state.status,
    generateCode: state.generateCode,
    promptForUpdate: state.promptForUpdate,
    updateCodeInfo: state.updateAll,
    imageForUpdate: state.imageForUpdate,
    referenceText: state.referenceText,
    setReferenceText: state.setReferenceText,
  }))
  const isLoading = useMemo(
    () => status === 'creating' || status === 'updating',
    [status]
  )
  const setPrompt = useCallback(
    (prompt: string) => {
      updateCodeInfo({ promptForUpdate: prompt })
    },
    [updateCodeInfo]
  )

  const [mainHeight, setMainHeight] = useState(`${wrapperHeight}px`)
  useEffect(() => {
    if (wrapperHeight > 0) {
      const handleResize = () => {
        if (topRef.current) {
          setMainHeight(`${wrapperHeight - topRef.current.clientHeight}px`)
        }
      }
      window.addEventListener('resize', handleResize)
      handleResize()
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [wrapperHeight])
  const handleSubmit = () => {
    onSubmit(promptForUpdate)
  }

  const [uploadImageDialogOpen, setUploadImageDialogOpen] = useState(false)

  const { imageStyleForUpdate, setImageStyleForUpdate } = useCodeStore(
    (state) => ({
      imageStyleForUpdate: state.imageStyleForUpdate,
      setImageStyleForUpdate: state.setImageStyleForUpdate,
    })
  )

  return (
    <div
      style={{ height: wrapperHeight }}
      className='mx-auto flex h-full w-full flex-1 flex-col overflow-hidden rounded-lg bg-white shadow-[2px_2px_15px_rgba(0,0,0,0.05)] dark:border dark:border-border dark:bg-background'
    >
      {/* header */}
      <div
        className={cn(
          'flex flex-col gap-2 p-6',
          ((!generateCode && status !== 'updating') || isSharePage) && 'hidden'
        )}
        ref={topRef}
      >
        <div className='flex items-center justify-between gap-2'>
          <div className='relative flex w-full items-center'>
            <Input
              color='primary'
              className={cn(
                'h-12 w-full overflow-hidden rounded-lg bg-white pr-10 dark:bg-background',
                referenceText && 'h-24 pt-10'
              )}
              placeholder={t('home:main.prompt_input_placeholder')}
              value={promptForUpdate}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit()
                }
              }}
            />
            {/* optimize prompt */}
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  className='absolute right-2 top-1/2 shrink-0 -translate-y-1/2 overflow-hidden p-2 shadow-none hover:bg-transparent hover:text-primary'
                  variant='icon'
                  onClick={() => handleOptimizePrompt?.(promptForUpdate, true)}
                  disabled={isPromptForUpdateOptimizing || isLoading}
                >
                  {isPromptForUpdateOptimizing ? (
                    <Loader2Icon className='size-4 animate-spin' />
                  ) : (
                    <WandSparkles className='size-4' />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('home:header.optimize_prompt')}</p>
              </TooltipContent>
            </Tooltip>
            {referenceText && (
              <p className='absolute left-2 top-2 mr-10 line-clamp-1 rounded-md bg-muted/50 px-2 py-1 pr-6 text-sm text-muted-foreground'>
                {referenceText}
                <Button
                  variant='ghost'
                  className='absolute right-0 top-1/2 size-6 -translate-y-1/2 p-0'
                  onClick={() => setReferenceText('')}
                >
                  <XIcon className='size-4' />
                </Button>
              </p>
            )}
          </div>
          {/* image */}
          {imageForUpdate && (
            <div className='group relative size-12 shrink-0 cursor-pointer rounded-lg p-0'>
              <Image
                src={imageForUpdate}
                alt='image'
                className='size-12 shrink-0 overflow-hidden rounded-lg p-0'
                width={48}
                height={48}
              />
              <Button
                className='absolute -right-2 -top-2 size-6 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100'
                variant='destructive'
                onClick={() => updateCodeInfo({ imageForUpdate: '' })}
              >
                <XIcon className='size-4' />
              </Button>
            </div>
          )}
          {/* image upload button */}
          {isSupportVision && (
            <>
              <Button
                className='size-12 shrink-0 overflow-hidden rounded-lg p-0'
                variant='outline'
                disabled={isLoading || isUploading}
                onClick={() => setUploadImageDialogOpen(true)}
              >
                {isUploading ? (
                  <Loader2Icon className='size-4 animate-spin' />
                ) : (
                  <ImageIcon className='size-4' />
                )}
              </Button>

              <Dialog
                open={uploadImageDialogOpen}
                onOpenChange={setUploadImageDialogOpen}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {t('home:header.upload_image_reference')}：
                    </DialogTitle>
                  </DialogHeader>

                  <RadioGroup
                    defaultValue='style'
                    className='mt-4 space-y-2'
                    value={imageStyleForUpdate}
                    onValueChange={(value) =>
                      setImageStyleForUpdate(value as ImageStyle)
                    }
                  >
                    <div className='flex flex-col space-y-2'>
                      <div className='flex items-center space-x-2'>
                        <RadioGroupItem value='style' id='r1' />
                        <Label htmlFor='r1'>
                          {t('home:header.image_style')}
                        </Label>
                      </div>
                      <p className='px-4 py-2 text-sm text-muted-foreground'>
                        {t('home:header.image_style_description')}
                      </p>
                    </div>
                    <div>
                      <div className='flex items-center space-x-2'>
                        <RadioGroupItem value='content' id='r2' />
                        <Label htmlFor='r2'>
                          {t('home:header.image_content')}
                        </Label>
                      </div>
                      <p className='px-4 py-2 text-sm text-muted-foreground'>
                        {t('home:header.image_content_description')}
                      </p>
                    </div>
                    <div className='flex flex-col space-y-2'>
                      <div className='flex items-center space-x-2'>
                        <RadioGroupItem value='both' id='r3' />
                        <Label htmlFor='r3'>{t('home:header.both')}</Label>
                      </div>
                      <p className='px-4 py-2 text-sm text-muted-foreground'>
                        {t('home:header.both_description')}
                      </p>
                    </div>
                  </RadioGroup>

                  <Button
                    onClick={() => {
                      handleUpload?.(true, () => {
                        setUploadImageDialogOpen(false)
                      })
                    }}
                  >
                    {t('home:header.select_image')}
                  </Button>
                </DialogContent>
              </Dialog>
            </>
          )}
          <Button
            className='size-12 shrink-0 overflow-hidden rounded-lg p-0'
            variant='outline'
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {status === 'updating' ? (
              <Loader2Icon className='size-4 animate-spin' />
            ) : (
              <RightArrowIcon className='size-4' />
            )}
          </Button>
          <Share className='size-12 shrink-0 p-0' />
        </div>
      </div>
      {/* main */}
      <div
        className='relative h-full flex-1 overflow-hidden'
        ref={mainRef}
        style={{ height: mainHeight }}
      >
        <div className='isolate h-full'>
          {generateCode !== '' && <CodeViewer height={mainHeight} />}
        </div>
        <AnimatePresence>
          {(isLoading || generateCode === '') && (
            <motion.div
              initial={status === 'updating' ? { x: '100%' } : undefined}
              animate={status === 'updating' ? { x: '0%' } : undefined}
              exit={{ x: '100%' }}
              transition={{
                type: 'spring',
                bounce: 0,
                duration: 0.85,
                delay: 0.5,
              }}
              className={cn(
                'absolute inset-x-0 bottom-0 top-1/2 flex items-center justify-center rounded-r bg-white transition-all duration-300 dark:bg-background md:inset-y-[1px] md:left-1/2 md:right-0',
                (generateCode === '' || status === 'initial') && 'md:left-0'
              )}
            >
              <p
                className={cn(
                  'text-3xl font-bold',
                  generateCode === '' && 'text-[#e1e1e1]',
                  generateCode !== '' && 'animate-pulse'
                )}
              >
                {generateCode === '' && status === 'initial'
                  ? t('home:main.code_view_empty')
                  : status === 'creating'
                    ? t('home:main.code_view_creating')
                    : t('home:main.code_view_updating')}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
