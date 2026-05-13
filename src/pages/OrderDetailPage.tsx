import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Edit,
  XCircle,
  CheckCircle2,
  MapPin,
  Package,
  Clock,
  DollarSign,
  Truck,
  MessageSquare,
  FileText,
  User,
  Loader2,
  Calendar,
  Weight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { OrderFormModal } from '@/components/orders/OrderFormModal'
import { useOrder, useCancelOrder, useUpdateOrder } from '@/hooks/useOrders'
import { useApiQuery } from '@/hooks/useApi'
import { extractList, extractSingle } from '@/lib/apiUtils'
import { formatDate, formatCurrency, truncate, getInitials } from '@/lib/utils'
import type { Order, Bid, TrackingUpdate, Transaction, Message, Vehicle, User as UserType } from '@/types'

const thumbPool = [
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/e366fe8e-ab6b-4255-9660-88f1f8b50f56_img_00.jpg',
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/55f659c3-b3a2-4556-b5db-fc5b94f7e77e_img_01.jpg',
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/07e77e71-697c-431b-84b0-d1e0b2a24725_img_02.jpg',
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/535adcd3-0569-420d-9ebd-3b1caa087e2b_img_03.jpg',
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/392a171f-7c47-4ce9-b933-c38a078bd1e6_img_04.jpg',
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/ffcb0e6c-9406-41c5-ad25-4b5fea578077_img_05.jpg',
]

