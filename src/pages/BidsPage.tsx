import React, { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { BidTable } from '@/components/bids/BidTable'
import { BidDetailModal } from '@/components/bids/BidDetailModal'
import { BidFormModal } from '@/components/bids/BidFormModal'
import { BidComparisonView } from '@/components/bids/BidComparisonView'
import { useBids, useAcceptBid, useRejectBid } from '@/hooks/useBids'
import { useApiQuery } from '@/hooks/useApi'
import { extractList } from '@/lib/apiUtils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Plus, Search, Filter, DollarSign, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Bid } from '@/types'

export function BidsPage() {
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [search, setSearch] = useState<string>('')
  const [acceptingId, setAcceptingId] = useState<string | undefined>()
  const [rejectingId, setRejectingId] = useState<string | undefined>()

  const { data: bidsData, isLoading } = useBids()
  const bids = extractList<Bid>(bidsData)

  const { data: ordersData } = useApiQuery<unknown>(['orders'], '/v2/items/orders')
  const orders = extractList<{ guid: string; order_number?: string; order_type?: string }>(ordersData)

  const { data: usersData } = useApiQuery<unknown>(['users'], '/v2/items/users')
  const users = extractList<{ guid: string; full_name?: string; company_name?: string; avatar?: string; rating?: number }>(usersData)

  const acceptBid = useAcceptBid()
  const rejectBid = useRejectBid()

  // KPIs
  const totalBids = bids.length
  const pendingBids = bids.filter((b) => b.status === 'pending').length
  const acceptedBids = bids.filter((b) => b.status === 'accepted').length
  const rejectedBids = bids.filter((b) => b.status === 'rejected').length
  const avgAmount =
    bids.length > 0
      ? bids.reduce((sum, b) => sum + (b.bid_amount ?? 0), 0) / bids.length
      : 0

  // Filter
  const filtered = bids.filter((b) => {
    const matchStatus = statusFilter === 'all' || b.status === statusFilter
    if (!matchStatus) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    const order = orders.find((o) => o.guid === b.orders_id)
    const user = users.find((u) => u.guid === b.users_id)
    const orderNum = (order?.order_number ?? '').toLowerCase()
    const userName = ((user?.full_name ?? '') + ' ' + (user?.company_name ?? '')).toLowerCase()
    return orderNum.includes(q) || userName.includes(q)
  })

  function handleView(bid: Bid) {
    setSelectedBid(bid)
    setDetailOpen(true)
  }

  function handleAccept(bid: Bid) {
    setAcceptingId(bid.guid)
    acceptBid.mutate(
      { guid: bid.guid, status: 'accepted' },
      {
        onSettled: () => {
          setAcceptingId(undefined)
          setDetailOpen(false)
        },
      }
    )
  }

  function handleReject(bid: Bid) {
    setRejectingId(bid.guid)
    rejectBid.mutate(
      { guid: bid.guid, status: 'rejected' },
      {
        onSettled: () => {
          setRejectingId(undefined)
          setDetailOpen(false)
        },
      }
    )
  }

  const selectedOrder = selectedBid
    ? orders.find((o) => o.guid === selectedBid.orders_id) ?? null
    : null
  const selectedCarrier = selectedBid
    ? users.find((u) => u.guid === selectedBid.users_id) ?? null
    : null

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bids"
        subtitle="Manage and review all carrier bids for tender orders"
        action="Submit Bid"
        onAction={() => setFormOpen(true)}
        actionIcon={<Plus className="h-4 w-4" />}
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Bids</p>
                <p className="text-xl font-bold">{totalBids}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-xl font-bold">{pendingBids}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Accepted</p>
                <p className="text-xl font-bold">{acceptedBids}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Amount</p>
                <p className="text-xl font-bold">{formatCurrency(avgAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: List view + Comparison view */}
      <Tabs defaultValue="list">
        <div className="flex items-center justify-between mb-3 gap-4">
          <TabsList>
            <TabsTrigger value="list">All Bids</TabsTrigger>
            <TabsTrigger value="compare">
              Compare Pending
              {pendingBids > 0 && (
                <Badge variant="warning" className="ml-2 text-[10px] px-1.5 py-0">
                  {pendingBids}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by order # or carrier..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="withdrawn">Withdrawn</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="list">
          <BidTable
            bids={filtered}
            isLoading={isLoading}
            orders={orders}
            users={users}
            onView={handleView}
            onAccept={handleAccept}
            onReject={handleReject}
          />
          <div className="mt-3 text-xs text-muted-foreground text-right">
            {filtered.length} of {bids.length} bid{bids.length !== 1 ? 's' : ''}
          </div>
        </TabsContent>

        <TabsContent value="compare">
          <BidComparisonView
            bids={filtered}
            users={users}
            onAccept={handleAccept}
            onReject={handleReject}
            isAccepting={acceptBid.isPending}
            isRejecting={rejectBid.isPending}
            acceptingId={acceptingId}
            rejectingId={rejectingId}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <BidDetailModal
        open={detailOpen}
        bid={selectedBid}
        order={selectedOrder}
        carrier={selectedCarrier}
        onClose={() => { setDetailOpen(false); setSelectedBid(null) }}
        onAccept={handleAccept}
        onReject={handleReject}
        isAccepting={acceptBid.isPending && acceptingId === selectedBid?.guid}
        isRejecting={rejectBid.isPending && rejectingId === selectedBid?.guid}
      />

      <BidFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
      />
    </div>
  )
}
