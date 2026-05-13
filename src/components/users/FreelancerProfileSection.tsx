import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, UserCog, ExternalLink, Star, Award } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useApiQuery } from '@/hooks/useApi'
import { extractList } from '@/lib/apiUtils'
import { formatDate } from '@/lib/utils'
import type { DriverProfile, CarrierProfile } from '@/types'

interface FreelancerProfileSectionProps {
  userId: string
}

export function FreelancerProfileSection({ userId }: FreelancerProfileSectionProps) {
  const navigate = useNavigate()

  const { data: driverData, isLoading: driverLoading } = useApiQuery<unknown>(
    ['driver_profiles', userId],
    '/v2/items/driver_profiles'
  )
  const allDriverProfiles = extractList<DriverProfile>(driverData)
  const driverProfile = allDriverProfiles.find(d => d.users_id === userId) ?? null

  const { data: carrierData, isLoading: carrierLoading } = useApiQuery<unknown>(
    ['carrier_profiles', userId],
    '/v2/items/carrier_profiles'
  )
  const allCarrierProfiles = extractList<CarrierProfile>(carrierData)
  const carrierProfile = allCarrierProfiles.find(c => c.users_id === userId) ?? null

  const isLoading = driverLoading || carrierLoading

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Driver Profile */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <UserCog className="h-4 w-4 text-primary" />
            Driver Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          {driverProfile ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">License Number</p>
                  <p className="font-medium">{driverProfile.license_number ?? '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">License Class</p>
                  <p className="font-medium">
                    {driverProfile.license_class
                      ? <Badge variant="info">{driverProfile.license_class}</Badge>
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">License Expiry</p>
                  <p className="font-medium">{driverProfile.license_expiry ? formatDate(driverProfile.license_expiry) : '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Experience</p>
                  <p className="font-medium">
                    {driverProfile.experience_years != null
                      ? `${driverProfile.experience_years} yrs`
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Status</p>
                  <p className="font-medium">
                    {driverProfile.status ? (
                      <Badge variant={driverProfile.status === 'available' ? 'success' : driverProfile.status === 'on_trip' ? 'warning' : 'secondary'}>
                        {driverProfile.status}
                      </Badge>
                    ) : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">HazMat</p>
                  <p className="font-medium">
                    {driverProfile.hazmat_certified
                      ? <Badge variant="warning"><Award className="h-3 w-3 mr-1" />Certified</Badge>
                      : <span className="text-muted-foreground">No</span>}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigate('/drivers/' + driverProfile.guid)}
              >
                <ExternalLink className="h-3 w-3 mr-2" />
                View Driver Profile
              </Button>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <UserCog className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No driver profile linked</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Carrier Profile */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Briefcase className="h-4 w-4 text-primary" />
            Carrier Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          {carrierProfile ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">MC Number</p>
                  <p className="font-medium">{carrierProfile.mc_number ?? '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">DOT Number</p>
                  <p className="font-medium">{carrierProfile.dot_number ?? '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Fleet Size</p>
                  <p className="font-medium">{carrierProfile.fleet_size ?? '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Insurance Expiry</p>
                  <p className="font-medium">{carrierProfile.insurance_expiry ? formatDate(carrierProfile.insurance_expiry) : '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Regions</p>
                  <p className="font-medium">{carrierProfile.operating_regions ?? '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Status</p>
                  <p className="font-medium">
                    {carrierProfile.status ? (
                      <Badge variant={carrierProfile.status === 'verified' ? 'success' : carrierProfile.status === 'pending_review' ? 'warning' : 'destructive'}>
                        {carrierProfile.status}
                      </Badge>
                    ) : '—'}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigate('/carriers/' + carrierProfile.guid)}
              >
                <ExternalLink className="h-3 w-3 mr-2" />
                View Carrier Profile
              </Button>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No carrier profile linked</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
