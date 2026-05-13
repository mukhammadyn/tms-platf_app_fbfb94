import React, { useState } from 'react'
import { UserPlus, Search, Filter } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { UsersTable } from '@/components/users/UsersTable'
import { UserFormModal } from '@/components/users/UserFormModal'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { useUsers } from '@/hooks/useUsers'
import { useApiQuery } from '@/hooks/useApi'
import { extractList, extractCount } from '@/lib/apiUtils'
import type { User } from '@/types'

export function UsersPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [freelancerFilter, setFreelancerFilter] = useState('all')

  const { data, isLoading } = useUsers()
  const users = extractList<User>(data)
  const total = extractCount(data)

  const { data: rolesData } = useApiQuery<unknown>(['roles'], '/v2/items/role')
  const roles = extractList<{ guid: string; name: string }>(rolesData)

  const filtered = users.filter((u) => {
    const lc = search.toLowerCase()
    const matchSearch =
      !search ||
      (u.full_name ?? '').toLowerCase().includes(lc) ||
      (u.login ?? '').toLowerCase().includes(lc) ||
      (u.email ?? '').toLowerCase().includes(lc) ||
      (u.company_name ?? '').toLowerCase().includes(lc)

    const matchStatus =
      statusFilter === 'all' || (u.status ?? '').toLowerCase() === statusFilter

    const matchFreelancer =
      freelancerFilter === 'all' ||
      (freelancerFilter === 'yes' && u.is_freelancer === true) ||
      (freelancerFilter === 'no' && !u.is_freelancer)

    return matchSearch && matchStatus && matchFreelancer
  })

  const handleEdit = (user: User) => {
    setEditUser(user)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditUser(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        subtitle={`${total} total users`}
        action="Add User"
        onAction={() => { setEditUser(null); setModalOpen(true) }}
        actionIcon={<UserPlus className="h-4 w-4" />}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: total, color: 'text-primary' },
          { label: 'Active', value: users.filter(u => (u.status ?? '').toLowerCase() === 'active').length, color: 'text-emerald-600' },
          { label: 'Suspended', value: users.filter(u => (u.status ?? '').toLowerCase() === 'suspended').length, color: 'text-destructive' },
          { label: 'Freelancers', value: users.filter(u => u.is_freelancer).length, color: 'text-blue-600' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-9"
            placeholder="Search by name, login, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Select value={freelancerFilter} onValueChange={setFreelancerFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Freelancer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="yes">Freelancers Only</SelectItem>
            <SelectItem value="no">Non-Freelancers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <UsersTable
        users={filtered}
        isLoading={isLoading}
        onEdit={handleEdit}
        roles={roles}
      />

      <UserFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        editUser={editUser}
      />
    </div>
  )
}
