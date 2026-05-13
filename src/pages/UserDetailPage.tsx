import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Pencil,
  Mail,
  Phone,
  MapPin,
  Building,
  Star,
  Hash,
  Send,
  Package,
  CreditCard,
  MessageSquare,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { UserFormModal } from '@/components/users/UserFormModal'
import { UserRoleBadge } from '@/components/users/UserRoleBadge'
import { FreelancerProfileSection } from '@/components/users/FreelancerProfileSection'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTable } from '@/components/shared/DataTable'
import type { Column } from '@/components/shared/DataTable'
import { useUser } from '@/hooks/useUsers'
import { useApiQuery } from '@/hooks/useApi'
import { extractList, extractSingle } from '@/lib/apiUtils'
import { getInitials, formatDate, formatCurrency, truncate } from '@/lib/utils'
import type { User, Order, Transaction } from '@/types'

const thumbPool = [
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/e366fe8e-ab6b-4255-9660-88f1f8b50f56_img_00.jpg',
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/55f659c3-b3a2-4556-b5db-fc5b94f7e77e_img_01.jpg',
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/07e77e71-697c-431b-84b0-d1e0b2a24725_img_02.jpg',
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/535adcd3-0569-420d-9ebd-3b1caa087e2b_img_03.jpg',
]

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)

  const { data: userData, isLoading } = useUser(id ?? '')
  const user = extractSingle<User>(userData)

  const { data: rolesData } = useApiQuery<unknown>(['roles'], '/v2/items/role')
  const roles = extractList<{ guid: string; name: string }>(rolesData)

  const { data: ordersData, isLoading: ordersLoading } = useApiQuery<unknown>(
    ['orders', 'user', id],
    '/v2/items/orders'
  )
  const allOrders = extractList<Order>(ordersData)
  const userOrders = allOrders.filter(o => o.users_id === id)

  const { data: txData, isLoading: txLoading } = useApiQuery<unknown>(
    ['transactions', 'user', id],
    '/v2/items/transactions'
  )
  const allTransactions = extractList<Transaction>(txData)
  const userTransactions = allTransactions.filter(t => t.users_id === id)

  const getRoleName = (roleId?: string) => {
    if (!roleId) return null
    return roles.find(r => r.guid === roleId)?.name ?? null
  }

  const orderColumns: Column<Order>[] = [
    {
      key: 'order_number',
      label: 'Order #',
      render: (row) => <span className="font-medium">{row.order_number ?? '—'}</span>,
    },
    {
      key: 'order_type',
      label: 'Type',
      render: (row) => <Badge variant="info">{row.order_type ?? '—'}</Badge>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const s = (row.status ?? '').toLowerCase()
        const vmap: Record<string, 'success' | 'warning' | 'info' | 'destructive' | 'secondary'> = {
          completed: 'success',
          in_transit: 'warning',
          assigned: 'info',
          open: 'secondary',
          cancelled: 'destructive',
          bidding: 'warning',
        }
        return <Badge variant={vmap[s] ?? 'secondary'}>{row.status ?? '—'}</Badge>
      },
    },
    {
      key: 'price',
      label: 'Price',
      render: (row) => <span>{formatCurrency(row.price ?? 0)}</span>,
    },
    {
      key: 'pickup_date',
      label: 'Pickup Date',
      render: (row) => <span className="text-muted-foreground">{formatDate(row.pickup_date ?? '')}</span>,
    },
  ]

  const txColumns: Column<Transaction>[] = [
    {
      key: 'transaction_number',
      label: 'Tx #',
      render: (row) => <span className="font-medium">{row.transaction_number ?? '—'}</span>,
    },
    {
      key: 'type',
      label: 'Type',
      render: (row) => {
        const t = (row.type ?? '').toLowerCase()
        const vmap: Record<string, 'success' | 'info' | 'destructive' | 'default' | 'secondary'> = {
          payment: 'success',
          invoice: 'info',
          refund: 'destructive',
          commission: 'default',
          payout: 'secondary',
        }
        return <Badge variant={vmap[t] ?? 'secondary'}>{row.type ?? '—'}</Badge>
      },
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (row) => <span className="font-medium">{formatCurrency(row.amount ?? 0)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const s = (row.status ?? '').toLowerCase()
        const vmap: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
          completed: 'success',
          pending: 'warning',
          failed: 'destructive',
          cancelled: 'destructive',
          overdue: 'warning',
        }
        return <Badge variant={vmap[s] ?? 'secondary'}>{row.status ?? '—'}</Badge>
      },
    },
    {
      key: 'paid_date',
      label: 'Paid Date',
      render: (row) => <span className="text-muted-foreground">{formatDate(row.paid_date ?? '')}</span>,
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="text-lg">User not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/users')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
      </div>
    )
  }

  const statusColorMap: Record<string, string> = {
    active: 'text-emerald-600',
    inactive: 'text-muted-foreground',
    suspended: 'text-destructive',
    pending: 'text-amber-600',
  }
  const statusColor = statusColorMap[(user.status ?? '').toLowerCase()] ?? 'text-muted-foreground'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/users')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title={user.full_name ?? user.login ?? 'User Detail'}
          subtitle={user.email ?? ''}
          action="Edit User"
          onAction={() => setEditOpen(true)}
          actionIcon={<Pencil className="h-4 w-4" />}
        />
      </div>

      {/* Profile Hero Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-24 w-24 ring-2 ring-border">
                <AvatarImage
                  src={user.avatar ?? ''}
                  alt={user.full_name ?? ''}
                  loading="lazy"
                  className="object-cover"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none' }}
                />
                <AvatarFallback className="text-2xl">
                  {getInitials(user.full_name ?? user.login)}
                </AvatarFallback>
              </Avatar>
              <span className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-background ${
                (user.status ?? '').toLowerCase() === 'active' ? 'bg-emerald-500' :
                (user.status ?? '').toLowerCase() === 'suspended' ? 'bg-destructive' :
                'bg-muted-foreground'
              }`} />
            </div>

            {/* Info */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold">{user.full_name ?? '—'}</h2>
                <UserRoleBadge role={getRoleName(user.role_id)} />
                {user.is_freelancer && <Badge variant="info">Freelancer</Badge>}
                <Badge
                  variant={
                    (user.status ?? '').toLowerCase() === 'active' ? 'success' :
                    (user.status ?? '').toLowerCase() === 'suspended' ? 'destructive' :
                    'secondary'
                  }
                >
                  {user.status ?? '—'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                {user.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span>{user.email}</span>
                  </div>
                )}
                {user.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user.company_name && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building className="h-4 w-4 flex-shrink-0" />
                    <span>{user.company_name}</span>
                  </div>
                )}
                {user.address && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span>{user.address}</span>
                  </div>
                )}
                {user.rating != null && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Star className="h-4 w-4 flex-shrink-0 text-amber-500" />
                    <span>{user.rating} / 5</span>
                  </div>
                )}
                {user.telegram_chat_id && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Send className="h-4 w-4 flex-shrink-0" />
                    <span>{user.telegram_chat_id}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground border-t border-border pt-3 mt-2">
                <span>Login: <span className="text-foreground font-medium">{user.login ?? '—'}</span></span>
                {user.tin && <span>TIN: <span className="text-foreground font-medium">{user.tin}</span></span>}
                <span>Joined: <span className="text-foreground">{formatDate(user.created_at)}</span></span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Freelancer Section */}
      {user.is_freelancer && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-foreground">Freelancer Profiles</h3>
          <FreelancerProfileSection userId={user.guid} />
        </div>
      )}

      {/* Tabs: Orders & Transactions */}
      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">
            <Package className="h-4 w-4 mr-2" />
            Orders ({userOrders.length})
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <CreditCard className="h-4 w-4 mr-2" />
            Transactions ({userTransactions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-4">
          <DataTable<Order>
            columns={orderColumns}
            data={userOrders}
            isLoading={ordersLoading}
            emptyMessage="No orders found for this user."
            onRowClick={(row) => navigate('/orders/' + row.guid)}
          />
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          <DataTable<Transaction>
            columns={txColumns}
            data={userTransactions}
            isLoading={txLoading}
            emptyMessage="No transactions found for this user."
          />
        </TabsContent>
      </Tabs>

      <UserFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        editUser={user}
      />
    </div>
  )
}
