import React, { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { MessageList } from '@/components/messaging/MessageList'
import { MessageView } from '@/components/messaging/MessageView'
import { ComposeMessageModal } from '@/components/messaging/ComposeMessageModal'
import {
  useMessages,
  useMessage,
  useMarkMessageRead,
} from '@/hooks/useMessagingNotifications'
import { extractList, extractSingle } from '@/lib/apiUtils'
import type { Message } from '@/types'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export function MessagingPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [composeOpen, setComposeOpen] = useState(false)
  const [filterType, setFilterType] = useState('all')
  const [filterRead, setFilterRead] = useState('all')

  const { data: messagesData, isLoading } = useMessages()
  const messages = extractList<Message>(messagesData)

  const { data: selectedData, isLoading: isLoadingSelected } = useMessage(selectedId ?? '')
  const selectedMessage = extractSingle<Message>(selectedData)

  const markRead = useMarkMessageRead()

  const handleSelectMessage = (msg: Message) => {
    setSelectedId(msg.guid)
    if (!msg.is_read) {
      markRead.mutate({ guid: msg.guid, is_read: true })
    }
  }

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-8rem)]">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <PageHeader
          title="Messages"
          subtitle="Communication center for orders, bids, and system alerts"
        />
        <Button onClick={() => setComposeOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Compose
        </Button>
      </div>

      {/* Two-panel email client layout */}
      <div className="flex flex-1 min-h-0 rounded-xl border border-border bg-card overflow-hidden">
        {/* Left: Message List */}
        <div className="w-80 flex-shrink-0 border-r border-border flex flex-col min-h-0">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h2 className="text-sm font-semibold text-foreground">Inbox</h2>
            <p className="text-xs text-muted-foreground">
              {messages.filter((m) => !m.is_read).length} unread
            </p>
          </div>
          <div className="flex-1 overflow-hidden">
            <MessageList
              messages={messages}
              selectedId={selectedId}
              onSelect={handleSelectMessage}
              isLoading={isLoading}
              filterType={filterType}
              filterRead={filterRead}
              onFilterTypeChange={setFilterType}
              onFilterReadChange={setFilterRead}
            />
          </div>
        </div>

        {/* Right: Message View */}
        <div className="flex-1 min-w-0 flex flex-col">
          <MessageView
            message={selectedMessage}
            isLoading={isLoadingSelected && !!selectedId}
            onReply={() => setComposeOpen(true)}
          />
        </div>
      </div>

      {/* Compose Modal */}
      <ComposeMessageModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
      />
    </div>
  )
}
