import React from 'react'
import type { TrackingUpdate } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils'
import {
  Package,
  Truck,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Clock,
  Image,
  FileText,
} from 'lucide-react'

interface TrackingEventLogProps {
  updates: TrackingUpdate[]
  isLoading?: boolean
}

const thumbPool = [
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/e366fe8e-ab6b-4255-9660-88f1f8b50f56_img_00.jpg',
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/55f659c3-b3a2-4556-b5db-fc5b94f7e77e_img_01.jpg',
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/07e77e71-697c-431b-84b0-d1e0b2a24725_img_02.jpg',
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/535adcd3-0569-420d-9ebd-3b1caa087e2b_img_03.jpg',
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/392a171f-7c47-4ce9-b933-c38a078bd1e6_img_04.jpg',
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/ffcb0e6c-9406-41c5-ad25-4b5fea578077_img_05.jpg',
]

const eventIcon = (eventType?: string) => {
  switch (eventType) {
    case 'pickup': return <Package className="h-3.5 w-3.5" />
    case 'in_transit': return <Truck className="h-3.5 w-3.5" />
    case 'stop': return <MapPin className="h-3.5 w-3.5" />
    case 'delivery': return <MapPin className="h-3.5 w-3.5" />
    case 'delivered': return <CheckCircle2 className="h-3.5 w-3.5" />
    case 'delay': return <Clock className="h-3.5 w-3.5" />
    case 'exception': return <AlertCircle className="h-3.5 w-3.5" />
    default: return <FileText className="h-3.5 w-3.5" />
  }
}

const eventVariant = (eventType?: string) => {
  switch (eventType) {
    case 'pickup': return 'info'
    case 'in_transit': return 'warning'
    case 'delivered': return 'success'
    case 'delivery': return 'success'
    case 'delay': return 'warning'
    case 'exception': return 'destructive'
    default: return 'secondary'
  }
}

const eventColor = (eventType?: string) => {
  switch (eventType) {
    case 'pickup': return 'bg-blue-500'
    case 'in_transit': return 'bg-amber-500'
    case 'delivered': return 'bg-emerald-500'
    case 'delivery': return 'bg-emerald-500'
    case 'delay': return 'bg-orange-500'
    case 'exception': return 'bg-red-500'
    default: return 'bg-muted-foreground'
  }
}

export function TrackingEventLog({ updates, isLoading = false }: TrackingEventLogProps) {
  const sorted = [...updates].sort(
    (a, b) => new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime()
  )

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-7 w-7 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <FileText className="h-8 w-8 mb-2 opacity-40" />
        <p className="text-sm">No tracking events yet</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[22px] top-4 bottom-4 w-px bg-border" />

      <div className="space-y-4 p-4">
        {sorted.map((update, i) => (
          <div key={update.guid} className="flex gap-3 relative">
            {/* Dot */}
            <div
              className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 text-white z-10 ${eventColor(update.event_type)}`}
            >
              {eventIcon(update.event_type)}
            </div>

            <div className="flex-1 min-w-0 pb-2">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Badge variant={eventVariant(update.event_type) as 'info' | 'warning' | 'success' | 'destructive' | 'secondary'} className="text-xs">
                    {update.event_type ?? '—'}
                  </Badge>
                  {update.location_name && (
                    <span className="text-xs font-medium text-foreground">
                      {update.location_name}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {formatDate(update.timestamp ?? '')}
                </span>
              </div>

              {update.notes && (
                <p className="text-xs text-muted-foreground mt-1">{update.notes}</p>
              )}

              {(update.latitude != null && update.longitude != null) && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  <MapPin className="h-3 w-3 inline mr-0.5" />
                  {Number(update.latitude).toFixed(4)}, {Number(update.longitude).toFixed(4)}
                </p>
              )}

              {update.photo_proof && (
                <div className="mt-2 h-20 w-28 rounded overflow-hidden border border-border">
                  <img
                    src={update.photo_proof ?? thumbPool[i % thumbPool.length]}
                    alt="Proof photo"
                    loading="lazy"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.style.display = 'none'
                      if (e.currentTarget.parentElement) {
                        e.currentTarget.parentElement.style.background =
                          'linear-gradient(135deg,hsl(var(--muted)),hsl(var(--accent)/0.2))'
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
