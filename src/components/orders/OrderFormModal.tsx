import React, { useState, useEffect } from 'react'
import { FormModal } from '@/components/shared/FormModal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useApiQuery } from '@/hooks/useApi'
import { extractList } from '@/lib/apiUtils'
import { useCreateOrder, useUpdateOrder } from '@/hooks/useOrders'
import type { Order, User, Vehicle } from '@/types'

interface OrderFormModalProps {
  open: boolean
  onClose: () => void
  defaultType?: 'classic' | 'tender' | 'private'
  editOrder?: Order | null
}

export function OrderFormModal({ open, onClose, defaultType = 'classic', editOrder }: OrderFormModalProps) {
  const isEdit = !!editOrder

  const [orderType, setOrderType] = useState<string>(defaultType)
  const [status, setStatus] = useState<string>('open')
  const [orderNumber, setOrderNumber] = useState('')
  const [cargoDescription, setCargoDescription] = useState('')
  const [cargoWeightKg, setCargoWeightKg] = useState('')
  const [cargoVolumeM3, setCargoVolumeM3] = useState('')
  const [pickupAddress, setPickupAddress] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [pickupDate, setPickupDate] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [price, setPrice] = useState('')
  const [distanceKm, setDistanceKm] = useState('')
  const [specialRequirements, setSpecialRequirements] = useState('')
  const [usersId, setUsersId] = useState('')
  const [vehiclesId, setVehiclesId] = useState('')

  const { data: usersData } = useApiQuery<unknown>(['users'], '/v2/items/users')
  const users = extractList<{ guid: string; full_name?: string; login?: string; email?: string }>(usersData)

  const { data: vehiclesData } = useApiQuery<unknown>(['vehicles'], '/v2/items/vehicles')
  const vehicles = extractList<{ guid: string; plate_number?: string; make?: string; model?: string }>(vehiclesData)

  const createOrder = useCreateOrder()
  const updateOrder = useUpdateOrder()

  useEffect(() => {
    if (editOrder) {
      setOrderType(editOrder.order_type ?? defaultType)
      setStatus(editOrder.status ?? 'open')
      setOrderNumber(editOrder.order_number ?? '')
      setCargoDescription(editOrder.cargo_description ?? '')
      setCargoWeightKg(editOrder.cargo_weight_kg != null ? String(editOrder.cargo_weight_kg) : '')
      setCargoVolumeM3(editOrder.cargo_volume_m3 != null ? String(editOrder.cargo_volume_m3) : '')
      setPickupAddress(editOrder.pickup_address ?? '')
      setDeliveryAddress(editOrder.delivery_address ?? '')
      setPickupDate(editOrder.pickup_date ? editOrder.pickup_date.slice(0, 10) : '')
      setDeliveryDate(editOrder.delivery_date ? editOrder.delivery_date.slice(0, 10) : '')
      setPrice(editOrder.price != null ? String(editOrder.price) : '')
      setDistanceKm(editOrder.distance_km != null ? String(editOrder.distance_km) : '')
      setSpecialRequirements(editOrder.special_requirements ?? '')
      setUsersId(editOrder.users_id ?? '')
      setVehiclesId(editOrder.vehicles_id ?? '')
    } else {
      setOrderType(defaultType)
      setStatus('open')
      setOrderNumber('')
      setCargoDescription('')
      setCargoWeightKg('')
      setCargoVolumeM3('')
      setPickupAddress('')
      setDeliveryAddress('')
      setPickupDate('')
      setDeliveryDate('')
      setPrice('')
      setDistanceKm('')
      setSpecialRequirements('')
      setUsersId('')
      setVehiclesId('')
    }
  }, [editOrder, defaultType, open])

  const handleSubmit = () => {
    const payload: Partial<Order> = {
      order_type: orderType as Order['order_type'],
      status: status as Order['status'],
      order_number: orderNumber || undefined,
      cargo_description: cargoDescription || undefined,
      cargo_weight_kg: cargoWeightKg ? parseFloat(cargoWeightKg) : undefined,
      cargo_volume_m3: cargoVolumeM3 ? parseFloat(cargoVolumeM3) : undefined,
      pickup_address: pickupAddress || undefined,
      delivery_address: deliveryAddress || undefined,
      pickup_date: pickupDate || undefined,
      delivery_date: deliveryDate || undefined,
      price: price ? parseFloat(price) : undefined,
      distance_km: distanceKm ? parseFloat(distanceKm) : undefined,
      special_requirements: specialRequirements || undefined,
      ...(usersId ? { users_id: usersId } : {}),
      ...(vehiclesId ? { vehicles_id: vehiclesId } : {}),
    }

    if (isEdit && editOrder) {
      updateOrder.mutate({ guid: editOrder.guid, ...payload }, { onSuccess: onClose })
    } else {
      createOrder.mutate(payload, { onSuccess: onClose })
    }
  }

  const isPending = createOrder.isPending || updateOrder.isPending

  return (
    <FormModal
      open={open}
      title={isEdit ? 'Edit Order' : `Create ${orderType.charAt(0).toUpperCase() + orderType.slice(1)} Order`}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
      submitLabel={isEdit ? 'Update' : 'Create'}
    >
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Order Number</Label>
            <Input value={orderNumber} onChange={e => setOrderNumber(e.target.value)} placeholder="ORD-001" />
          </div>
          <div className="space-y-1">
            <Label>Order Type</Label>
            <Select value={orderType} onValueChange={setOrderType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="classic">Classic</SelectItem>
                <SelectItem value="tender">Tender</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="bidding">Bidding</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_transit">In Transit</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Cargo Description</Label>
          <Textarea
            value={cargoDescription}
            onChange={e => setCargoDescription(e.target.value)}
            placeholder="Describe the cargo..."
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Weight (kg)</Label>
            <Input type="number" value={cargoWeightKg} onChange={e => setCargoWeightKg(e.target.value)} placeholder="0" />
          </div>
          <div className="space-y-1">
            <Label>Volume (m³)</Label>
            <Input type="number" value={cargoVolumeM3} onChange={e => setCargoVolumeM3(e.target.value)} placeholder="0" />
          </div>
        </div>

        <div className="space-y-1">
          <Label>Pickup Address</Label>
          <Input value={pickupAddress} onChange={e => setPickupAddress(e.target.value)} placeholder="123 Main St, City" />
        </div>

        <div className="space-y-1">
          <Label>Delivery Address</Label>
          <Input value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} placeholder="456 Oak Ave, City" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Pickup Date</Label>
            <Input type="date" value={pickupDate} onChange={e => setPickupDate(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Delivery Date</Label>
            <Input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Price (USD)</Label>
            <Input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0" />
          </div>
          <div className="space-y-1">
            <Label>Distance (km)</Label>
            <Input type="number" value={distanceKm} onChange={e => setDistanceKm(e.target.value)} placeholder="0" />
          </div>
        </div>

        <div className="space-y-1">
          <Label>Special Requirements</Label>
          <Textarea
            value={specialRequirements}
            onChange={e => setSpecialRequirements(e.target.value)}
            placeholder="Temperature control, fragile, etc."
            rows={2}
          />
        </div>

        <div className="space-y-1">
          <Label>Shipper (User)</Label>
          <Select value={usersId || 'none'} onValueChange={v => setUsersId(v === 'none' ? '' : v)}>
            <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— None —</SelectItem>
              {users.map(u => (
                <SelectItem key={u.guid} value={u.guid || 'fallback'}>
                  {(u.full_name ?? u.login ?? u.email) || u.guid}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Assigned Vehicle</Label>
          <Select value={vehiclesId || 'none'} onValueChange={v => setVehiclesId(v === 'none' ? '' : v)}>
            <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— None —</SelectItem>
              {vehicles.map(v => (
                <SelectItem key={v.guid} value={v.guid || 'fallback'}>
                  {v.plate_number || `${v.make ?? ''} ${v.model ?? ''}`.trim() || v.guid}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </FormModal>
  )
}
