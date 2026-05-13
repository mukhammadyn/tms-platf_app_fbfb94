import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Eye, CheckCircle, XCircle } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import { CarrierStatusBadge } from './CarrierStatusBadge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials, truncate } from '@/lib/utils'
import type { CarrierProfile, User } from '@/types'
import type { Column } from '@/components/shared/DataTable'

interface CarrierRow {
  guid: string
  company_name?: string | null
  mc_number?: string | null
  dot_number?: string | null
  fleet_size?: number | null
  operating_regions?: string | null
  status?: string | null
  users_id?: string | null
  insurance_expiry?: string | null
  avatar?: string | null
}

interface CarrierTableProps {
  carriers: CarrierProfile[]
  users: User[]
  isLoading?: boolean
  onVerify?: (carrier: CarrierProfile) => void
  onSuspend?: (carrier: CarrierProfile) => void
}

export function CarrierTable({
  carriers,
  users,
  isLoading,
  onVerify,
  onSuspend,
}: CarrierTableProps) {
  const navigate = useNavigate()

  const rows: CarrierRow[] = carriers.map((c) => {
    const user = users.find((u) => u.guid === c.users_id)
    return {
      guid: c.guid,
      company_name: user?.company_name ?? user?.full_name ?? user?.login ?? null,
      mc_number: c.mc_number,
      dot_number: c.dot_number,
      fleet_size: c.fleet_size,
      operating_regions: c.operating_regions,
      status: c.status,
      users_id: c.users_id,
      insurance_expiry: c.insurance_expiry,
      avatar: user?.avatar,
    }
  })

  const columns: Column<CarrierRow>[] = [
    {
      key: 'company_name',
      label: 'Company',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={row.avatar ?? undefined}
              alt={row.company_name ?? 'Carrier'}
            />
            <AvatarFallback className="text-xs">
              {getInitials(row.company_name)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{row.company_name ?? '—'}</span>
        </div>
      ),
    },
    {
      key: 'mc_number',
      label: 'MC #',
      render: (row) => (
        <span className="font-mono text-sm">{row.mc_number ?? '—'}</span>
      ),
    },
    {
      key: 'dot_number',
      label: 'DOT #',
      render: (row) => (
        <span className="font-mono text-sm">{row.dot_number ?? '—'}</span>
      ),
    },
    {
      key: 'fleet_size',
      label: 'Fleet',
      render: (row) => (
        <span>{row.fleet_size != null ? `${row.fleet_size} vehicles` : '—'}</span>
      ),
    },
    {
      key: 'operating_regions',
      label: 'Regions',
      render: (row) => (
        <span className="text-sm text-muted-foreground">
          {truncate(row.operating_regions, 40)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <CarrierStatusBadge status={row.status} />,
    },
    {
      key: 'guid',
      label: 'Actions',
      render: (row) => {
        const carrier = carriers.find((c) => c.guid === row.guid)
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); navigate(`/carriers/${row.guid}`) }}
              title="View details"
            >
              <Eye className="h-4 w-4" />
            </Button>
            {carrier && row.status !== 'verified' && onVerify && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.stopPropagation(); onVerify(carrier) }}
                title="Verify carrier"
                className="text-emerald-600 hover:text-emerald-700"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}
            {carrier && row.status !== 'suspended' && onSuspend && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.stopPropagation(); onSuspend(carrier) }}
                title="Suspend carrier"
                className="text-destructive hover:text-destructive/80"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <DataTable<CarrierRow>
      columns={columns}
      data={rows}
      isLoading={isLoading}
      emptyMessage="No carrier profiles found."
      onRowClick={(row) => navigate(`/carriers/${row.guid}`)}
    />
  )
}
