import React, { useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

interface NotificationSetting {
  id: string
  label: string
  description: string
  email: boolean
  push: boolean
  telegram: boolean
}

const DEFAULT_SETTINGS: NotificationSetting[] = [
  {
    id: 'bid_placed',
    label: 'Bid Placed',
    description: 'When a new bid is placed on your order',
    email: true,
    push: true,
    telegram: false,
  },
  {
    id: 'bid_accepted',
    label: 'Bid Accepted',
    description: 'When your bid is accepted by a shipper',
    email: true,
    push: true,
    telegram: true,
  },
  {
    id: 'bid_rejected',
    label: 'Bid Rejected',
    description: 'When your bid is rejected',
    email: false,
    push: true,
    telegram: false,
  },
  {
    id: 'order_assigned',
    label: 'Order Assigned',
    description: 'When an order is assigned to you',
    email: true,
    push: true,
    telegram: true,
  },
  {
    id: 'order_status_change',
    label: 'Order Status Change',
    description: 'When the status of your order changes',
    email: true,
    push: false,
    telegram: false,
  },
  {
    id: 'delivery_completed',
    label: 'Delivery Completed',
    description: 'When a delivery is marked complete',
    email: true,
    push: true,
    telegram: true,
  },
  {
    id: 'payment_received',
    label: 'Payment Received',
    description: 'When a payment is processed',
    email: true,
    push: true,
    telegram: false,
  },
  {
    id: 'invoice_due',
    label: 'Invoice Due',
    description: 'Reminders for upcoming invoice due dates',
    email: true,
    push: false,
    telegram: false,
  },
  {
    id: 'system_alerts',
    label: 'System Alerts',
    description: 'Critical platform alerts and maintenance notices',
    email: true,
    push: true,
    telegram: true,
  },
  {
    id: 'new_message',
    label: 'New Message',
    description: 'When you receive a new direct message',
    email: false,
    push: true,
    telegram: true,
  },
  {
    id: 'review_received',
    label: 'Review Received',
    description: 'When someone leaves you a review',
    email: true,
    push: false,
    telegram: false,
  },
  {
    id: 'document_expiry',
    label: 'Document Expiry Warning',
    description: 'Alerts when your documents are about to expire',
    email: true,
    push: true,
    telegram: true,
  },
]

type Channel = 'email' | 'push' | 'telegram'

export function NotificationsTab() {
  const [settings, setSettings] = useState<NotificationSetting[]>(DEFAULT_SETTINGS)
  const [isSaving, setIsSaving] = useState(false)

  function toggle(id: string, channel: Channel) {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [channel]: !s[channel] } : s))
    )
  }

  function handleSave() {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success('Notification preferences saved')
    }, 800)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notification Preferences</CardTitle>
          <CardDescription>
            Choose how you receive notifications for different events across the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Channel headers */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-6 pb-3 border-b border-border">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Event</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide w-14 text-center">Email</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide w-14 text-center">Push</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide w-20 text-center">Telegram</span>
          </div>

          <div className="divide-y divide-border">
            {settings.map((setting) => (
              <div
                key={setting.id}
                className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-6 py-3"
              >
                <div>
                  <Label className="text-sm font-medium">{setting.label}</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">{setting.description}</p>
                </div>
                <div className="w-14 flex justify-center">
                  <Switch
                    checked={setting.email}
                    onCheckedChange={() => toggle(setting.id, 'email')}
                    aria-label={`${setting.label} email notification`}
                  />
                </div>
                <div className="w-14 flex justify-center">
                  <Switch
                    checked={setting.push}
                    onCheckedChange={() => toggle(setting.id, 'push')}
                    aria-label={`${setting.label} push notification`}
                  />
                </div>
                <div className="w-20 flex justify-center">
                  <Switch
                    checked={setting.telegram}
                    onCheckedChange={() => toggle(setting.id, 'telegram')}
                    aria-label={`${setting.label} telegram notification`}
                  />
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
