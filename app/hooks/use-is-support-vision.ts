import { useMemo } from "react"

import { env } from "next-runtime-env"

export function useIsSupportVision() {
  const modelName = env('NEXT_PUBLIC_MODEL_NAME')
  return useMemo(() => {
    return !(modelName?.includes('o1-mini') || modelName?.includes('o1-preview'))
  }, [modelName])
}
