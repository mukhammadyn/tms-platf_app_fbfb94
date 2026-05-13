import React from 'react'
import { Link } from 'react-router-dom'
import { Star, Shield, Clock, Award } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn, getInitials } from '@/lib/utils'
import type { DriverProfile, User } from '@/types'

const thumbPool = [
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/e366fe8e-ab6b-4255-9660-88f1f8b50f56_img_00.jpg',
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/55f659c3-b3a2-4556-b5db-fc5b94f7e77e_img_01.jpg',
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/07e77e71-697c-431b-84b0-d1e0b2a24725_img_02.jpg',
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/535adcd3-0569-420d-9ebd-3b1caa087e2b_img_03.jpg',
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/392a171f-7c47-4ce9-b933-c38a078bd1e6_img_04.jpg',
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/ffcb0e6c-9406-41c5-ad25-4b5fea578077_img_05.jpg',
]

interface DriverCardProps {
  driver: DriverProfile
  user?: User
  index?: number
}

function statusConfig(status: string | undefined): { label: string; color: string; dot: string } {
  switch (status) {
    case 'available':
      return { label: 'Available', color: 'success', dot: 'bg-emerald-500' }
    case 'on_trip':
      return { label: 'On Trip', color: 'warning', dot: 'bg-amber-500' }
    case 'off_duty':
      return { label: 'Off Duty', color: 'secondary', dot: 'bg-gray-400' }
    case 'inactive':
      return { label: 'Inactive', color: 'destructive', dot: 'bg-red-500' }
    default:
      return { label: status ?? '—', color: 'outline', dot: 'bg-gray-400' }
  }
}

export function DriverCard({ driver, user, index = 0 }: DriverCardProps) {
  const status = statusConfig(driver.status)
  const photoSrc = driver.photo ?? thumbPool[index % thumbPool.length]
  const displayName = user?.full_name ?? user?.login ?? '—'
  const rating = user?.rating ?? 0

  return (
    <Link to={`/drivers/${driver.guid}`} className="block">
      <Card className="hover:shadow-md transition-shadow duration-200 overflow-hidden h-full">
        {/* Photo */}
        <div className="relative h-40 bg-muted overflow-hidden">
          <img
            src={photoSrc}
            alt={displayName}
            loading="lazy"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.style.display = 'none'
              if (e.currentTarget.parentElement) {
                e.currentTarget.parentElement.style.background = 'linear-gradient(135deg,hsl(var(--muted)),hsl(var(--accent)/0.2))'
              }
            }}
          />
          {/* Status indicator */}
          <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1">
            <span className={cn('h-2 w-2 rounded-full flex-shrink-0', status.dot)} />
            <span className="text-xs font-medium">{status.label}</span>
          </div>
          {/* HazMat badge */}
          {driver.hazmat_certified && (
            <div className="absolute top-2 left-2">
              <Badge variant="warning" className="text-xs flex items-center gap-1">
                <Shield className="h-3 w-3" />
                HazMat
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={user?.avatar ?? ''} />
              <AvatarFallback className="text-xs">{getInitials(displayName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{displayName}</p>
              <div className="flex items-center gap-1 mt-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn('h-3 w-3', star <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground')}
                  />
                ))}
                <span className="text-xs text-muted-foreground ml-0.5">{rating > 0 ? rating.toFixed(1) : '—'}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Award className="h-3.5 w-3.5 flex-shrink-0" />
              <span>Class {driver.license_class ?? '—'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{driver.experience_years ?? '—'} yrs exp</span>
            </div>
          </div>

          <div className="mt-2">
            <p className="text-xs text-muted-foreground">
              License: <span className="text-foreground font-medium">{driver.license_number ?? '—'}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
