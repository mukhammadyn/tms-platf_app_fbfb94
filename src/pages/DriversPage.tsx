import React, { useState } from 'react'
import { Plus, LayoutGrid, LayoutList, Search, Filter } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { DriverCard } from '@/components/drivers/DriverCard'
import { DriverFormModal } from '@/components/drivers/DriverFormModal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDrivers } from '@/hooks/useDriversVehicles'
import { useApiQuery } from '@/hooks/useApi'
import { extractList } from '@/lib/apiUtils'
import type { DriverProfile, User } from '@/types'
import type { Column } from '@/components/shared/DataTable'
import { cn, formatDate } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'

function driverStatusVariant(status: string | undefined) {
  switch (status) {
    case 'available': return 'success' as const
    case 'on_trip': return 'warning' as const
    case 'off_duty': return 'secondary' as const
    case 'inactive': return 'destructive' as const
    default: return 'outline' as const
  }
}

export function DriversPage() {
  const [view, setView] = useState<'grid' | 'table'>('grid')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editDriver, setEditDriver] = useState<DriverProfile | null>(null)

  const { data, isLoading } = useDrivers()
  const { data: usersData } = useApiQuery<unknown>(['users'], '/v2/items/users')

  const drivers = extractList<DriverProfile>(data)
  const users = extractList<User>(usersData)

  const getUserForDriver = (driver: DriverProfile) =>
    users.find((u) => u.guid === driver.users_id)

  const filtered = drivers.filter((d) => {
    const user = getUserForDriver(d)
    const name = (user?.full_name ?? user?.login ?? '').toLowerCase()
    const license = (d.license_number ?? '').toLowerCase()
    const matchSearch = !search || name.includes(search.toLowerCase()) || license.includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || d.status === statusFilter
    return matchSearch && matchStatus
  })

  const columns: Column<DriverProfile>[] = [
    {
      key: 'users_id',
      label: 'Driver',
      render: (row) => {
        const user = getUserForDriver(row)
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar ?? ''} />
              <AvatarFallback className="text-xs">{getInitials(user?.full_name ?? user?.login)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{user?.full_name ?? user?.login ?? '—'}</p>
              <p className="text-xs text-muted-foreground">{user?.email ?? '—'}</p>
            </div>
          </div>
        )
      },
    },
    {
      key: 'license_number',
      label: 'License #',
      render: (row) => <span>{row.license_number ?? '—'}</span>,
    },
    {
      key: 'license_class',
      label: 'Class',
      render: (row) => <Badge variant="info">{row.license_class ?? '—'}</Badge>,
    },
    {
      key: 'experience_years',
      label: 'Experience',
      render: (row) => <span>{row.experience_years ?? '—'} yrs</span>,
    },
    {
      key: 'license_expiry',
      label: 'License Expiry',
      render: (row) => <span>{row.license_expiry ? formatDate(row.license_expiry) : '—'}</span>,
    },
    {
      key: 'hazmat_certified',
      label: 'HazMat',
      render: (row) => row.hazmat_certified ? <Badge variant="warning">Yes</Badge> : <span className="text-muted-foreground text-xs">No</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={driverStatusVariant(row.status)}>
          {(row.status ?? '—').replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'guid',
      label: 'Actions',
      render: (row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => { e.stopPropagation(); setEditDriver(row); setModalOpen(true) }}
        >
          Edit
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Drivers"
        subtitle={`${drivers.length} driver profiles`}
        action="Add Driver"
        onAction={() => { setEditDriver(null); setModalOpen(true) }}
        actionIcon={<Plus className="h-4 w-4" />}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-9"
            placeholder="Search drivers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <Filter className="h-4 w-4 mr-1.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="on_trip">On Trip</SelectItem>
            <SelectItem value="off_duty">Off Duty</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center border border-border rounded-md overflow-hidden ml-auto">
          <button
            onClick={() => setView('grid')}
            className={cn('p-2 transition-colors', view === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView('table')}
            className={cn('p-2 transition-colors', view === 'table' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}
          >
            <LayoutList className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : (
          <Skeleton className="h-64 w-full rounded-xl" />
        )
      ) : view === 'grid' ? (
        filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <p className="text-lg font-medium">No drivers found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((driver, i) => (
              <DriverCard
                key={driver.guid}
                driver={driver}
                user={getUserForDriver(driver)}
                index={i}
              />
            ))}
          </div>
        )
      ) : (
        <DataTable<DriverProfile>
          columns={columns}
          data={filtered}
          isLoading={isLoading}
          emptyMessage="No drivers found."
        />
      )}

      <DriverFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditDriver(null) }}
        driver={editDriver}
      />
    </div>
  )
}
