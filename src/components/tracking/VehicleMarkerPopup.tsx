import React from 'react'
import type { Vehicle } from '@/types'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { Truck, MapPin, Clock } from 'lucide-react'

interface VehicleMarkerPopupProps {
  vehicle: Vehicle
  driverName?: string
}

const vehicleStatusVariant = (status?: string) => {
  switch (status) {
    case 'available': return 'success'
    case 'on_trip': return 'warning'
    case 'maintenance': return 'destructive'
    default: return 'secondary'
  }
}

export function VehicleMarkerPopup({ vehicle, driverName }: VehicleMarkerPopupProps) {
  return (
    <div className="min-w-[200px] p-1">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Truck className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-sm text-foreground">{vehicle.plate_number ?? '—'}</p>
          <p className="text-xs text-muted-foreground">{vehicle.make ?? ''} {vehicle.model ?? ''}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Status</span>
          <Badge variant={vehicleStatusVariant(vehicle.status)} className="text-xs">
            {vehicle.status ?? '—'}
          </Badge>
        </div>

        {driverName && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Driver</span>
            <span className="text-xs font-medium">{driverName}</span>
          </div>
        )}

        {vehicle.vehicle_type && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Type</span>
            <span className="text-xs font-medium capitalize">{vehicle.vehicle_type}</span>
          </div>
        )}

        {(vehicle.current_lat != null && vehicle.current_lng != null) && (
          <div className="flex items-start gap-1 mt-1.5">
            <MapPin className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
            <span className="text-xs text-muted-foreground">
              {Number(vehicle.current_lat).toFixed(4)}, {Number(vehicle.current_lng).toFixed(4)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
