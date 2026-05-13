import React, { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { AdminDashboard } from '@/components/dashboard/AdminDashboard'
import { ShipperDashboard } from '@/components/dashboard/ShipperDashboard'
import { CarrierDashboard } from '@/components/dashboard/CarrierDashboard'
import { DriverDashboard } from '@/components/dashboard/DriverDashboard'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { LayoutDashboard } from 'lucide-react'

type RoleView = 'admin' | 'shipper' | 'carrier' | 'driver'

const roleOptions: { value: RoleView; label: string }[] = [
  { value: 'admin', label: 'Admin View' },
  { value: 'shipper', label: 'Shipper View' },
  { value: 'carrier', label: 'Carrier View' },
  { value: 'driver', label: 'Driver View' },
]

export function DashboardPage() {
  const [role, setRole] = useState<RoleView>('admin')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <PageHeader
          title="Dashboard"
          subtitle="Role-adaptive overview of your TMS platform"
        />
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:block">Viewing as:</span>
          <Select value={role} onValueChange={(v) => setRole(v as RoleView)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Role-specific dashboard */}
      {role === 'admin' && <AdminDashboard />}
      {role === 'shipper' && <ShipperDashboard />}
      {role === 'carrier' && <CarrierDashboard />}
      {role === 'driver' && <DriverDashboard />}
    </div>
  )
}
