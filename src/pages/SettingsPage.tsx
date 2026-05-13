import React from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ProfileTab } from '@/components/settings/ProfileTab'
import { NotificationsTab } from '@/components/settings/NotificationsTab'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useSystemSettings, useIntegrationSettings } from '@/hooks/useReviewsSettings'
import { extractList } from '@/lib/apiUtils'
import type { User } from '@/types'
import {
  Link2,
  Globe,
  Key,
  Settings2,
  Shield,
  DollarSign,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'

function IntegrationsTab() {
  const { data: intData } = useIntegrationSettings()
  const users = extractList<User>(intData)
  const sampleUser = users[0]

  const [telegramId, setTelegramId] = useState(sampleUser?.telegram_chat_id ?? '')
  const [apiKey] = useState('sk_live_••••••••••••••••')
  const [isSaving, setIsSaving] = useState(false)

  function handleSaveTelegram() {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success('Telegram integration saved')
    }, 800)
  }

  return (
    <div className="space-y-6">
      {/* Telegram */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Telegram Bot Integration
          </CardTitle>
          <CardDescription>
            Connect your Telegram account to receive notifications via bot.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="telegramId">Telegram Chat ID</Label>
            <div className="flex gap-2">
              <Input
                id="telegramId"
                value={telegramId}
                onChange={(e) => setTelegramId(e.target.value)}
                placeholder="e.g. 123456789"
              />
              <Button onClick={handleSaveTelegram} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Link
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Start a chat with <strong>@FreightOSBot</strong> and send <code>/start</code> to get your Chat ID.
          </p>
        </CardContent>
      </Card>

      {/* Payment Gateway */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Payment Gateway
          </CardTitle>
          <CardDescription>
            Configure your payment gateway integration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border border-border rounded-md">
            <div>
              <p className="text-sm font-medium">Stripe</p>
              <p className="text-xs text-muted-foreground">Accept credit/debit card payments</p>
            </div>
            <Badge variant="success">Connected</Badge>
          </div>
          <div className="flex items-center justify-between p-3 border border-border rounded-md">
            <div>
              <p className="text-sm font-medium">PayPal</p>
              <p className="text-xs text-muted-foreground">Accept PayPal payments</p>
            </div>
            <Badge variant="secondary">Not Connected</Badge>
          </div>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </CardTitle>
          <CardDescription>
            Use these keys to integrate with the FreightOS API.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>Live API Key</Label>
            <div className="flex gap-2">
              <Input value={apiKey} readOnly className="font-mono text-xs" />
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard?.writeText(apiKey)
                  toast.success('Copied to clipboard')
                }}
              >
                Copy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SystemTab() {
  const { data: sysData } = useSystemSettings()
  const users = extractList<User>(sysData)

  const [commission, setCommission] = useState('10')
  const [paymentTerms, setPaymentTerms] = useState('30')
  const [requireVerification, setRequireVerification] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  function handleSave() {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success('System settings saved')
    }, 800)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Platform Settings
          </CardTitle>
          <CardDescription>
            Configure global platform parameters. Admin only.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="commission">Platform Commission (%)</Label>
              <Input
                id="commission"
                type="number"
                min="0"
                max="100"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                placeholder="e.g. 10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="paymentTerms">Default Payment Terms (days)</Label>
              <Input
                id="paymentTerms"
                type="number"
                min="0"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                placeholder="e.g. 30"
              />
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Require Carrier Verification</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                New carriers must be verified before accepting loads
              </p>
            </div>
            <Switch
              checked={requireVerification}
              onCheckedChange={setRequireVerification}
            />
          </div>

          <Separator />

          <div className="p-3 bg-muted/50 rounded-md">
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Shield className="h-3.5 w-3.5" />
              Current Stats
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Total Users</p>
                <p className="text-sm font-semibold text-foreground">{users.length || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active Platform</p>
                <Badge variant="success" className="text-xs">Online</Badge>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save System Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SecurityTab() {
  const [twoFactor, setTwoFactor] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState('60')

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Manage two-factor authentication and session settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Two-Factor Authentication</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch
              checked={twoFactor}
              onCheckedChange={(v) => {
                setTwoFactor(v)
                toast.success(v ? '2FA enabled' : '2FA disabled')
              }}
            />
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
            <Input
              id="sessionTimeout"
              type="number"
              min="5"
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              className="max-w-xs"
            />
            <p className="text-xs text-muted-foreground">
              You will be automatically logged out after this period of inactivity.
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-medium">Active Sessions</p>
            <div className="space-y-2">
              {[
                { device: 'Chrome on Windows', location: 'New York, US', current: true },
                { device: 'Safari on iPhone', location: 'Los Angeles, US', current: false },
              ].map((session, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 border border-border rounded-md"
                >
                  <div>
                    <p className="text-sm font-medium flex items-center gap-2">
                      {session.device}
                      {session.current && (
                        <Badge variant="success" className="text-xs">Current</Badge>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{session.location}</p>
                  </div>
                  {!session.current && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.success('Session revoked')}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your profile, security, notifications, and platform configuration"
      />

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>

        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsTab />
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationsTab />
        </TabsContent>

        <TabsContent value="system">
          <SystemTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
