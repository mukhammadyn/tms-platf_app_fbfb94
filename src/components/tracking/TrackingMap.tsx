import React, { useState } from 'react'
import type { Order, Vehicle, TrackingUpdate } from '@/types'
import { VehicleMarkerPopup } from './VehicleMarkerPopup'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { MapPin, Truck, Navigation, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn, formatDate } from '@/lib/utils'

interface TrackingMapProps {
  vehicles: Vehicle[]
  orders: Order[]
  trackingUpdates: TrackingUpdate[]
  selectedOrderId: string | null
  isLoading?: boolean
  onRefresh?: () => void
}

const vehicleStatusColor = (status?: string) => {
  switch (status) {
    case 'available': return '#10b981'
    case 'on_trip': return '#f59e0b'
    case 'maintenance': return '#ef4444'
    default: return '#6b7280'
  }
}

// Simple SVG-based map visualization (no external map library required)
export function TrackingMap({
  vehicles,
  orders,
  trackingUpdates,
  selectedOrderId,
  isLoading = false,
  onRefresh,
}: TrackingMapProps) {
  const [hoveredVehicleId, setHoveredVehicleId] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)

  const selectedOrder = orders.find((o) => o.guid === selectedOrderId)
  const selectedUpdates = trackingUpdates
    .filter((u) => u.orders_id === selectedOrderId)
    .sort((a, b) => new Date(a.timestamp ?? 0).getTime() - new Date(b.timestamp ?? 0).getTime())

  // Vehicles with known location
  const mappedVehicles = vehicles.filter(
    (v) => v.current_lat != null && v.current_lng != null
  )

  if (isLoading) {
    return (
      <div className="relative h-full bg-muted/30 rounded-lg overflow-hidden">
        <Skeleton className="absolute inset-0 rounded-lg" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-muted-foreground flex flex-col items-center gap-2">
            <Navigation className="h-8 w-8 animate-pulse" />
            <span className="text-sm">Loading map...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-border">
      {/* Map background image */}
      <div className="absolute inset-0">
        <img
          src="https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/55f659c3-b3a2-4556-b5db-fc5b94f7e77e_img_01.jpg"
          alt="Map background"
          loading="lazy"
          className="w-full h-full object-cover opacity-20"
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.style.display = 'none'
            if (e.currentTarget.parentElement) {
              e.currentTarget.parentElement.style.background =
                'linear-gradient(135deg,hsl(var(--muted)),hsl(var(--accent)/0.2))'
            }
          }}
        />
        {/* Grid overlay to simulate map */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(79,70,229,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(79,70,229,0.07) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Map controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1">
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8 bg-background/90"
          onClick={() => setZoom((z) => Math.min(z + 0.25, 2))}
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8 bg-background/90"
          onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        {onRefresh && (
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 bg-background/90"
            onClick={onRefresh}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Stats overlay top-left */}
      <div className="absolute top-3 left-3 z-20 flex gap-2 flex-wrap">
        <div className="bg-background/90 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-border shadow-sm">
          <div className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium">{mappedVehicles.length} Vehicles</span>
          </div>
        </div>
        <div className="bg-background/90 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-border shadow-sm">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs font-medium">
              {orders.filter((o) => o.status === 'in_transit').length} In Transit
            </span>
          </div>
        </div>
      </div>

      {/* Main visualization area */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.2s' }}
      >
        {/* Route visualization for selected order */}
        {selectedOrder && (
          <div className="absolute inset-12">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Route line */}
              <line
                x1="15" y1="50"
                x2="85" y2="50"
                stroke="#4f46e5"
                strokeWidth="0.8"
                strokeDasharray="3,2"
                opacity="0.7"
              />
              {/* Completed portion */}
              {selectedUpdates.length > 0 && (
                <line
                  x1="15" y1="50"
                  x2={Math.min(15 + (selectedUpdates.length / Math.max(selectedUpdates.length + 1, 1)) * 70, 82)}
                  y2="50"
                  stroke="#10b981"
                  strokeWidth="1"
                  opacity="0.9"
                />
              )}
              {/* Pickup marker */}
              <circle cx="15" cy="50" r="2.5" fill="#10b981" />
              <text x="15" y="45" textAnchor="middle" fontSize="4" fill="#10b981" fontWeight="600">PICK</text>
              {/* Delivery marker */}
              <circle cx="85" cy="50" r="2.5" fill="#ef4444" />
              <text x="85" y="45" textAnchor="middle" fontSize="4" fill="#ef4444" fontWeight="600">DROP</text>
              {/* Tracking update waypoints */}
              {selectedUpdates.map((u, idx) => {
                const x = 15 + ((idx + 1) / (selectedUpdates.length + 1)) * 70
                return (
                  <g key={u.guid}>
                    <circle cx={x} cy="50" r="1.8" fill="#f59e0b" />
                    <text x={x} y="56" textAnchor="middle" fontSize="3" fill="#92400e">
                      {u.event_type === 'stop' ? 'STOP' : u.event_type === 'delay' ? '!' : ''}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        )}

        {/* Vehicle markers — positioned pseudo-randomly but deterministically */}
        <div className="absolute inset-0">
          {mappedVehicles.map((vehicle, idx) => {
            // Distribute vehicles across the visible area
            const cols = Math.max(Math.ceil(Math.sqrt(mappedVehicles.length)), 3)
            const row = Math.floor(idx / cols)
            const col = idx % cols
            const totalRows = Math.ceil(mappedVehicles.length / cols)
            const leftPct = 10 + (col / Math.max(cols - 1, 1)) * 80
            const topPct = 20 + (row / Math.max(totalRows - 1, 1)) * 60
            const isHovered = hoveredVehicleId === vehicle.guid

            return (
              <div
                key={vehicle.guid}
                className="absolute group cursor-pointer"
                style={{ left: `${leftPct}%`, top: `${topPct}%`, transform: 'translate(-50%, -50%)' }}
                onMouseEnter={() => setHoveredVehicleId(vehicle.guid)}
                onMouseLeave={() => setHoveredVehicleId(null)}
              >
                {/* Vehicle icon */}
                <div
                  className={cn(
                    'h-9 w-9 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-transform duration-150',
                    isHovered ? 'scale-125' : 'hover:scale-110'
                  )}
                  style={{ backgroundColor: vehicleStatusColor(vehicle.status) }}
                >
                  <Truck className="h-4 w-4 text-white" />
                </div>

                {/* Plate label */}
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="text-[9px] font-bold bg-background/90 px-1 rounded border border-border">
                    {vehicle.plate_number ?? '—'}
                  </span>
                </div>

                {/* Popup on hover */}
                {isHovered && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-30 bg-background border border-border rounded-lg shadow-xl p-2">
                    <VehicleMarkerPopup vehicle={vehicle} />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Empty state */}
        {mappedVehicles.length === 0 && !selectedOrder && (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Navigation className="h-10 w-10 opacity-30" />
            <p className="text-sm">Select an order to view route</p>
            <p className="text-xs opacity-60">Or wait for vehicles to report location</p>
          </div>
        )}
      </div>

      {/* Selected order info bar */}
      {selectedOrder && (
        <div className="absolute bottom-3 left-3 right-3 z-20">
          <div className="bg-background/95 backdrop-blur-sm rounded-lg border border-border shadow-sm p-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">
                  {selectedOrder.order_number ?? '—'}
                </span>
                <Badge variant="warning" className="text-xs py-0">
                  {selectedOrder.status ?? '—'}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>
                  <MapPin className="h-3 w-3 inline mr-1 text-emerald-500" />
                  {selectedOrder.pickup_address ?? '—'}
                </span>
                <span className="text-border">→</span>
                <span>
                  <MapPin className="h-3 w-3 inline mr-1 text-destructive" />
                  {selectedOrder.delivery_address ?? '—'}
                </span>
                {selectedOrder.distance_km != null && (
                  <span className="text-foreground font-medium">
                    {selectedOrder.distance_km} km
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
