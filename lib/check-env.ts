import assert from 'assert'
import { env } from 'next-runtime-env'

assert(
  env('NEXT_PUBLIC_OFFICIAL_WEBSITE_URL_CHINA'),
  'NEXT_PUBLIC_OFFICIAL_WEBSITE_URL_CHINA is required'
)
assert(
  env('NEXT_PUBLIC_OFFICIAL_WEBSITE_URL_GLOBAL'),
  'NEXT_PUBLIC_OFFICIAL_WEBSITE_URL_GLOBAL is required'
)
assert(env('NEXT_PUBLIC_API_URL'), 'NEXT_PUBLIC_API_URL is required')
assert(env('NEXT_PUBLIC_MODEL_NAME'), 'NEXT_PUBLIC_MODEL_NAME is required')
assert(env('NEXT_PUBLIC_REGION'), 'NEXT_PUBLIC_REGION is required')
assert(env('NEXT_PUBLIC_LOCALE'), 'NEXT_PUBLIC_LOCALE is required')
assert(env('NEXT_PUBLIC_SHARE_PATH'), 'NEXT_PUBLIC_SHARE_PATH is required')
assert(env('NEXT_PUBLIC_DEFAULT_SHARE_DIR'), 'NEXT_PUBLIC_DEFAULT_SHARE_DIR is required')
assert(env('NEXT_PUBLIC_UPLOAD_API_URL'), 'NEXT_PUBLIC_UPLOAD_API_URL is required')
assert(env('NEXT_PUBLIC_API_KEY'), 'NEXT_PUBLIC_API_KEY is required')
