import React, { useState } from 'react'
import { FormModal } from '@/components/shared/FormModal'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { useAddTrackingUpdate } from '@/hooks/useTracking'
import { useApiQuery } from '@/hooks/useApi'
import { extractList } from '@/lib/apiUtils'
import type { Order, Vehicle, TrackingUpdate } from '@/types'

interface AddTrackingUpdateModalProps {
  open: boolean
  onClose: () => void
  preselectedOrderId?: string
}

const EVENT_TYPES = [
  { value: 'pickup', label: 'Pickup' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'stop', label: 'Stop' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'delay', label: 'Delay' },
  { value: 'exception', label: 'Exception' },
  { value: 'delivered', label: 'Delivered' },
]

export function AddTrackingUpdateModal({
  open,
  onClose,
  preselectedOrderId,
}: AddTrackingUpdateModalProps) {
  const addMutation = useAddTrackingUpdate()

  const { data: ordersData } = useApiQuery<unknown>(['orders'], '/v2/items/orders')
  const orders = extractList<Order>(ordersData)

  const { data: vehiclesData } = useApiQuery<unknown>(['vehicles'], '/v2/items/vehicles')
  const vehicles = extractList<Vehicle>(vehiclesData)

  const [eventType, setEventType] = useState<string>('')
  const [orderId, setOrderId] = useState<string>(preselectedOrderId ?? '')
  const [vehicleId, setVehicleId] = useState<string>('')
  const [locationName, setLocationName] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [notes, setNotes] = useState('')
  const [timestamp, setTimestamp] = useState(
    new Date().toISOString().slice(0, 16)
  )

  const handleSubmit = () => {
    if (!eventType || !orderId) return

    const payload: Partial<TrackingUpdate> = {
      event_type: eventType as TrackingUpdate['event_type'],
      orders_id: orderId || undefined,
      location_name: locationName || undefined,
      notes: notes || undefined,
      timestamp: timestamp || undefined,
    }

    if (vehicleId) payload.vehicles_id = vehicleId
    if (latitude) payload.latitude = parseFloat(latitude)
    if (longitude) payload.longitude = parseFloat(longitude)

    addMutation.mutate(payload, {
      onSuccess: () => {
        setEventType('')
        setOrderId(preselectedOrderId ?? '')
        setVehicleId('')
        setLocationName('')
        setLatitude('')
        setLongitude('')
        setNotes('')
        setTimestamp(new Date().toISOString().slice(0, 16))
        onClose()
      },
    })
  }

  return (
    <FormModal
      open={open}
      title="Add Tracking Update"
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={addMutation.isPending}
      submitLabel="Add Update"
    >
      <div className="space-y-4">
        {/* Event Type */}
        <div className="space-y-1.5">
          <Label>Event Type <span className="text-destructive">*</span></Label>
          <Select value={eventType} onValueChange={setEventType}>
            <SelectTrigger>
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              {EVENT_TYPES.map((et) => (
                <SelectItem key={et.value} value={et.value}>
                  {et.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Order */}
        <div className="space-y-1.5">
          <Label>Order <span className="text-destructive">*</span></Label>
          <Select value={orderId} onValueChange={setOrderId}>
            <SelectTrigger>
              <SelectValue placeholder="Select order" />
            </SelectTrigger>
            <SelectContent>
              {orders.map((o) => (
                <SelectItem key={o.guid} value={o.guid || 'fallback'}>
                  {o.order_number ?? o.guid}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Vehicle */}
        <div className="space-y-1.5">
          <Label>Vehicle</Label>
          <Select value={vehicleId} onValueChange={setVehicleId}>
            <SelectTrigger>
              <SelectValue placeholder="Select vehicle (optional)" />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map((v) => (
                <SelectItem key={v.guid} value={v.guid || 'fallback'}>
                  {v.plate_number ?? v.guid} {v.make ? `· ${v.make}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location Name */}
        <div className="space-y-1.5">
          <Label>Location Name</Label>
          <Input
            placeholder="e.g. Chicago Distribution Center"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
          />
        </div>

        {/* Lat/Lng */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Latitude</Label>
            <Input
              type="number"
              step="0.000001"
              placeholder="41.8781"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Longitude</Label>
            <Input
              type="number"
              step="0.000001"
              placeholder="-87.6298"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
            />
          </div>
        </div>

        {/* Timestamp */}
        <div className="space-y-1.5">
          <Label>Timestamp</Label>
          <Input
            type="datetime-local"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
          />
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <Label>Notes</Label>
          <Textarea
            placeholder="Additional notes about this update..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>
      </div>
    </FormModal>
  )
}
