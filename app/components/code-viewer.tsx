'use client'

import * as shadcnComponents from '@/lib/shadcn'
import {
  CodeEditorRef,
  SandpackCodeEditor,
  SandpackFileExplorer,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  useSandpack,
} from '@codesandbox/sandpack-react'

import { EditorView } from '@codemirror/view'

import { cn } from '@/lib/utils'
import dedent from 'dedent'
import { useTheme } from 'next-themes'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useIsSharePath } from '../hooks/use-is-share-path'
import { useCodeStore } from '../stores/use-code-store'

function RunCode({ isLoading, code }: { isLoading: boolean; code: string }) {
  // sandpack unstable
  const { sandpack } = useSandpack()
  const { showPreview } = useCodeStore((state) => ({
    showPreview: state.showPreview,
  }))


  useEffect(() => {
    if (!isLoading && code && showPreview) {
      sandpack.runSandpack()
    }
    // IMPORTANT: don't add sandbox to the dependencies!!!
  }, [isLoading, showPreview])
  return null
}

function CodeViewer({ height = '80vh' }: { height?: string }) {
  const { theme } = useTheme()
  const { isSharePage } = useIsSharePath()
  const { status, generateCode, autoScroll, showFileExplorer, showPreview } =
    useCodeStore((state) => ({
      status: state.status,
      generateCode: state.generateCode,
      autoScroll: state.autoScroll,
      showFileExplorer: state.showFileExplorer,
      showPreview: state.showPreview,
    }))

  const [delayedLoading, setDelayedLoading] = useState(true)

  useEffect(() => {
    const isCurrentlyLoading = status === 'creating' || status === 'updating'

    if (!isCurrentlyLoading) {
      const timer = setTimeout(() => {
        setDelayedLoading(false)
      }, 1000)

      return () => clearTimeout(timer)
    } else {
      setDelayedLoading(true)
    }
  }, [status])

  const editorContainerRef = useRef<CodeEditorRef>(null)

  useEffect(() => {
    if (editorContainerRef.current && autoScroll) {
      const scrollDOM = editorContainerRef.current.getCodemirror()?.scrollDOM
      if (scrollDOM) {
        scrollDOM.scrollTop = scrollDOM.scrollHeight
      }
    }
  }, [generateCode, autoScroll])

  const { setSelectedText, setLastCharCoords, setIsSelecting } = useCodeStore(
    (state) => ({
      setSelectedText: state.setSelectedText,
      setLastCharCoords: state.setLastCharCoords,
      setIsSelecting: state.setIsSelecting,
    })
  )

  useEffect(() => {
    setSelectedText('')
  }, [setSelectedText])

  const selectionExtension = useMemo(() => {
    return [
      EditorView.updateListener.of((update) => {
        if (update.selectionSet) {
          const selection = update.state.selection.main
          const selectedText = update.state.sliceDoc(
            selection.from,
            selection.to
          )

          setSelectedText(selectedText)

          if (selection.from !== selection.to) {
            const view = update.view
            const endPos = view.coordsAtPos(selection.to)
            if (endPos) {
              setLastCharCoords({
                x: endPos.left,
                y: endPos.top,
              })
            }
          }
        }
      }),
      EditorView.domEventHandlers({
        mouseup: (e) => {
          setIsSelecting(false)
        },
        mousedown: () => {
          setIsSelecting(true)
        },
        blur: () => {
          setIsSelecting(false)
        },
      }),
    ]
  }, [setSelectedText, setLastCharCoords, setIsSelecting])

  useEffect(() => {
    const clickHandler = (event: MouseEvent) => {
      if (
        !editorContainerRef.current
          ?.getCodemirror()
          ?.scrollDOM?.contains(event.target as Node)
      ) {
        setSelectedText('')
      }
    }

    document.addEventListener('click', clickHandler)

    return () => {
      document.removeEventListener('click', clickHandler)
    }
  }, [setSelectedText])

  return (
    <SandpackProvider
      files={{
        'App.tsx': {
          code: generateCode ?? '',
        },
        ...sharedFiles,
      }}
      options={{
        autorun: false,
        autoReload: true,
        recompileMode: 'delayed',
        recompileDelay: 300,
        ...sharedOptions,
      }}
      theme={theme === 'dark' ? 'dark' : 'light'}
      {...sharedProps}
    >
      <SandpackLayout
        style={{ height }}
        className='!flex !flex-col !flex-nowrap md:!flex-row'
      >
        <RunCode isLoading={delayedLoading} code={generateCode ?? ''} />
        {showFileExplorer && !delayedLoading && (
          <SandpackFileExplorer style={{ height }} />
        )}
        {!isSharePage && (
          <SandpackCodeEditor
            extensions={[...selectionExtension]}
            ref={editorContainerRef}
            showTabs
            closableTabs
            showRunButton={false}
            className={cn(
              'h-full md:min-h-[100%]',
              delayedLoading ? 'min-h-[50%] !w-full md:!w-1/2' : '!w-full'
            )}
          />
        )}
        {showPreview && (
          <SandpackPreview
            style={{ height }}
            showNavigator
            onTouchEnd={(e) => {
              e.preventDefault()
            }}
            className='border-l'
          />
        )}
      </SandpackLayout>
    </SandpackProvider>
  )
}

