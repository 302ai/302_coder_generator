import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { showBrand } from '@/lib/brand'
import { cn } from '@/lib/utils'
import {
  ImageIcon,
  Loader2Icon,
  SettingsIcon,
  WandSparkles,
  XIcon,
} from 'lucide-react'
import Image from 'next/image'
import { isEmpty } from 'radash'
import { forwardRef, memo, useCallback, useMemo, useState } from 'react'
import { useClientTranslation } from '../hooks/use-client-translation'
import { useIsSupportVision } from '../hooks/use-is-support-vision'
import { ImageStyle, useCodeStore } from '../stores/use-code-store'
import LogoIcon from './icons/logo-icon'
import RightArrowIcon from './icons/right-arrow'

interface Props {
  className?: string
  onSubmit?: (prompt: string) => void
  handleUpload?: (isUpdate?: boolean, callback?: () => void) => void
  isUploading?: boolean
  handleOptimizePrompt?: (prompt: string, isUpdate?: boolean) => void
  isPromptOptimizing?: boolean
  isPromptForUpdateOptimizing?: boolean
}

const Header = forwardRef<HTMLDivElement, Props>(
  (
    {
      className,
      onSubmit,
      handleUpload,
      isUploading,
      handleOptimizePrompt,
      isPromptOptimizing,
      isPromptForUpdateOptimizing,
    },
    ref
  ) => {
    const { t } = useClientTranslation()

    const isSupportVision = useIsSupportVision()

    const {
      prompt,
      isUseShadcnUi,
      updateCodeInfo,
      autoScroll,
      showPreview,
      showFileExplorer,
      image,
    } = useCodeStore((state) => ({
      prompt: state.prompt,
      isUseShadcnUi: state.isUseShadcnUi,
      updateCodeInfo: state.updateAll,
      autoScroll: state.autoScroll,
      showPreview: state.showPreview,
      showFileExplorer: state.showFileExplorer,
      image: state.image,
    }))
    const setIsUseShadcnUi = useCallback(
      (value: boolean) => {
        updateCodeInfo({ isUseShadcnUi: value })
      },
      [updateCodeInfo]
    )
    const setAutoScroll = useCallback(
      (value: boolean) => {
        updateCodeInfo({ autoScroll: value })
      },
      [updateCodeInfo]
    )
    const setShowPreview = useCallback(
      (value: boolean) => {
        updateCodeInfo({ showPreview: value })
      },
      [updateCodeInfo]
    )
    const setShowFileExplorer = useCallback(
      (value: boolean) => {
        updateCodeInfo({ showFileExplorer: value })
      },
      [updateCodeInfo]
    )
    const setPrompt = useCallback(
      (value: string) => {
        updateCodeInfo({ prompt: value })
      },
      [updateCodeInfo]
    )
    const handleSubmit = () => {
      if (isEmpty(prompt)) {
        setPrompt(t('home:header.url_input_placeholder'))
      }
      onSubmit?.(prompt || t('home:header.url_input_placeholder'))
    }

    const { status } = useCodeStore((state) => ({
      status: state.status,
    }))
    const isLoading = useMemo(
      () => status === 'creating' || status === 'updating',
      [status]
    )

    const [uploadImageDialogOpen, setUploadImageDialogOpen] = useState(false)

    const { imageStyle, setImageStyle } = useCodeStore((state) => ({
      imageStyle: state.imageStyle,
      setImageStyle: state.setImageStyle,
    }))
    return (
      <header
        className={cn(
          'flex flex-col items-center justify-center space-y-8 px-2',
          className
        )}
        ref={ref}
      >
        <div className='flex items-center space-x-4'>
          {showBrand && <LogoIcon className='size-8 flex-shrink-0' />}
          <h1 className='break-all text-3xl leading-tight tracking-tighter transition-all sm:text-4xl lg:leading-[1.1]'>
            {t('home:header.title')}
          </h1>
        </div>
        <div className='mx-2 flex w-full flex-shrink-0 flex-col items-center justify-center gap-2 text-xs sm:flex-row sm:gap-4'>
          <div className='flex w-full max-w-3xl flex-grow flex-row items-center justify-between gap-2 overflow-hidden rounded-lg bg-white p-4 shadow-[2px_2px_15px_rgba(0,0,0,0.05)] dark:bg-background'>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  className='size-12 shrink-0 overflow-hidden rounded-lg p-0'
                  variant='outline'
                  disabled={isLoading}
                >
                  <SettingsIcon className='size-4' />
                </Button>
              </PopoverTrigger>
              <PopoverContent asChild>
                <div className='flex w-fit flex-col items-center space-y-2'>
                  <div className='flex w-full items-center justify-between space-x-2'>
                    <Label
                      htmlFor='shadcn-ui'
                      className='cursor-pointer text-sm'
                    >
                      Shadcn/ui
                    </Label>
                    <Switch
                      id='shadcn-ui'
                      checked={isUseShadcnUi}
                      onCheckedChange={() => setIsUseShadcnUi(!isUseShadcnUi)}
                    />
                  </div>
                  <div className='flex w-full items-center justify-between space-x-2'>
                    <Label
                      htmlFor='auto-scroll'
                      className='cursor-pointer text-sm'
                    >
                      {t('home:header.auto_scroll')}
                    </Label>
                    <Switch
                      id='auto-scroll'
                      checked={autoScroll}
                      onCheckedChange={() => setAutoScroll(!autoScroll)}
                    />
                  </div>
                  <div className='flex w-full items-center justify-between space-x-2'>
                    <Label
                      htmlFor='show-preview'
                      className='cursor-pointer text-sm'
                    >
                      {t('home:header.show_preview')}
                    </Label>
                    <Switch
                      id='file-explorer'
                      checked={showPreview}
                      onCheckedChange={() => setShowPreview(!showPreview)}
                    />
                  </div>
                  <div className='flex w-full items-center justify-between space-x-2'>
                    <Label
                      htmlFor='file-explorer'
                      className='cursor-pointer text-sm'
                    >
                      {t('home:header.show_file_explorer')}
                    </Label>
                    <Switch
                      id='file-explorer'
                      checked={showFileExplorer}
                      onCheckedChange={() =>
                        setShowFileExplorer(!showFileExplorer)
                      }
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <div className='relative flex w-full items-center'>
              <Input
                color='primary'
                className='h-12 w-full overflow-hidden rounded-lg bg-white pr-10 dark:bg-background'
                placeholder={t('home:header.url_input_placeholder')}
                disabled={isLoading}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
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
                    onClick={() => handleOptimizePrompt?.(prompt, false)}
                    disabled={isPromptOptimizing || isLoading}
                  >
                    {isPromptOptimizing ? (
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
            </div>
            {/* image */}
            {image && (
              <div className='group relative size-12 shrink-0 cursor-pointer rounded-lg p-0'>
                <Image
                  src={image}
                  alt='image'
                  className='size-12 shrink-0 overflow-hidden rounded-lg p-0'
                  width={48}
                  height={48}
                />
                <Button
                  className='absolute -right-2 -top-2 size-6 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100'
                  variant='destructive'
                  onClick={() => updateCodeInfo({ image: '' })}
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
                      value={imageStyle}
                      onValueChange={(value) =>
                        setImageStyle(value as ImageStyle)
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
                          <Label htmlFor='r3'>
                            {t('home:header.both')}
                          </Label>
                        </div>
                        <p className='px-4 py-2 text-sm text-muted-foreground'>
                          {t('home:header.both_description')}
                        </p>
                      </div>
                    </RadioGroup>

                    <Button
                      onClick={() => {
                        handleUpload?.(false, () => {
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
              disabled={isLoading}
              onClick={handleSubmit}
            >
              {status === 'creating' ? (
                <Loader2Icon className='size-4 animate-spin' />
              ) : (
                <RightArrowIcon className='size-4' />
              )}
            </Button>
          </div>
        </div>
      </header>
    )
  }
)

Header.displayName = 'Header'

export default memo(Header)
