import React, { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { TrackingMap } from '@/components/tracking/TrackingMap'
import { TrackingOrderList } from '@/components/tracking/TrackingOrderList'
import { TrackingEventLog } from '@/components/tracking/TrackingEventLog'
import { AddTrackingUpdateModal } from '@/components/tracking/AddTrackingUpdateModal'
import { useTracking, useLiveVehicles } from '@/hooks/useTracking'
import { useApiQuery } from '@/hooks/useApi'
import { extractList } from '@/lib/apiUtils'
import type { Order, TrackingUpdate, Vehicle } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, RefreshCw, ChevronDown, ChevronUp, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

export function TrackingPage() {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [eventLogCollapsed, setEventLogCollapsed] = useState(false)

  // Fetch all tracking updates
  const { data: trackingData, isLoading: trackingLoading, refetch: refetchTracking } = useTracking()
  const trackingUpdates = extractList<TrackingUpdate>(trackingData)

  // Fetch all orders (for the list)
  const { data: ordersData, isLoading: ordersLoading } = useApiQuery<unknown>(
    ['orders'],
    '/v2/items/orders'
  )
  const allOrders = extractList<Order>(ordersData)

  // Filter only active/in-transit orders for tracking
  const activeOrders = allOrders.filter(
    (o) => o.status === 'in_transit' || o.status === 'assigned' || o.status === 'open'
  )

  // Live vehicles with location
  const { data: vehiclesData, isLoading: vehiclesLoading, refetch: refetchVehicles } = useLiveVehicles()
  const vehicles = extractList<Vehicle>(vehiclesData)

  // Updates for selected order
  const selectedOrderUpdates = selectedOrderId
    ? trackingUpdates.filter((u) => u.orders_id === selectedOrderId)
    : []

  const handleRefresh = () => {
    refetchTracking()
    refetchVehicles()
  }

  const isMapLoading = vehiclesLoading || ordersLoading

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem-3rem)] gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Live Tracking</h1>
          <p className="text-sm text-muted-foreground">
            Real-time vehicle positions and shipment status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Update
          </Button>
        </div>
      </div>

      {/* KPI summary bar */}
      <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
        <div className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-3 py-1.5">
          <Activity className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs text-muted-foreground">In Transit:</span>
          <span className="text-xs font-semibold">
            {allOrders.filter((o) => o.status === 'in_transit').length}
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
          <span className="text-xs text-muted-foreground">Available Vehicles:</span>
          <span className="text-xs font-semibold">
            {vehicles.filter((v) => v.status === 'available').length}
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-500 inline-block" />
          <span className="text-xs text-muted-foreground">On Trip:</span>
          <span className="text-xs font-semibold">
            {vehicles.filter((v) => v.status === 'on_trip').length}
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-3 py-1.5">
          <span className="text-xs text-muted-foreground">Total Events:</span>
          <span className="text-xs font-semibold">{trackingUpdates.length}</span>
        </div>
      </div>

      {/* Main split layout */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left: Order list (40%) */}
        <div className="w-[38%] flex-shrink-0 bg-card rounded-xl border border-border overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between flex-shrink-0">
            <h2 className="text-sm font-semibold text-foreground">Active Orders</h2>
            <Badge variant="secondary" className="text-xs">
              {activeOrders.length}
            </Badge>
          </div>
          <div className="flex-1 overflow-hidden">
            <TrackingOrderList
              orders={activeOrders}
              trackingUpdates={trackingUpdates}
              selectedOrderId={selectedOrderId}
              onSelectOrder={(id) =>
                setSelectedOrderId((prev) => (prev === id ? null : id))
              }
              isLoading={ordersLoading}
            />
          </div>
        </div>

        {/* Right: Map + Event Log (60%) */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {/* Map */}
          <div
            className={cn(
              'flex-1 min-h-0 transition-all duration-200',
              eventLogCollapsed ? 'flex-1' : 'flex-[3]'
            )}
          >
            <TrackingMap
              vehicles={vehicles}
              orders={allOrders}
              trackingUpdates={trackingUpdates}
              selectedOrderId={selectedOrderId}
              isLoading={isMapLoading}
              onRefresh={handleRefresh}
            />
          </div>

          {/* Event Log Panel */}
          <div
            className={cn(
              'bg-card rounded-xl border border-border overflow-hidden flex flex-col transition-all duration-200',
              eventLogCollapsed ? 'flex-shrink-0' : 'flex-[2] min-h-[200px]'
            )}
          >
            <div
              className="px-4 py-2.5 border-b border-border flex items-center justify-between flex-shrink-0 cursor-pointer"
              onClick={() => setEventLogCollapsed((v) => !v)}
            >
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">
                  {selectedOrderId
                    ? `Event Log · ${allOrders.find((o) => o.guid === selectedOrderId)?.order_number ?? selectedOrderId}`
                    : 'Event Log'}
                </h2>
                {selectedOrderUpdates.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedOrderUpdates.length}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!selectedOrderId && (
                  <span className="text-xs text-muted-foreground">Select an order to view events</span>
                )}
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  {eventLogCollapsed ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {!eventLogCollapsed && (
              <div className="flex-1 overflow-y-auto scrollbar-thin">
                {trackingLoading ? (
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <TrackingEventLog
                    updates={selectedOrderId ? selectedOrderUpdates : trackingUpdates.slice(0, 20)}
                    isLoading={false}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Tracking Update Modal */}
      <AddTrackingUpdateModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        preselectedOrderId={selectedOrderId ?? undefined}
      />
    </div>
  )
}