function orderTypeBadgeVariant(type?: string) {
  if (type === 'classic') return 'info'
  if (type === 'tender') return 'warning'
  if (type === 'private') return 'secondary'
  return 'outline'
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [showEdit, setShowEdit] = useState(false)

  const { data: orderData, isLoading } = useOrder(id ?? '')
  const order = extractSingle<Order>(orderData)

  const { data: bidsData } = useApiQuery<unknown>(
    ['bids', 'order', id],
    '/v2/items/bids'
  )
  const bids = extractList<Bid>(bidsData).filter(b => b.orders_id === id)

  const { data: trackingData } = useApiQuery<unknown>(
    ['tracking', 'order', id],
    '/v2/items/tracking'
  )
  const trackingUpdates = extractList<TrackingUpdate>(trackingData)
    .filter(t => t.orders_id === id)
    .sort((a, b) => new Date(b.timestamp ?? '').getTime() - new Date(a.timestamp ?? '').getTime())

  const { data: transactionsData } = useApiQuery<unknown>(
    ['transactions', 'order', id],
    '/v2/items/transactions'
  )
  const transactions = extractList<Transaction>(transactionsData).filter(t => t.orders_id === id)

  const { data: messagesData } = useApiQuery<unknown>(
    ['messages', 'order', id],
    '/v2/items/messages'
  )
  const messages = extractList<Message>(messagesData).filter(m => m.orders_id === id)

  const { data: usersData } = useApiQuery<unknown>(['users'], '/v2/items/users')
  const users = extractList<UserType>(usersData)

  const { data: vehiclesData } = useApiQuery<unknown>(['vehicles'], '/v2/items/vehicles')
  const vehicles = extractList<Vehicle>(vehiclesData)

  const cancelOrder = useCancelOrder()
  const completeOrder = useUpdateOrder()

  const assignedUser = users.find(u => u.guid === order?.users_id)
  const assignedVehicle = vehicles.find(v => v.guid === order?.vehicles_id)

  const handleCancel = () => {
    if (!order) return
    cancelOrder.mutate({ guid: order.guid, status: 'cancelled' })
  }

  const handleComplete = () => {
    if (!order) return
    completeOrder.mutate({ guid: order.guid, status: 'completed' })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-48" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
        <p className="text-muted-foreground mb-4">This order does not exist or has been removed.</p>
        <Button variant="outline" onClick={() => navigate('/orders')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </div>
    )
  }

  const totalPaid = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + (t.amount ?? 0), 0)
  const outstanding = (order.price ?? 0) - totalPaid

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate('/orders')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-semibold">{order.order_number ?? 'Order Detail'}</h1>
              <Badge variant={orderTypeBadgeVariant(order.order_type) as any}>
                {(order.order_type ?? '').toUpperCase()}
              </Badge>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Created {formatDate(order.created_at ?? '')}
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setShowEdit(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          {order.status !== 'completed' && order.status !== 'cancelled' && (
            <>
              <Button
                variant="success"
                onClick={handleComplete}
                disabled={completeOrder.isPending}
              >
                {completeOrder.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Complete
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={cancelOrder.isPending}
              >
                {cancelOrder.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Two-column main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cargo Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4 text-primary" />
              Cargo Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Description</p>
              <p className="text-sm">{order.cargo_description ?? '—'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Weight</p>
                <p className="text-sm font-medium">
                  {order.cargo_weight_kg != null ? `${order.cargo_weight_kg} kg` : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Volume</p>
                <p className="text-sm font-medium">
                  {order.cargo_volume_m3 != null ? `${order.cargo_volume_m3} m³` : '—'}
                </p>
              </div>
            </div>
            {order.special_requirements && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Special Requirements</p>
                <p className="text-sm text-amber-700 bg-amber-50 rounded px-2 py-1.5">
                  {order.special_requirements}
                </p>
              </div>
            )}
            {order.documents && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Documents</p>
                <p className="text-sm">{order.documents}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Route Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4 text-primary" />
              Route Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Map placeholder */}
            <div className="relative h-32 rounded-lg overflow-hidden bg-muted">
              <img
                src={thumbPool[0]}
                alt="Route map"
                loading="lazy"
                className="w-full h-full object-cover opacity-60"
                onError={e => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs text-white bg-black/50 px-2 py-1 rounded">
                  Map view — {order.distance_km != null ? `${order.distance_km} km` : 'Distance N/A'}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-green-500 mt-1" />
                  <div className="w-0.5 h-8 bg-border my-1" />
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                </div>
                <div className="space-y-3 flex-1">
                  <div>
                    <p className="text-xs text-muted-foreground">Pickup</p>
                    <p className="text-sm font-medium">{order.pickup_address ?? '—'}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.pickup_date ?? '')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Delivery</p>
                    <p className="text-sm font-medium">{order.delivery_address ?? '—'}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.delivery_date ?? '')}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tracking Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-primary" />
            Tracking Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trackingUpdates.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No tracking updates yet.</p>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-4">
                {trackingUpdates.map((update, i) => (
                  <div key={update.guid} className="flex gap-4 relative">
                    <div className="h-8 w-8 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center flex-shrink-0 z-10">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium capitalize">{(update.event_type ?? '').replace('_', ' ')}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(update.timestamp ?? '')}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{update.location_name ?? '—'}</p>
                      {update.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{update.notes}</p>
                      )}
                      {update.photo_proof && (
                        <img
                          src={update.photo_proof ?? thumbPool[i % thumbPool.length]}
                          alt="Proof"
                          loading="lazy"
                          className="mt-2 h-16 w-24 object-cover rounded border"
                          onError={e => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bids Section — only for tender */}
      {order.order_type === 'tender' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-primary" />
              Bids ({bids.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bids.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No bids placed yet.</p>
            ) : (
              <div className="space-y-3">
                {bids.map(bid => {
                  const bidUser = users.find(u => u.guid === bid.users_id)
                  return (
                    <div key={bid.guid} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{getInitials(bidUser?.full_name ?? bidUser?.login)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{bidUser?.full_name ?? bidUser?.login ?? '—'}</p>
                          <p className="text-xs text-muted-foreground">
                            Transit: {bid.estimated_transit_hours != null ? `${bid.estimated_transit_hours}h` : '—'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">{formatCurrency(bid.bid_amount ?? 0)}</p>
                        <Badge
                          variant={
                            bid.status === 'accepted' ? 'success'
                              : bid.status === 'rejected' ? 'destructive'
                              : 'warning'
                          }
                          className="text-xs"
                        >
                          {bid.status ?? '—'}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Assigned Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned User */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-primary" />
              Shipper / Assigned User
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignedUser ? (
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={assignedUser.avatar ?? ''}
                    alt={assignedUser.full_name ?? ''}
                  />
                  <AvatarFallback>{getInitials(assignedUser.full_name ?? assignedUser.login)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{assignedUser.full_name ?? assignedUser.login ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">{assignedUser.email ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">{assignedUser.company_name ?? ''}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No user assigned.</p>
            )}
          </CardContent>
        </Card>

        {/* Assigned Vehicle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Truck className="h-4 w-4 text-primary" />
              Assigned Vehicle
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignedVehicle ? (
              <div className="flex items-center gap-3">
                <div className="h-10 w-16 rounded overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={assignedVehicle.photo ?? thumbPool[2]}
                    alt="Vehicle"
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={e => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.style.background = 'hsl(var(--muted))'; }}
                  />
                </div>
                <div>
                  <p className="font-medium">
                    {assignedVehicle.make ?? ''} {assignedVehicle.model ?? ''}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {assignedVehicle.plate_number ?? '—'} &middot; {assignedVehicle.vehicle_type ?? '—'}
                  </p>
                  <Badge variant="outline" className="text-xs mt-1">
                    {assignedVehicle.status ?? '—'}
                  </Badge>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No vehicle assigned.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-4 w-4 text-primary" />
            Financial Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Order Price</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(order.price ?? 0)}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-emerald-50">
              <p className="text-xs text-muted-foreground mb-1">Paid</p>
              <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-amber-50">
              <p className="text-xs text-muted-foreground mb-1">Outstanding</p>
              <p className="text-xl font-bold text-amber-600">{formatCurrency(Math.max(0, outstanding))}</p>
            </div>
          </div>

          {transactions.length > 0 && (
            <div className="mt-4 space-y-2">
              <Separator />
              <p className="text-sm font-medium pt-2">Transactions</p>
              {transactions.map(t => (
                <div key={t.guid} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t.transaction_number ?? t.guid.slice(0, 8)}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={t.status === 'completed' ? 'success' : t.status === 'failed' ? 'destructive' : 'warning'} className="text-xs">
                      {t.status ?? '—'}
                    </Badge>
                    <span className="font-medium">{formatCurrency(t.amount ?? 0)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Messages Thread */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4 text-primary" />
            Messages ({messages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No messages for this order.</p>
          ) : (
            <div className="space-y-3">
              {messages.map(msg => {
                const sender = users.find(u => u.guid === msg.users_id)
                return (
                  <div key={msg.guid} className="flex gap-3 p-3 rounded-lg bg-muted/40">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback>{getInitials(sender?.full_name ?? sender?.login)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{sender?.full_name ?? sender?.login ?? '—'}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(msg.created_at ?? '')}</span>
                        {!msg.is_read && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                      </div>
                      <p className="text-sm font-medium">{msg.subject ?? '—'}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{truncate(msg.body, 100)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <OrderFormModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        editOrder={order}
      />
    </div>
  )
}
