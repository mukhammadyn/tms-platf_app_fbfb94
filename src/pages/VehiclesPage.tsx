import React, { useState } from 'react'
import { Plus, LayoutGrid, LayoutList, Search, Filter, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { VehicleCard } from '@/components/vehicles/VehicleCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormModal } from '@/components/shared/FormModal'
import { Textarea } from '@/components/ui/textarea'
import { useVehicles, useCreateVehicle, useUpdateVehicle } from '@/hooks/useDriversVehicles'
import { useApiQuery } from '@/hooks/useApi'
import { extractList } from '@/lib/apiUtils'
import { cn, formatDate } from '@/lib/utils'
import type { Vehicle, User } from '@/types'
import type { Column } from '@/components/shared/DataTable'

const vehicleTypes = ['flatbed', 'dry_van', 'reefer', 'tanker', 'container', 'lowboy', 'step_deck', 'box_truck', 'other']
const vehicleStatuses = ['available', 'on_trip', 'maintenance', 'inactive']

function vehicleStatusVariant(status: string | undefined) {
  switch (status) {
    case 'available': return 'success' as const
    case 'on_trip': return 'warning' as const
    case 'maintenance': return 'info' as const
    case 'inactive': return 'secondary' as const
    default: return 'outline' as const
  }
}

interface VehicleFormState {
  plate_number: string
  vehicle_type: string
  make: string
  model: string
  year: string
  max_payload_kg: string
  max_volume_m3: string
  status: string
  insurance_expiry: string
  inspection_expiry: string
  photo: string
  users_id: string
}

const emptyForm: VehicleFormState = {
  plate_number: '',
  vehicle_type: '',
  make: '',
  model: '',
  year: '',
  max_payload_kg: '',
  max_volume_m3: '',
  status: 'available',
  insurance_expiry: '',
  inspection_expiry: '',
  photo: '',
  users_id: '',
}

function vehicleToForm(v: Vehicle): VehicleFormState {
  return {
    plate_number: v.plate_number ?? '',
    vehicle_type: v.vehicle_type ?? '',
    make: v.make ?? '',
    model: v.model ?? '',
    year: String(v.year ?? ''),
    max_payload_kg: String(v.max_payload_kg ?? ''),
    max_volume_m3: String(v.max_volume_m3 ?? ''),
    status: v.status ?? 'available',
    insurance_expiry: v.insurance_expiry ?? '',
    inspection_expiry: v.inspection_expiry ?? '',
    photo: v.photo ?? '',
    users_id: v.users_id ?? '',
  }
}

export function VehiclesPage() {
  const [view, setView] = useState<'grid' | 'table'>('grid')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null)
  const [form, setForm] = useState<VehicleFormState>(emptyForm)

  const { data, isLoading } = useVehicles()
  const { data: usersData } = useApiQuery<unknown>(['users'], '/v2/items/users')
  const createMutation = useCreateVehicle()
  const updateMutation = useUpdateVehicle()

  const vehicles = extractList<Vehicle>(data)
  const users = extractList<User>(usersData)

  const filtered = vehicles.filter((v) => {
    const plate = (v.plate_number ?? '').toLowerCase()
    const makeModel = `${v.make ?? ''} ${v.model ?? ''}`.toLowerCase()
    const matchSearch = !search || plate.includes(search.toLowerCase()) || makeModel.includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || v.status === statusFilter
    const matchType = typeFilter === 'all' || v.vehicle_type === typeFilter
    return matchSearch && matchStatus && matchType
  })

  function openCreate() {
    setEditVehicle(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(vehicle: Vehicle, e?: React.MouseEvent) {
    e?.stopPropagation()
    setEditVehicle(vehicle)
    setForm(vehicleToForm(vehicle))
    setModalOpen(true)
  }

  function handleSubmit() {
    const payload: Partial<Vehicle> = {
      plate_number: form.plate_number || undefined,
      vehicle_type: (form.vehicle_type || undefined) as Vehicle['vehicle_type'],
      make: form.make || undefined,
      model: form.model || undefined,
      year: form.year ? Number(form.year) : undefined,
      max_payload_kg: form.max_payload_kg ? Number(form.max_payload_kg) : undefined,
      max_volume_m3: form.max_volume_m3 ? Number(form.max_volume_m3) : undefined,
      status: (form.status || undefined) as Vehicle['status'],
      insurance_expiry: form.insurance_expiry || undefined,
      inspection_expiry: form.inspection_expiry || undefined,
      photo: form.photo || undefined,
      ...(form.users_id ? { users_id: form.users_id } : {}),
    }
    if (editVehicle) {
      updateMutation.mutate({ ...payload, guid: editVehicle.guid }, { onSuccess: () => setModalOpen(false) })
    } else {
      createMutation.mutate(payload, { onSuccess: () => setModalOpen(false) })
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  const columns: Column<Vehicle>[] = [
    {
      key: 'plate_number',
      label: 'Plate',
      render: (row) => <span className="font-medium">{row.plate_number ?? '—'}</span>,
    },
    {
      key: 'vehicle_type',
      label: 'Type',
      render: (row) => <Badge variant="info" className="capitalize">{(row.vehicle_type ?? '—').replace('_', ' ')}</Badge>,
    },
    {
      key: 'make',
      label: 'Make / Model',
      render: (row) => <span>{row.make ?? '—'} {row.model ?? ''}</span>,
    },
    {
      key: 'year',
      label: 'Year',
      render: (row) => <span>{row.year ?? '—'}</span>,
    },
    {
      key: 'max_payload_kg',
      label: 'Payload (kg)',
      render: (row) => <span>{row.max_payload_kg ?? '—'}</span>,
    },
    {
      key: 'max_volume_m3',
      label: 'Volume (m³)',
      render: (row) => <span>{row.max_volume_m3 ?? '—'}</span>,
    },
    {
      key: 'insurance_expiry',
      label: 'Insurance Exp.',
      render: (row) => <span>{row.insurance_expiry ? formatDate(row.insurance_expiry) : '—'}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge variant={vehicleStatusVariant(row.status)} className="capitalize">{(row.status ?? '—').replace('_', ' ')}</Badge>,
    },
    {
      key: 'guid',
      label: 'Actions',
      render: (row) => (
        <Button size="sm" variant="outline" onClick={(e) => openEdit(row, e)}>Edit</Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vehicles"
        subtitle={`${vehicles.length} vehicles in fleet`}
        action="Add Vehicle"
        onAction={openCreate}
        actionIcon={<Plus className="h-4 w-4" />}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-9"
            placeholder="Search vehicles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {vehicleStatuses.map(s => (
              <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {vehicleTypes.map(t => (
              <SelectItem key={t} value={t} className="capitalize">{t.replace('_', ' ')}</SelectItem>
            ))}
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
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        ) : (
          <Skeleton className="h-64 w-full rounded-xl" />
        )
      ) : view === 'grid' ? (
        filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <p className="text-lg font-medium">No vehicles found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((vehicle, i) => (
              <VehicleCard key={vehicle.guid} vehicle={vehicle} index={i} />
            ))}
          </div>
        )
      ) : (
        <DataTable<Vehicle>
          columns={columns}
          data={filtered}
          isLoading={isLoading}
          emptyMessage="No vehicles found."
        />
      )}

      {/* Add/Edit Vehicle Modal */}
      <FormModal
        open={modalOpen}
        title={editVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        submitLabel={editVehicle ? 'Update' : 'Create'}
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Plate Number</Label>
              <Input value={form.plate_number} onChange={(e) => setForm(f => ({ ...f, plate_number: e.target.value }))} placeholder="ABC-1234" />
            </div>
            <div className="space-y-1.5">
              <Label>Vehicle Type</Label>
              <Select value={form.vehicle_type} onValueChange={(v) => setForm(f => ({ ...f, vehicle_type: v }))}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map(t => (
                    <SelectItem key={t} value={t} className="capitalize">{t.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Make</Label>
              <Input value={form.make} onChange={(e) => setForm(f => ({ ...f, make: e.target.value }))} placeholder="Freightliner" />
            </div>
            <div className="space-y-1.5">
              <Label>Model</Label>
              <Input value={form.model} onChange={(e) => setForm(f => ({ ...f, model: e.target.value }))} placeholder="Cascadia" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Year</Label>
              <Input type="number" value={form.year} onChange={(e) => setForm(f => ({ ...f, year: e.target.value }))} placeholder="2022" />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {vehicleStatuses.map(s => (
                    <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Max Payload (kg)</Label>
              <Input type="number" value={form.max_payload_kg} onChange={(e) => setForm(f => ({ ...f, max_payload_kg: e.target.value }))} placeholder="20000" />
            </div>
            <div className="space-y-1.5">
              <Label>Max Volume (m³)</Label>
              <Input type="number" value={form.max_volume_m3} onChange={(e) => setForm(f => ({ ...f, max_volume_m3: e.target.value }))} placeholder="80" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Insurance Expiry</Label>
              <Input type="date" value={form.insurance_expiry} onChange={(e) => setForm(f => ({ ...f, insurance_expiry: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Inspection Expiry</Label>
              <Input type="date" value={form.inspection_expiry} onChange={(e) => setForm(f => ({ ...f, inspection_expiry: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Assigned Driver (User)</Label>
            <Select value={form.users_id} onValueChange={(v) => setForm(f => ({ ...f, users_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
              <SelectContent>
                {users.map(u => (
                  <SelectItem key={u.guid} value={u.guid || 'fallback'}>
                    {u.full_name ?? u.login ?? u.email ?? u.guid}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Photo URL</Label>
            <Input value={form.photo} onChange={(e) => setForm(f => ({ ...f, photo: e.target.value }))} placeholder="https://..." />
          </div>
        </div>
      </FormModal>
    </div>
  )
}
