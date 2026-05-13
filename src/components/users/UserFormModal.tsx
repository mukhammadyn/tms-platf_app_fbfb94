import React, { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { FormModal } from '@/components/shared/FormModal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useApiQuery } from '@/hooks/useApi'
import { extractList } from '@/lib/apiUtils'
import { useCreateUser, useUpdateUser } from '@/hooks/useUsers'
import type { User } from '@/types'

interface UserFormModalProps {
  open: boolean
  onClose: () => void
  editUser?: User | null
}

export function UserFormModal({ open, onClose, editUser }: UserFormModalProps) {
  const isEdit = !!editUser

  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [roleId, setRoleId] = useState('')
  const [clientTypeId, setClientTypeId] = useState('')
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [isFreelancer, setIsFreelancer] = useState(false)
  const [status, setStatus] = useState('active')
  const [address, setAddress] = useState('')
  const [tin, setTin] = useState('')
  const [telegramChatId, setTelegramChatId] = useState('')

  const { data: rolesData } = useApiQuery<unknown>(['roles'], '/v2/items/role')
  const roles = extractList<{ guid: string; name: string }>(rolesData)

  const { data: ctData } = useApiQuery<unknown>(['client-types'], '/v2/items/client_type')
  const clientTypes = extractList<{ guid: string; name: string }>(ctData)

  const createUser = useCreateUser()
  const updateUser = useUpdateUser()

  const isSubmitting = createUser.isPending || updateUser.isPending

  useEffect(() => {
    if (editUser) {
      setLogin(editUser.login ?? '')
      setEmail(editUser.email ?? '')
      setPhone(editUser.phone ?? '')
      setRoleId(editUser.role_id ?? '')
      setClientTypeId(editUser.client_type_id ?? '')
      setFullName(editUser.full_name ?? '')
      setCompanyName(editUser.company_name ?? '')
      setIsFreelancer(editUser.is_freelancer ?? false)
      setStatus(editUser.status ?? 'active')
      setAddress(editUser.address ?? '')
      setTin(editUser.tin ?? '')
      setTelegramChatId(editUser.telegram_chat_id ?? '')
      setPassword('')
    } else {
      setLogin('')
      setPassword('')
      setEmail('')
      setPhone('')
      setRoleId('')
      setClientTypeId('')
      setFullName('')
      setCompanyName('')
      setIsFreelancer(false)
      setStatus('active')
      setAddress('')
      setTin('')
      setTelegramChatId('')
    }
  }, [editUser, open])

  const handleSubmit = () => {
    if (!login || !email || !roleId || !clientTypeId) return
    if (!isEdit && !password) return

    if (isEdit && editUser) {
      const payload: Partial<User> & { guid: string } = {
        guid: editUser.guid,
        login,
        email,
        phone: phone || undefined,
        role_id: roleId,
        client_type_id: clientTypeId,
        full_name: fullName || undefined,
        company_name: companyName || undefined,
        is_freelancer: isFreelancer,
        status: status as User['status'],
        address: address || undefined,
        tin: tin || undefined,
        telegram_chat_id: telegramChatId || undefined,
        ...(password ? { password } : {}),
      }
      updateUser.mutate(payload, { onSuccess: onClose })
    } else {
      const payload = {
        login,
        password,
        email,
        phone: phone || undefined,
        role_id: roleId,
        client_type_id: clientTypeId,
        full_name: fullName || undefined,
        company_name: companyName || undefined,
        is_freelancer: isFreelancer,
        status: status as User['status'],
        address: address || undefined,
        tin: tin || undefined,
        telegram_chat_id: telegramChatId || undefined,
      }
      createUser.mutate(payload as Parameters<typeof createUser.mutate>[0], { onSuccess: onClose })
    }
  }

  return (
    <FormModal
      open={open}
      title={isEdit ? 'Edit User' : 'Create User'}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? 'Save Changes' : 'Create User'}
    >
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        {/* Login */}
        <div className="space-y-1.5">
          <Label htmlFor="login">Login <span className="text-destructive">*</span></Label>
          <Input
            id="login"
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="username"
            required
          />
        </div>

        {/* Password — required on create, optional on edit */}
        {!isEdit && (
          <div className="space-y-1.5">
            <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
        )}
        {isEdit && (
          <div className="space-y-1.5">
            <Label htmlFor="password">New Password <span className="text-muted-foreground text-xs">(leave blank to keep current)</span></Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password (optional)"
            />
          </div>
        )}

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            required
          />
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 555 000 0000"
          />
        </div>

        {/* Role */}
        <div className="space-y-1.5">
          <Label>Role <span className="text-destructive">*</span></Label>
          <Select value={roleId} onValueChange={setRoleId}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r.guid} value={r.guid || 'fallback-role'}>
                  {r.name ?? '—'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Client Type */}
        <div className="space-y-1.5">
          <Label>Client Type <span className="text-destructive">*</span></Label>
          <Select value={clientTypeId} onValueChange={setClientTypeId}>
            <SelectTrigger>
              <SelectValue placeholder="Select client type" />
            </SelectTrigger>
            <SelectContent>
              {clientTypes.map((ct) => (
                <SelectItem key={ct.guid} value={ct.guid || 'fallback-ct'}>
                  {ct.name ?? '—'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Full Name */}
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
          />
        </div>

        {/* Company */}
        <div className="space-y-1.5">
          <Label htmlFor="company_name">Company Name</Label>
          <Input
            id="company_name"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="ACME Corp"
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Address */}
        <div className="space-y-1.5">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main St"
          />
        </div>

        {/* TIN */}
        <div className="space-y-1.5">
          <Label htmlFor="tin">TIN</Label>
          <Input
            id="tin"
            type="text"
            value={tin}
            onChange={(e) => setTin(e.target.value)}
            placeholder="Tax ID"
          />
        </div>

        {/* Telegram */}
        <div className="space-y-1.5">
          <Label htmlFor="telegram">Telegram Chat ID</Label>
          <Input
            id="telegram"
            type="text"
            value={telegramChatId}
            onChange={(e) => setTelegramChatId(e.target.value)}
            placeholder="@username or chat ID"
          />
        </div>

        {/* Is Freelancer */}
        <div className="flex items-center justify-between">
          <Label htmlFor="is_freelancer">Is Freelancer</Label>
          <Switch
            id="is_freelancer"
            checked={isFreelancer}
            onCheckedChange={setIsFreelancer}
          />
        </div>
      </div>
    </FormModal>
  )
}
