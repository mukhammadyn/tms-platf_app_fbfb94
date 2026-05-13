import React from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ClassicOrdersTab } from '@/components/orders/ClassicOrdersTab'
import { TenderOrdersTab } from '@/components/orders/TenderOrdersTab'
import { PrivateOrdersTab } from '@/components/orders/PrivateOrdersTab'
import { Package, FileText, Lock } from 'lucide-react'

export function OrdersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        subtitle="Manage classic, tender, and private freight orders"
      />

      <Tabs defaultValue="classic" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="classic" className="flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5" />
            Classic Orders
          </TabsTrigger>
          <TabsTrigger value="tender" className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Tender Orders
          </TabsTrigger>
          <TabsTrigger value="private" className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" />
            Private Orders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="classic">
          <ClassicOrdersTab />
        </TabsContent>

        <TabsContent value="tender">
          <TenderOrdersTab />
        </TabsContent>

        <TabsContent value="private">
          <PrivateOrdersTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
