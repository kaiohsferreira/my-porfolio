import { useEffect, useState } from 'react'
import type { Message } from '@/types'
import { sectionEyebrowStyle } from '../styles'
import { Icon } from '../ui/Icon'
import { ButtonOutline, PanelCard, SectionTitle, TagPill } from '../ui/controls'

export function MessagesSection({
  messages,
  onOpenMessage,
  onDeleteMessage,
}: {
  messages: Message[]
  onOpenMessage: (id: number) => Promise<Message | null>
  onDeleteMessage: (id: number) => Promise<void>
}) {
  const [selectedId, setSelectedId] = useState<number | null>(messages[0]?.id ?? null)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(messages[0] ?? null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (selectedId && messages.some((message) => message.id === selectedId)) {
      setSelectedMessage((current) => current && current.id === selectedId ? current : messages.find((message) => message.id === selectedId) ?? null)
      return
    }

    setSelectedId(messages[0]?.id ?? null)
    setSelectedMessage(messages[0] ?? null)
  }, [messages, selectedId])

  async function openMessage(id: number) {
    setSelectedId(id)

    try {
      setBusyId(id)
      setError('')
      const prepared = await onOpenMessage(id)
      if (prepared) setSelectedMessage(prepared)
    } catch (openError) {
      setError(openError instanceof Error ? openError.message : 'Nao foi possivel abrir a mensagem.')
    } finally {
      setBusyId(null)
    }
  }

  async function removeMessage(id: number) {
    try {
      setBusyId(id)
      setError('')
      await onDeleteMessage(id)
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Nao foi possivel remover a mensagem.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <SectionTitle num="04 /" title="Mensagens" />

      {error ? <div style={{ color: 'oklch(65% 0.22 25)', fontSize: 13, marginBottom: 16 }}>{error}</div> : null}
      <div className="admin-grid-2">
        <PanelCard>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((message) => (
              <button
                key={message.id}
                type="button"
                onClick={() => openMessage(message.id)}
                style={{
                  border: `1px solid ${selectedId === message.id ? 'oklch(72% 0.25 160 / 0.28)' : 'var(--border)'}`,
                  background: selectedId === message.id ? 'var(--green-glow)' : 'transparent',
                  color: 'var(--text)',
                  padding: 16,
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <strong>{message.name}</strong>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    {message.read ? <TagPill label="Lida" color="cyan" /> : <TagPill label="Nova" color="green" />}
                    {busyId === message.id ? <span style={sectionEyebrowStyle}>...</span> : null}
                  </span>
                </div>
                <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{message.email}</div>
                <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {message.msg.length > 100 ? `${message.msg.slice(0, 100)}...` : message.msg}
                </div>
              </button>
            ))}
          </div>
        </PanelCard>

        <PanelCard accent="linear-gradient(to right, var(--cyan), transparent)">
          {selectedMessage ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={sectionEyebrowStyle}>Mensagem selecionada</div>
                  <h3 style={{ fontSize: 22, marginTop: 8 }}>{selectedMessage.name}</h3>
                </div>
                <TagPill label={selectedMessage.read ? 'Lida' : 'Nova'} color={selectedMessage.read ? 'cyan' : 'green'} />
              </div>
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
                  <Icon name="mail" size={14} color="currentColor" />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{selectedMessage.email}</span>
                </div>
                <div style={{ ...sectionEyebrowStyle }}>{selectedMessage.date}</div>
                <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.8 }}>{selectedMessage.msg}</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <ButtonOutline onClick={() => void removeMessage(selectedMessage.id)}>{busyId === selectedMessage.id ? 'removendo...' : 'remover mensagem'}</ButtonOutline>
                </div>
              </div>
            </>
          ) : (
            <div style={{ color: 'var(--text-muted)' }}>Selecione uma mensagem para visualizar.</div>
          )}
        </PanelCard>
      </div>
    </div>
  )
}
