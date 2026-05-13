import React, { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { FormModal } from '@/components/shared/FormModal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useApiQuery } from '@/hooks/useApi'
import { extractList } from '@/lib/apiUtils'
import { useCreateDriver, useUpdateDriver } from '@/hooks/useDriversVehicles'
import type { DriverProfile, User } from '@/types'

interface DriverFormModalProps {
  open: boolean
  onClose: () => void
  driver?: DriverProfile | null
}

const licenseClasses = ['A', 'B', 'C', 'CDL-A', 'CDL-B', 'CDL-C']
const driverStatuses = ['available', 'on_trip', 'off_duty', 'inactive']

export function DriverFormModal({ open, onClose, driver }: DriverFormModalProps) {
  const isEdit = !!driver

  const [usersId, setUsersId] = useState<string>(driver?.users_id ?? '')
  const [licenseNumber, setLicenseNumber] = useState<string>(driver?.license_number ?? '')
  const [licenseClass, setLicenseClass] = useState<string>(driver?.license_class ?? '')
  const [licenseExpiry, setLicenseExpiry] = useState<string>(driver?.license_expiry ?? '')
  const [experienceYears, setExperienceYears] = useState<string>(String(driver?.experience_years ?? ''))
  const [status, setStatus] = useState<string>(driver?.status ?? 'available')
  const [medicalCertExpiry, setMedicalCertExpiry] = useState<string>(driver?.medical_cert_expiry ?? '')
  const [hazmatCertified, setHazmatCertified] = useState<string>(driver?.hazmat_certified ? 'true' : 'false')
  const [photo, setPhoto] = useState<string>(driver?.photo ?? '')

  useEffect(() => {
    if (driver) {
      setUsersId(driver.users_id ?? '')
      setLicenseNumber(driver.license_number ?? '')
      setLicenseClass(driver.license_class ?? '')
      setLicenseExpiry(driver.license_expiry ?? '')
      setExperienceYears(String(driver.experience_years ?? ''))
      setStatus(driver.status ?? 'available')
      setMedicalCertExpiry(driver.medical_cert_expiry ?? '')
      setHazmatCertified(driver.hazmat_certified ? 'true' : 'false')
      setPhoto(driver.photo ?? '')
    } else {
      setUsersId('')
      setLicenseNumber('')
      setLicenseClass('')
      setLicenseExpiry('')
      setExperienceYears('')
      setStatus('available')
      setMedicalCertExpiry('')
      setHazmatCertified('false')
      setPhoto('')
    }
  }, [driver, open])

  const { data: usersData } = useApiQuery<unknown>(['users'], '/v2/items/users')
  const users = extractList<User>(usersData)

  const createMutation = useCreateDriver()
  const updateMutation = useUpdateDriver()
  const isPending = createMutation.isPending || updateMutation.isPending

  function handleSubmit() {
    const payload: Partial<DriverProfile> = {
      license_number: licenseNumber || undefined,
      license_class: (licenseClass || undefined) as DriverProfile['license_class'],
      license_expiry: licenseExpiry || undefined,
      experience_years: experienceYears ? Number(experienceYears) : undefined,
      status: (status || undefined) as DriverProfile['status'],
      medical_cert_expiry: medicalCertExpiry || undefined,
      hazmat_certified: hazmatCertified === 'true',
      photo: photo || undefined,
      ...(usersId ? { users_id: usersId } : {}),
    }

    if (isEdit && driver) {
      updateMutation.mutate({ ...payload, guid: driver.guid }, { onSuccess: () => onClose() })
    } else {
      createMutation.mutate(payload, { onSuccess: () => onClose() })
    }
  }

  return (
    <FormModal
      open={open}
      title={isEdit ? 'Edit Driver Profile' : 'Add Driver Profile'}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
      submitLabel={isEdit ? 'Update' : 'Create'}
    >
      <div className="space-y-4">
        {/* User link */}
        <div className="space-y-1.5">
          <Label>Linked User</Label>
          <Select value={usersId} onValueChange={setUsersId}>
            <SelectTrigger>
              <SelectValue placeholder="Select user" />
            </SelectTrigger>
            <SelectContent>
              {users.map((u) => (
                <SelectItem key={u.guid} value={u.guid || 'fallback'}>
                  {u.full_name ?? u.login ?? u.email ?? u.guid}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* License number */}
        <div className="space-y-1.5">
          <Label>License Number</Label>
          <Input
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            placeholder="e.g. CDL-123456"
          />
        </div>

        {/* License class */}
        <div className="space-y-1.5">
          <Label>License Class</Label>
          <Select value={licenseClass} onValueChange={setLicenseClass}>
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {licenseClasses.map((lc) => (
                <SelectItem key={lc} value={lc}>{lc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* License expiry */}
          <div className="space-y-1.5">
            <Label>License Expiry</Label>
            <Input
              type="date"
              value={licenseExpiry}
              onChange={(e) => setLicenseExpiry(e.target.value)}
            />
          </div>

          {/* Medical cert expiry */}
          <div className="space-y-1.5">
            <Label>Medical Cert Expiry</Label>
            <Input
              type="date"
              value={medicalCertExpiry}
              onChange={(e) => setMedicalCertExpiry(e.target.value)}
            />
          </div>
        </div>

        {/* Experience years */}
        <div className="space-y-1.5">
          <Label>Experience (years)</Label>
          <Input
            type="number"
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
            placeholder="e.g. 5"
            min={0}
          />
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {driverStatuses.map((s) => (
                <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* HazMat certified */}
        <div className="space-y-1.5">
          <Label>HazMat Certified</Label>
          <Select value={hazmatCertified} onValueChange={setHazmatCertified}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Photo URL */}
        <div className="space-y-1.5">
          <Label>Photo URL</Label>
          <Input
            value={photo}
            onChange={(e) => setPhoto(e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>
    </FormModal>
  )
}
