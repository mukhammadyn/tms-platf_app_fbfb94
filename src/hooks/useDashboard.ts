import { useApiQuery } from '@/hooks/useApi'
import { extractList, extractCount } from '@/lib/apiUtils'
import type { Order, Bid, Vehicle, Transaction, TrackingUpdate, User, DriverProfile, Notification } from '@/types'

export function useDashboard() {
  return useApiQuery<unknown>(['dashboard-orders'], '/v2/items/orders')
}

export function useAdminStats() {
  const orders = useApiQuery<unknown>(['admin-orders'], '/v2/items/orders')
  const users = useApiQuery<unknown>(['admin-users'], '/v2/items/users')
  const transactions = useApiQuery<unknown>(['admin-transactions'], '/v2/items/transactions')
  const tracking = useApiQuery<unknown>(['admin-tracking'], '/v2/items/tracking')
  const notifications = useApiQuery<unknown>(['admin-notifications'], '/v2/items/notifications')

  const orderList = extractList<Order>(orders.data)
  const userList = extractList<User>(users.data)
  const txList = extractList<Transaction>(transactions.data)
  const trackingList = extractList<TrackingUpdate>(tracking.data)
  const notifList = extractList<Notification>(notifications.data)

  const totalRevenue = txList
    .filter((t) => t.status === 'completed')
    .reduce((sum, t) => sum + (t.amount ?? 0), 0)

  const commission = totalRevenue * 0.05

  const activeOrders = orderList.filter(
    (o) => o.status === 'in_transit' || o.status === 'assigned'
  ).length

  const pendingVerifications = userList.filter((u) => u.status === 'pending').length

  return {
    isLoading: orders.isLoading || users.isLoading || transactions.isLoading,
    orders: orderList,
    users: userList,
    transactions: txList,
    tracking: trackingList,
    notifications: notifList,
    stats: {
      totalUsers: extractCount(users.data) || userList.length,
      activeOrders,
      totalRevenue,
      commission,
      pendingVerifications,
    },
  }
}

export function useShipperStats() {
  const orders = useApiQuery<unknown>(['shipper-orders'], '/v2/items/orders')
  const bids = useApiQuery<unknown>(['shipper-bids'], '/v2/items/bids')

  const orderList = extractList<Order>(orders.data)
  const bidList = extractList<Bid>(bids.data)

  const activeOrders = orderList.filter((o) => o.status === 'open' || o.status === 'assigned').length
  const inTransit = orderList.filter((o) => o.status === 'in_transit').length
  const pendingBids = bidList.filter((b) => b.status === 'pending').length
  const totalSpend = orderList
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + (o.price ?? 0), 0)

  return {
    isLoading: orders.isLoading || bids.isLoading,
    orders: orderList,
    bids: bidList,
    stats: {
      activeOrders,
      inTransit,
      pendingBids,
      totalSpend,
    },
  }
}

export function useCarrierStats() {
  const orders = useApiQuery<unknown>(['carrier-orders'], '/v2/items/orders')
  const vehicles = useApiQuery<unknown>(['carrier-vehicles'], '/v2/items/vehicles')
  const bids = useApiQuery<unknown>(['carrier-bids'], '/v2/items/bids')
  const drivers = useApiQuery<unknown>(['carrier-drivers'], '/v2/items/driver_profiles')

  const orderList = extractList<Order>(orders.data)
  const vehicleList = extractList<Vehicle>(vehicles.data)
  const bidList = extractList<Bid>(bids.data)
  const driverList = extractList<DriverProfile>(drivers.data)

  const activeLoads = orderList.filter((o) => o.status === 'in_transit').length
  const availableDrivers = driverList.filter((d) => d.status === 'available').length
  const totalVehicles = vehicleList.length
  const onTripVehicles = vehicleList.filter((v) => v.status === 'on_trip').length
  const fleetUtilization = totalVehicles > 0 ? Math.round((onTripVehicles / totalVehicles) * 100) : 0
  const revenue = orderList
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + (o.price ?? 0), 0)

  return {
    isLoading: orders.isLoading || vehicles.isLoading || bids.isLoading || drivers.isLoading,
    orders: orderList,
    vehicles: vehicleList,
    bids: bidList,
    drivers: driverList,
    stats: {
      activeLoads,
      availableDrivers,
      fleetUtilization,
      revenue,
    },
  }
}

export function useDriverStats() {
  const orders = useApiQuery<unknown>(['driver-orders'], '/v2/items/orders')
  const tracking = useApiQuery<unknown>(['driver-tracking'], '/v2/items/tracking')

  const orderList = extractList<Order>(orders.data)
  const trackingList = extractList<TrackingUpdate>(tracking.data)

  const currentAssignment = orderList.find((o) => o.status === 'in_transit') ?? null
  const nextPickup = orderList.find((o) => o.status === 'assigned') ?? null
  const completedTrips = orderList.filter((o) => o.status === 'completed').length

  return {
    isLoading: orders.isLoading || tracking.isLoading,
    orders: orderList,
    tracking: trackingList,
    currentAssignment,
    nextPickup,
    stats: {
      currentAssignment: currentAssignment?.order_number ?? 'None',
      nextPickup: nextPickup?.pickup_address ?? 'None',
      completedTrips,
    },
  }
}