export default CodeViewer

const sharedProps = {
  template: 'react-ts',
  customSetup: {
    dependencies: {
      axios: 'latest',
      'lucide-react': 'latest',
      recharts: '2.9.0',
      'react-resizable-panels': 'latest',
      three: 'latest',
      '@react-three/fiber': 'latest',
      '@react-three/drei': 'latest',
      'react-router-dom': 'latest',
      '@radix-ui/react-accordion': '^1.2.0',
      '@radix-ui/react-alert-dialog': '^1.1.1',
      '@radix-ui/react-aspect-ratio': '^1.1.0',
      '@radix-ui/react-avatar': '^1.1.0',
      '@radix-ui/react-checkbox': '^1.1.1',
      '@radix-ui/react-collapsible': '^1.1.0',
      '@radix-ui/react-dialog': '^1.1.1',
      '@radix-ui/react-dropdown-menu': '^2.1.1',
      '@radix-ui/react-hover-card': '^1.1.1',
      '@radix-ui/react-label': '^2.1.0',
      '@radix-ui/react-menubar': '^1.1.1',
      '@radix-ui/react-navigation-menu': '^1.2.0',
      '@radix-ui/react-popover': '^1.1.1',
      '@radix-ui/react-progress': '^1.1.0',
      '@radix-ui/react-radio-group': '^1.2.0',
      '@radix-ui/react-select': '^2.1.1',
      '@radix-ui/react-separator': '^1.1.0',
      '@radix-ui/react-slider': '^1.2.0',
      '@radix-ui/react-slot': '^1.1.0',
      '@radix-ui/react-switch': '^1.1.0',
      '@radix-ui/react-tabs': '^1.1.0',
      '@radix-ui/react-toast': '^1.2.1',
      '@radix-ui/react-toggle': '^1.1.0',
      '@radix-ui/react-toggle-group': '^1.1.0',
      '@radix-ui/react-tooltip': '^1.1.2',
      '@radix-ui/react-scroll-area': '^1.1.0',
      'class-variance-authority': '^0.7.0',
      clsx: '^2.1.1',
      'date-fns': '^3.6.0',
      'embla-carousel-react': '^8.1.8',
      'react-day-picker': '^8.10.1',
      'tailwind-merge': '^2.4.0',
      'tailwindcss-animate': '^1.0.7',
      vaul: '^0.9.1',
    },
  },
} as const

const sharedOptions = {
  externalResources: [
    'https://unpkg.com/@tailwindcss/ui/dist/tailwind-ui.min.css',
  ],
}

