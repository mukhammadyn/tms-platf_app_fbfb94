import { useApiQuery, useApiMutation } from '@/hooks/useApi'
import type { DriverProfile, Vehicle } from '@/types'

export function useDrivers() {
  return useApiQuery<unknown>(['driver_profiles'], '/v2/items/driver_profiles')
}

export function useDriver(id: string) {
  return useApiQuery<unknown>(['driver_profiles', id], '/v2/items/driver_profiles/' + id, undefined, { enabled: !!id })
}

export function useCreateDriver() {
  return useApiMutation<DriverProfile, Partial<DriverProfile>>({
    url: '/v2/items/driver_profiles',
    method: 'POST',
    successMessage: 'Driver profile created',
    invalidateKeys: [['driver_profiles']],
  })
}

export function useUpdateDriver() {
  return useApiMutation<DriverProfile, Partial<DriverProfile>>({
    url: '/v2/items/driver_profiles',
    method: 'PUT',
    successMessage: 'Driver profile updated',
    invalidateKeys: [['driver_profiles']],
  })
}

export function useVehicles() {
  return useApiQuery<unknown>(['vehicles'], '/v2/items/vehicles')
}

export function useVehicle(id: string) {
  return useApiQuery<unknown>(['vehicles', id], '/v2/items/vehicles/' + id, undefined, { enabled: !!id })
}

export function useCreateVehicle() {
  return useApiMutation<Vehicle, Partial<Vehicle>>({
    url: '/v2/items/vehicles',
    method: 'POST',
    successMessage: 'Vehicle created',
    invalidateKeys: [['vehicles']],
  })
}

export function useUpdateVehicle() {
  return useApiMutation<Vehicle, Partial<Vehicle>>({
    url: '/v2/items/vehicles',
    method: 'PUT',
    successMessage: 'Vehicle updated',
    invalidateKeys: [['vehicles']],
  })
}
