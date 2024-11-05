import { produce } from 'immer'
import { create } from 'zustand'

import { CoreMessage } from 'ai'
import { storeMiddleware } from './middleware'

export enum ImageStyle {
  Style = 'style',
  Content = 'content',
  Both = 'both',
}

interface CodeStore {
  _hasHydrated: boolean
  prompt: string
  promptForUpdate: string
  generateCode: string | null
  status: 'initial' | 'updating' | 'creating' | 'updated' | 'created'
  isUseShadcnUi: boolean
  messages: CoreMessage[]
  autoScroll: boolean
  showFileExplorer: boolean
  showPreview: boolean
  image: string
  imageForUpdate: string
  lastCharCoords: { x: number; y: number }
  selectedText: string
  isSelecting: boolean
  referenceText: string
  imageStyle: ImageStyle
  imageStyleForUpdate: ImageStyle
}

export interface CodeInfoShare {
  generateCode: string
}

interface CodeActions {
  updateField: <T extends keyof CodeStore>(
    field: T,
    value: CodeStore[T]
  ) => void
  appendGenerateCode: (code: string) => void
  appendPrompt: (prompt: string) => void
  appendPromptForUpdate: (prompt: string) => void
  appendMessage: (message: CoreMessage) => void
  updateAll: (fields: Partial<CodeStore>) => void
  setHasHydrated: (value: boolean) => void
  setLastCharCoords: (coords: { x: number; y: number }) => void
  setSelectedText: (text: string) => void
  setIsSelecting: (value: boolean) => void
  setReferenceText: (text: string) => void
  setImageStyle: (value: ImageStyle) => void
  setImageStyleForUpdate: (value: ImageStyle) => void
}

export const useCodeStore = create<CodeStore & CodeActions>()(
  storeMiddleware<CodeStore & CodeActions>(
    (set) => ({
      _hasHydrated: false,
      prompt: '',
      promptForUpdate: '',
      generateCode: '',
      messages: [],
      status: 'initial',
      isUseShadcnUi: true,
      autoScroll: true,
      showPreview: true,
      showFileExplorer: false,
      image: '',
      imageForUpdate: '',
      lastCharCoords: { x: 0, y: 0 },
      selectedText: '',
      isSelecting: false,
      referenceText: '',
      imageStyle: ImageStyle.Style,
      imageStyleForUpdate: ImageStyle.Style,
      appendGenerateCode: (code: string) =>
        set(
          produce((state) => {
            state.generateCode = state.generateCode + code
          })
        ),
      appendMessage: (message: CoreMessage) =>
        set(
          produce((state) => {
            state.messages.push(message)
          })
        ),
      appendPrompt: (prompt: string) =>
        set(
          produce((state) => {
            state.prompt = state.prompt + prompt
          })
        ),
      appendPromptForUpdate: (prompt: string) =>
        set(
          produce((state) => {
            state.promptForUpdate = state.promptForUpdate + prompt
          })
        ),
      updateField: (field, value) =>
        set(
          produce((state) => {
            state[field] = value
          })
        ),
      updateAll: (fields) =>
        set(
          produce((state) => {
            for (const [key, value] of Object.entries(fields)) {
              state[key as keyof CodeStore] = value
            }
          })
        ),
      setHasHydrated: (value) =>
        set(
          produce((state) => {
            state._hasHydrated = value
          })
        ),
      setLastCharCoords: (coords) =>
        set(
          produce((state) => {
            state.lastCharCoords = coords
          })
        ),
      setSelectedText: (text) =>
        set(
          produce((state) => {
            state.selectedText = text
          })
        ),
      setIsSelecting: (value) =>
        set(
          produce((state) => {
            state.isSelecting = value
          })
        ),
      setReferenceText: (text) =>
        set(
          produce((state) => {
            state.referenceText = text
          })
        ),
      setImageStyle: (value) =>
        set(
          produce((state) => {
            state.imageStyle = value
          })
        ),
      setImageStyleForUpdate: (value) =>
        set(
          produce((state) => {
            state.imageStyleForUpdate = value
          })
        ),
    }),
    'code_store_coder'
  )
)