const sharedFiles = {
  '/lib/utils.ts': { code: shadcnComponents.utils, hidden: true },
  '/components/ui/accordion.tsx': {
    code: shadcnComponents.accordian,
    hidden: true,
  },
  '/components/ui/alert-dialog.tsx': {
    code: shadcnComponents.alertDialog,
    hidden: true,
  },
  '/components/ui/alert.tsx': { code: shadcnComponents.alert, hidden: true },
  '/components/ui/avatar.tsx': { code: shadcnComponents.avatar, hidden: true },
  '/components/ui/badge.tsx': { code: shadcnComponents.badge, hidden: true },
  '/components/ui/breadcrumb.tsx': {
    code: shadcnComponents.breadcrumb,
    hidden: true,
  },
  '/components/ui/button.tsx': { code: shadcnComponents.button, hidden: true },
  '/components/ui/calendar.tsx': {
    code: shadcnComponents.calendar,
    hidden: true,
  },
  '/components/ui/card.tsx': { code: shadcnComponents.card, hidden: true },
  '/components/ui/carousel.tsx': {
    code: shadcnComponents.carousel,
    hidden: true,
  },
  '/components/ui/checkbox.tsx': {
    code: shadcnComponents.checkbox,
    hidden: true,
  },
  '/components/ui/collapsible.tsx': {
    code: shadcnComponents.collapsible,
    hidden: true,
  },
  '/components/ui/dialog.tsx': { code: shadcnComponents.dialog, hidden: true },
  '/components/ui/drawer.tsx': { code: shadcnComponents.drawer, hidden: true },
  '/components/ui/dropdown-menu.tsx': {
    code: shadcnComponents.dropdownMenu,
    hidden: true,
  },
  '/components/ui/input.tsx': { code: shadcnComponents.input, hidden: true },
  '/components/ui/label.tsx': { code: shadcnComponents.label, hidden: true },
  '/components/ui/menubar.tsx': {
    code: shadcnComponents.menuBar,
    hidden: true,
  },
  '/components/ui/navigation-menu.tsx': {
    code: shadcnComponents.navigationMenu,
    hidden: true,
  },
  '/components/ui/pagination.tsx': {
    code: shadcnComponents.pagination,
    hidden: true,
  },
  '/components/ui/popover.tsx': {
    code: shadcnComponents.popover,
    hidden: true,
  },
  '/components/ui/progress.tsx': {
    code: shadcnComponents.progress,
    hidden: true,
  },
  '/components/ui/radio-group.tsx': {
    code: shadcnComponents.radioGroup,
    hidden: true,
  },
  '/components/ui/resizable.tsx': {
    code: shadcnComponents.resizable,
    hidden: true,
  },
  '/components/ui/scroll-area.tsx': {
    code: shadcnComponents.scrollArea,
    hidden: true,
  },
  '/components/ui/select.tsx': { code: shadcnComponents.select, hidden: true },
  '/components/ui/separator.tsx': {
    code: shadcnComponents.separator,
    hidden: true,
  },
  '/components/ui/skeleton.tsx': {
    code: shadcnComponents.skeleton,
    hidden: true,
  },
  '/components/ui/slider.tsx': { code: shadcnComponents.slider, hidden: true },
  '/components/ui/switch.tsx': {
    code: shadcnComponents.switchComponent,
    hidden: true,
  },
  '/components/ui/table.tsx': { code: shadcnComponents.table, hidden: true },
  '/components/ui/tabs.tsx': { code: shadcnComponents.tabs, hidden: true },
  '/components/ui/textarea.tsx': {
    code: shadcnComponents.textarea,
    hidden: true,
  },
  '/components/ui/toast.tsx': { code: shadcnComponents.toast, hidden: true },
  '/components/ui/toaster.tsx': {
    code: shadcnComponents.toaster,
    hidden: true,
  },
  '/components/ui/toggle-group.tsx': {
    code: shadcnComponents.toggleGroup,
    hidden: true,
  },
  '/components/ui/toggle.tsx': { code: shadcnComponents.toggle, hidden: true },
  '/components/ui/tooltip.tsx': {
    code: shadcnComponents.tooltip,
    hidden: true,
  },
  '/components/ui/use-toast.tsx': {
    code: shadcnComponents.useToast,
    hidden: true,
  },
  '/public/index.html': {
    code: dedent`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <div id="root"></div>
      </body>
    </html>
  `,
    hidden: true,
  },
}
