'use client'
import mitt from 'mitt'
type Events = {
  ToastError: number
}
const emitter = mitt<Events>()

export { emitter }
