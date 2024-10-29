'use client'
import { Footer } from '@/app/components/footer'
import { useTranslation } from '@/app/i18n/client'
import { Button } from '@/components/ui/button'
import { logger } from '@/lib/logger'
import { emitter } from '@/lib/mitt'
import { useThrottleFn } from 'ahooks'
import { readStreamableValue } from 'ai/rsc'
import dedent from 'dedent'
import { CornerDownRight } from 'lucide-react'
import { env } from 'next-runtime-env'
import { debounce } from 'radash'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { chat } from '../actions/chat'
import { optimizePrompt } from '../actions/prompt'
import Header from '../components/header'
import Main from '../components/main'
import useFileUpload from '../hooks/use-file-upload'
import { useCodeStore } from '../stores/use-code-store'

export const maxDuration = 600

export default function Home({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const { t } = useTranslation(locale)

  const headerRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)
  const [mainHeight, setMainHeight] = useState(0)

  useEffect(() => {
    const calculateMainHeight = () => {
      if (!headerRef.current || !footerRef.current || !mainRef.current) return

      const headerRect = headerRef.current.getBoundingClientRect()
      const footerRect = footerRef.current.getBoundingClientRect()
      const headerMargin = parseFloat(
        window.getComputedStyle(headerRef.current).marginTop
      )
      const footerMargin = parseFloat(
        window.getComputedStyle(footerRef.current).marginBottom
      )
      const mainPadding =
        parseFloat(window.getComputedStyle(mainRef.current).paddingTop) +
        parseFloat(window.getComputedStyle(mainRef.current).paddingBottom)
      const mainHeight =
        window.innerHeight -
        headerRect.height -
        footerRect.height -
        headerMargin -
        footerMargin
      mainRef.current?.style.setProperty('height', `${mainHeight}px`)
      setMainHeight(mainHeight - mainPadding)
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

  const {
    updateCodeInfo,
    appendMessage,
    appendPrompt,
    appendPromptForUpdate,
    messages,
    generateCode,
    referenceText,
  } = useCodeStore((state) => ({
    updateCodeInfo: state.updateAll,
    appendMessage: state.appendMessage,
    appendPrompt: state.appendPrompt,
    appendPromptForUpdate: state.appendPromptForUpdate,
    messages: state.messages,
    generateCode: state.generateCode,
    referenceText: state.referenceText,
  }))

  const codeRef = useRef(generateCode)
  const { run: throttledUpdateCode } = useThrottleFn(
    () => {
      updateCodeInfo({ generateCode: codeRef.current })
    },
    { wait: 50 }
  )

  const onCreateSubmit = useCallback(
    async (prompt: string) => {
      codeRef.current = ''
      updateCodeInfo({
        messages: [],
        generateCode: '',
        status: 'creating',
      })
      const hasImage = useCodeStore.getState().image !== ''
      const messages = [
        {
          role: 'user' as const,
          content: [
            {
              type: 'text' as const,
              text: prompt,
            },
            ...(hasImage
              ? [
                  {
                    type: 'image' as const,
                    image: useCodeStore.getState().image,
                  },
                ]
              : []),
          ],
        },
      ]
      try {
        const { output } = await chat({
          model: env('NEXT_PUBLIC_MODEL_NAME') || 'gpt-4o',
          apiKey: env('NEXT_PUBLIC_API_KEY') || '',
          shadcn: useCodeStore.getState().isUseShadcnUi,
          image: hasImage,
          messages,
        })

        for await (const delta of readStreamableValue(output)) {
          codeRef.current = codeRef.current + (delta ?? '')
          throttledUpdateCode()
        }
        updateCodeInfo({ status: 'created', promptForUpdate: '', messages })
      } catch (e: any) {
        console.error(e)
        updateCodeInfo({ status: 'initial' })
        const errCode = JSON.parse(e as string).error.err_code
        emitter.emit('ToastError', errCode)
      }
    },
    [updateCodeInfo, throttledUpdateCode]
  )

  const onUpdateSubmit = useCallback(
    async (prompt: string) => {
      const hasImage =
        useCodeStore.getState().imageForUpdate !== '' ||
        useCodeStore.getState().image !== ''
      const codeMessage = {
        role: 'assistant' as const,
        content: useCodeStore.getState().generateCode ?? '',
      }
      prompt = referenceText
        ? dedent`
        The following is the reference code:
        ${referenceText}

        The following is the user prompt:
        ${prompt}

        Please update the code to match the reference code.
        `
        : prompt
      const modificationMessage = {
        role: 'user' as const,
        content: [
          {
            type: 'text' as const,
            text: prompt,
          },
          ...(useCodeStore.getState().imageForUpdate !== ''
            ? [
                {
                  type: 'image' as const,
                  image: useCodeStore.getState().imageForUpdate,
                },
              ]
            : []),
        ],
      }

      updateCodeInfo({
        generateCode: '',
        status: 'updating',
      })
      codeRef.current = ''
      try {
        const { output } = await chat({
          model: env('NEXT_PUBLIC_MODEL_NAME') || 'gpt-4o',
          apiKey: env('NEXT_PUBLIC_API_KEY') || '',
          shadcn: useCodeStore.getState().isUseShadcnUi,
          image: hasImage,
          messages: [...messages, codeMessage, modificationMessage],
        })

        for await (const delta of readStreamableValue(output)) {
          codeRef.current = codeRef.current + (delta ?? '')
          throttledUpdateCode()
        }

        appendMessage(codeMessage)
        appendMessage(modificationMessage)
        updateCodeInfo({ status: 'updated' })
      } catch (e: any) {
        updateCodeInfo({ status: 'initial' })
        if (typeof e === 'string') {
          console.error(e)
          const errCode = JSON.parse(e).error.err_code
          emitter.emit('ToastError', errCode)
        } else {
          logger.error(e)
        }
      }
    },
    [updateCodeInfo, messages, appendMessage, throttledUpdateCode, referenceText]
  )

  const [isPromptOptimizing, setIsPromptOptimizing] = useState(false)
  const [isPromptForUpdateOptimizing, setIsPromptForUpdateOptimizing] =
    useState(false)

  const handleOptimizePrompt = useCallback(
    async (prompt: string, isUpdate: boolean = false) => {
      if (isUpdate && prompt === '') {
        toast.error(t('home:prompt_for_update_empty_error'))
        return
      }
      const _prompt = prompt || t('home:header.url_input_placeholder')
      if (isUpdate) {
        setIsPromptForUpdateOptimizing(true)
      } else {
        setIsPromptOptimizing(true)
      }
      try {
        const { output } = await optimizePrompt({
          apiKey: env('NEXT_PUBLIC_API_KEY') || '',
          model: env('NEXT_PUBLIC_MODEL_NAME') || 'gpt-4o',
          prompt: _prompt,
        })

        let content = ''

        for await (const delta of readStreamableValue(output)) {
          content = content + (delta ?? '')
          if (isUpdate) {
            updateCodeInfo({
              promptForUpdate: content.length > 0 ? content : _prompt,
            })
          } else {
            updateCodeInfo({ prompt: content.length > 0 ? content : _prompt })
          }
        }
      } catch (error) {
        console.error(error)
        if (isUpdate) {
          updateCodeInfo({ promptForUpdate: _prompt })
        } else {
          updateCodeInfo({ prompt: _prompt })
        }
        const errCode = JSON.parse(error as string).error.err_code
        emitter.emit('ToastError', errCode)
      } finally {
        if (isUpdate) {
          setIsPromptForUpdateOptimizing(false)
        } else {
          setIsPromptOptimizing(false)
        }
      }
    },
    [appendPrompt, appendPromptForUpdate, updateCodeInfo, t]
  )

  const { upload, isLoading: isUploading, error } = useFileUpload()

  const handleUpload = async (isUpdate: boolean = false) => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'image/*'
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const result = await upload({
          file,
          prefix: 'ai_coder_gen2',
          needCompress: true,
          maxSizeInBytes: 20 * 1024 * 1024,
        })
        if (!result) {
          toast.error(t('home:header.upload_failed'))
          return
        }
        const {
          data: { url },
        } = result
        if (isUpdate) {
          updateCodeInfo({ imageForUpdate: url })
        } else {
          updateCodeInfo({ image: url })
        }
        toast.success(t('home:header.upload_success'))
      }
    }
    fileInput.click()
  }

  const { isSelecting, selectedText, lastCharCoords } = useCodeStore(
    (state) => ({
      isSelecting: state.isSelecting,
      selectedText: state.selectedText,
      lastCharCoords: state.lastCharCoords,
    })
  )

  const handleReference = () => {
    updateCodeInfo({ referenceText: selectedText })
  }

  return (
    <>
      <div className='relative flex h-fit min-h-screen flex-col justify-between'>
        {!isSelecting && selectedText && (
          <div
            className='absolute left-0 top-0 z-10 flex items-center gap-1 rounded-md bg-background p-0.5 shadow-md'
            style={{
              top: lastCharCoords.y + 5 + 'px',
              left: lastCharCoords.x + 5 + 'px',
            }}
          >
            <Button
              variant='ghost'
              className='h-6 gap-1 p-0 px-1'
              onClick={handleReference}
            >
              <CornerDownRight className='size-4' />{' '}
              {t('home:code_viewer.reference')}
            </Button>
          </div>
        )}

        <Header
          className='mt-8'
          ref={headerRef}
          onSubmit={onCreateSubmit}
          handleUpload={handleUpload}
          isUploading={isUploading}
          handleOptimizePrompt={handleOptimizePrompt}
          isPromptOptimizing={isPromptOptimizing}
          isPromptForUpdateOptimizing={isPromptForUpdateOptimizing}
        />
        <main
          className='mx-auto min-h-[500px] w-full max-w-[2048px] px-2 py-6'
          ref={mainRef}
        >
          <Main
            height={mainHeight}
            onSubmit={onUpdateSubmit}
            handleUpload={handleUpload}
            isUploading={isUploading}
            handleOptimizePrompt={handleOptimizePrompt}
            isPromptOptimizing={isPromptOptimizing}
            isPromptForUpdateOptimizing={isPromptForUpdateOptimizing}
          />
        </main>
        <Footer className='mb-4' ref={footerRef} />
      </div>
    </>
  )
}
