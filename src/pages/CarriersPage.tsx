import React, { useState } from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { CarrierTable } from '@/components/carriers/CarrierTable'
import { FormModal } from '@/components/shared/FormModal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useCarriers, useVerifyCarrier, useSuspendCarrier, useUpdateCarrierProfile } from '@/hooks/useCarriers'
import { useApiQuery } from '@/hooks/useApi'
import { extractList, extractCount } from '@/lib/apiUtils'
import type { CarrierProfile, User } from '@/types'

export function CarriersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedCarrier, setSelectedCarrier] = useState<CarrierProfile | null>(null)
  const [editForm, setEditForm] = useState<Partial<CarrierProfile>>({})

  const { data: carriersData, isLoading: carriersLoading } = useCarriers()
  const { data: usersData } = useApiQuery<unknown>(['users'], '/v2/items/users')

  const carriers = extractList<CarrierProfile>(carriersData)
  const users = extractList<User>(usersData)
  const total = extractCount(carriersData)

  const verifyMutation = useVerifyCarrier()
  const suspendMutation = useSuspendCarrier()
  const updateMutation = useUpdateCarrierProfile()

  const handleVerify = (carrier: CarrierProfile) => {
    verifyMutation.mutate({ guid: carrier.guid, status: 'verified' })
  }

  const handleSuspend = (carrier: CarrierProfile) => {
    suspendMutation.mutate({ guid: carrier.guid, status: 'suspended' })
  }

  const handleEdit = (carrier: CarrierProfile) => {
    setSelectedCarrier(carrier)
    setEditForm({
      mc_number: carrier.mc_number,
      dot_number: carrier.dot_number,
      fleet_size: carrier.fleet_size,
      insurance_provider: carrier.insurance_provider,
      insurance_policy_number: carrier.insurance_policy_number,
      operating_regions: carrier.operating_regions,
    })
    setEditModalOpen(true)
  }

  const handleEditSubmit = () => {
    if (!selectedCarrier) return
    updateMutation.mutate(
      { ...editForm, guid: selectedCarrier.guid },
      {
        onSuccess: () => {
          setEditModalOpen(false)
          setSelectedCarrier(null)
        },
      }
    )
  }

  // Filter carriers
  const filteredCarriers = carriers.filter((c) => {
    const user = users.find((u) => u.guid === c.users_id)
    const name = (user?.company_name ?? user?.full_name ?? user?.login ?? '').toLowerCase()
    const mc = (c.mc_number ?? '').toLowerCase()
    const dot = (c.dot_number ?? '').toLowerCase()
    const q = searchQuery.toLowerCase()

    const matchesSearch = !q || name.includes(q) || mc.includes(q) || dot.includes(q)
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: carriers.length,
    verified: carriers.filter((c) => c.status === 'verified').length,
    pending: carriers.filter((c) => c.status === 'pending_review').length,
    suspended: carriers.filter((c) => c.status === 'suspended').length,
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Carrier Profiles"
        subtitle={`${total} total carriers`}
      />

      {/* KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-foreground' },
          { label: 'Verified', value: stats.verified, color: 'text-emerald-600' },
          { label: 'Pending Review', value: stats.pending, color: 'text-amber-600' },
          { label: 'Suspended', value: stats.suspended, color: 'text-destructive' },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-border bg-card p-4"
          >
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-semibold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Hero image */}
      <div className="relative h-32 rounded-xl overflow-hidden">
        <img
          src="https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/55f659c3-b3a2-4556-b5db-fc5b94f7e77e_img_01.jpg"
          alt="Carrier fleet"
          loading="lazy"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.style.display = 'none'
            if (e.currentTarget.parentElement) {
              e.currentTarget.parentElement.style.background =
                'linear-gradient(135deg,hsl(var(--muted)),hsl(var(--accent)/0.2))'
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 to-transparent flex items-center px-6">
          <div>
            <h2 className="text-white font-semibold text-lg">Carrier Management</h2>
            <p className="text-white/80 text-sm">Verify, monitor, and manage carrier profiles</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by company, MC#, DOT#..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-44">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="pending_review">Pending Review</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <CarrierTable
        carriers={filteredCarriers}
        users={users}
        isLoading={carriersLoading}
        onVerify={handleVerify}
        onSuspend={handleSuspend}
      />

      {/* Edit Modal */}
      <FormModal
        open={editModalOpen}
        title="Edit Carrier Profile"
        onClose={() => { setEditModalOpen(false); setSelectedCarrier(null) }}
        onSubmit={handleEditSubmit}
        isSubmitting={updateMutation.isPending}
        submitLabel="Save Changes"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>MC Number</Label>
              <Input
                value={editForm.mc_number ?? ''}
                onChange={(e) => setEditForm((f) => ({ ...f, mc_number: e.target.value }))}
                placeholder="MC-XXXXXX"
              />
            </div>
            <div className="space-y-1.5">
              <Label>DOT Number</Label>
              <Input
                value={editForm.dot_number ?? ''}
                onChange={(e) => setEditForm((f) => ({ ...f, dot_number: e.target.value }))}
                placeholder="DOT-XXXXXXX"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Fleet Size</Label>
            <Input
              type="number"
              value={editForm.fleet_size ?? ''}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, fleet_size: Number(e.target.value) || undefined }))
              }
              placeholder="Number of vehicles"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Insurance Provider</Label>
            <Input
              value={editForm.insurance_provider ?? ''}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, insurance_provider: e.target.value }))
              }
              placeholder="Insurance company name"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Policy Number</Label>
            <Input
              value={editForm.insurance_policy_number ?? ''}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, insurance_policy_number: e.target.value }))
              }
              placeholder="Policy number"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Operating Regions</Label>
            <Input
              value={editForm.operating_regions ?? ''}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, operating_regions: e.target.value }))
              }
              placeholder="e.g. Southeast, Midwest"
            />
          </div>
        </div>
      </FormModal>
    </div>
  )
}
