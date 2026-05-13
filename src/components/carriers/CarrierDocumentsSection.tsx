import React from 'react'
import { FileText, Download, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import type { CarrierProfile } from '@/types'

interface CarrierDocumentsSectionProps {
  carrier: CarrierProfile
}

function getDaysUntil(dateStr?: string | null): number | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return null
  const now = new Date()
  return Math.floor((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function ExpiryBadge({ dateStr }: { dateStr?: string | null }) {
  const days = getDaysUntil(dateStr)
  if (days === null) return <Badge variant="outline">No date</Badge>
  if (days < 0) return <Badge variant="destructive">Expired</Badge>
  if (days <= 30) return <Badge variant="warning">Expires in {days}d</Badge>
  return <Badge variant="success">Valid</Badge>
}

export function CarrierDocumentsSection({ carrier }: CarrierDocumentsSectionProps) {
  const docs = [
    {
      label: 'Authority Documents',
      value: carrier.authority_docs,
      type: 'file',
    },
    {
      label: 'Insurance Policy',
      value: carrier.insurance_policy_number
        ? `Policy #${carrier.insurance_policy_number}`
        : null,
      type: 'info',
      expiry: carrier.insurance_expiry,
    },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Documents & Compliance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Insurance Info */}
        <div className="rounded-lg border border-border p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Insurance Coverage</span>
            <ExpiryBadge dateStr={carrier.insurance_expiry} />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <span className="text-muted-foreground">Provider</span>
            <span>{carrier.insurance_provider ?? '—'}</span>
            <span className="text-muted-foreground">Policy #</span>
            <span>{carrier.insurance_policy_number ?? '—'}</span>
            <span className="text-muted-foreground">Expiry</span>
            <span>{formatDate(carrier.insurance_expiry)}</span>
          </div>
        </div>

        {/* Authority Docs */}
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Authority Documents</span>
            </div>
            {carrier.authority_docs ? (
              <Badge variant="success" className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Uploaded
              </Badge>
            ) : (
              <Badge variant="warning" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Missing
              </Badge>
            )}
          </div>
          {carrier.authority_docs ? (
            <a
              href={carrier.authority_docs}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <Button variant="outline" size="sm" className="gap-1.5">
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
            </a>
          ) : (
            <p className="text-xs text-muted-foreground">
              No authority documents uploaded.
            </p>
          )}
        </div>

        {/* MC / DOT */}
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm font-medium mb-2">Regulatory Numbers</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <span className="text-muted-foreground">MC Number</span>
            <span className="font-mono">{carrier.mc_number ?? '—'}</span>
            <span className="text-muted-foreground">DOT Number</span>
            <span className="font-mono">{carrier.dot_number ?? '—'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
