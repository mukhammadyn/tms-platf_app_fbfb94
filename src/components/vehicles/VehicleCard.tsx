import React from 'react'
import { Link } from 'react-router-dom'
import { Package, Maximize2, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn, formatDate } from '@/lib/utils'
import type { Vehicle } from '@/types'

const thumbPool = [
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/535adcd3-0569-420d-9ebd-3b1caa087e2b_img_03.jpg',
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/392a171f-7c47-4ce9-b933-c38a078bd1e6_img_04.jpg',
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/ffcb0e6c-9406-41c5-ad25-4b5fea578077_img_05.jpg',
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/67ef1d14-e1af-4ac7-a6f3-c6590f6dde30_img_06.jpg',
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/8f281979-a818-46af-b222-a8c7995640c7_img_07.jpg',
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/c57a1395-d683-444d-b0e2-69b498ac1f51_img_08.jpg',
]

function vehicleStatusConfig(status: string | undefined) {
  switch (status) {
    case 'available': return { label: 'Available', variant: 'success' as const, dot: 'bg-emerald-500' }
    case 'on_trip':   return { label: 'On Trip',   variant: 'warning' as const, dot: 'bg-amber-500' }
    case 'maintenance': return { label: 'Maintenance', variant: 'info' as const, dot: 'bg-blue-500' }
    case 'inactive':  return { label: 'Inactive',  variant: 'secondary' as const, dot: 'bg-gray-400' }
    default:          return { label: status ?? '—', variant: 'outline' as const, dot: 'bg-gray-400' }
  }
}

interface VehicleCardProps {
  vehicle: Vehicle
  index?: number
}

export function VehicleCard({ vehicle, index = 0 }: VehicleCardProps) {
  const statusCfg = vehicleStatusConfig(vehicle.status)
  const photoSrc = vehicle.photo ?? thumbPool[index % thumbPool.length]

  return (
    <Link to={`/vehicles/${vehicle.guid}`} className="block">
      <Card className="hover:shadow-md transition-shadow duration-200 overflow-hidden h-full">
        {/* Photo */}
        <div className="relative h-44 bg-muted overflow-hidden">
          <img
            src={photoSrc}
            alt={`${vehicle.make ?? ''} ${vehicle.model ?? ''}`}
            loading="lazy"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.style.display = 'none'
              if (e.currentTarget.parentElement) {
                e.currentTarget.parentElement.style.background = 'linear-gradient(135deg,hsl(var(--muted)),hsl(var(--accent)/0.2))'
              }
            }}
          />
          <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1">
            <span className={cn('h-2 w-2 rounded-full flex-shrink-0', statusCfg.dot)} />
            <span className="text-xs font-medium">{statusCfg.label}</span>
          </div>
          {vehicle.vehicle_type && (
            <div className="absolute top-2 left-2">
              <Badge variant="info" className="text-xs capitalize">
                {(vehicle.vehicle_type ?? '').replace('_', ' ')}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <div className="mb-2">
            <p className="font-semibold text-foreground">
              {vehicle.make ?? '—'} {vehicle.model ?? ''}
            </p>
            <p className="text-sm text-muted-foreground">
              {vehicle.plate_number ?? '—'} · {vehicle.year ?? '—'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{vehicle.max_payload_kg ?? '—'} kg</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Maximize2 className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{vehicle.max_volume_m3 ?? '—'} m³</span>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Ins. {vehicle.insurance_expiry ? formatDate(vehicle.insurance_expiry) : '—'}</span>
            </div>
            <Badge variant={statusCfg.variant} className="text-xs">{statusCfg.label}</Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
