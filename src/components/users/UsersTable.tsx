import React from 'react'
import { useNavigate } from 'react-router-dom'
import { MoreHorizontal, Eye, Pencil, UserX, UserCheck } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import type { Column } from '@/components/shared/DataTable'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { UserRoleBadge } from './UserRoleBadge'
import { useToggleUserStatus } from '@/hooks/useUsers'
import { getInitials, formatDate } from '@/lib/utils'
import type { User } from '@/types'

interface UsersTableProps {
  users: User[]
  isLoading: boolean
  onEdit: (user: User) => void
  roles: { guid: string; name: string }[]
}

export function UsersTable({ users, isLoading, onEdit, roles }: UsersTableProps) {
  const navigate = useNavigate()
  const toggleStatus = useToggleUserStatus()

  const getRoleName = (roleId?: string) => {
    if (!roleId) return null
    return roles.find(r => r.guid === roleId)?.name ?? null
  }

  const columns: Column<User>[] = [
    {
      key: 'avatar',
      label: '',
      render: (row) => (
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={row.avatar ?? ''}
            alt={row.full_name ?? ''}
            loading="lazy"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none' }}
          />
          <AvatarFallback className="text-xs">
            {getInitials(row.full_name ?? row.login)}
          </AvatarFallback>
        </Avatar>
      ),
    },
    {
      key: 'full_name',
      label: 'Name',
      render: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.full_name ?? '—'}</p>
          <p className="text-xs text-muted-foreground">{row.login ?? '—'}</p>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (row) => <span className="text-sm">{row.email ?? '—'}</span>,
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (row) => <span className="text-sm">{row.phone ?? '—'}</span>,
    },
    {
      key: 'role_id',
      label: 'Role',
      render: (row) => <UserRoleBadge role={getRoleName(row.role_id)} />,
    },
    {
      key: 'is_freelancer',
      label: 'Freelancer',
      render: (row) => row.is_freelancer
        ? <Badge variant="info">Freelancer</Badge>
        : <span className="text-muted-foreground text-xs">No</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const s = (row.status ?? '').toLowerCase()
        const variantMap: Record<string, 'success' | 'destructive' | 'warning' | 'secondary'> = {
          active: 'success',
          inactive: 'secondary',
          suspended: 'destructive',
          pending: 'warning',
        }
        return (
          <Badge variant={variantMap[s] ?? 'secondary'}>
            {row.status ?? '—'}
          </Badge>
        )
      },
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (row) => (
        <span className="text-sm">
          {row.rating != null ? `⭐ ${row.rating}` : '—'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Joined',
      render: (row) => <span className="text-sm text-muted-foreground">{formatDate(row.created_at)}</span>,
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate('/users/' + row.guid) }}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(row) }}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {(row.status ?? '').toLowerCase() === 'active' ? (
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleStatus.mutate({ guid: row.guid, status: 'suspended' })
                }}
              >
                <UserX className="h-4 w-4 mr-2" />
                Suspend
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                className="text-emerald-600 focus:text-emerald-600"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleStatus.mutate({ guid: row.guid, status: 'active' })
                }}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Activate
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <DataTable<User>
      columns={columns}
      data={users}
      isLoading={isLoading}
      emptyMessage="No users found."
      onRowClick={(row) => navigate('/users/' + row.guid)}
    />
  )
}
