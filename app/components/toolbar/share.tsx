'use client'
import { useClientTranslation } from '@/app/hooks/use-client-translation'
import { useCodeStore } from '@/app/stores/use-code-store'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import ky from 'ky'
import { ShareIcon } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { toast } from 'react-hot-toast'

interface Props {
  className?: string
}
function Share({ className }: Props) {
  const { t } = useClientTranslation()
  const { locale } = useParams()
  const [shareId, setShareId] = useState<string | null>(null)

  const [shareDialogOpen, setShareDialogOpen] = useState(false)

  const { generateCode, status } = useCodeStore((state) => ({
    generateCode: state.generateCode,
    status: state.status,
  }))

  const handleShare = useCallback(async () => {
    if (!generateCode && status !== 'created' && status !== 'updated') {
      toast.error(t('extras:share.no_code_error'))
      return
    }
    try {
      const { id: shareId } = await ky
        .post('/api/share', {
          json: {
            generateCode,
          },
        })
        .json<{ id: string }>()
      if (shareId) {
        setShareId(shareId)
        try {
          await navigator.clipboard.writeText(
            `${window.location.origin}/${locale}/share/${shareId}?lang=${locale}`
          )
        } catch (e) {
          setShareDialogOpen(true)
        }
      }
      if (window.self !== window.top) {
        setShareDialogOpen(true)
      } else {
        toast.success(t('extras:share.success'))
      }
    } catch (error) {
      console.error(error)
      toast.error(t('extras:share.error'))
    }
  }, [generateCode, locale, t, status])

  return (
    <>
      <Button
        aria-label={t('extras:share.trigger.label')}
        variant='outline'
        className={cn(className)}
        onClick={handleShare}
        disabled={status !== 'created' && status !== 'updated'}
      >
        <ShareIcon className='size-4' />
      </Button>
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{t('extras:share.successIframe')}</DialogTitle>
          </DialogHeader>

          <Input
            value={`${window.location.origin}/${locale}/share/${shareId}?lang=${locale}`}
            onChange={() => {}}
            onClick={() => {
              navigator.clipboard.writeText(
                `${window.location.origin}/${locale}/share/${shareId}?lang=${locale}`
              )
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

export { Share }
