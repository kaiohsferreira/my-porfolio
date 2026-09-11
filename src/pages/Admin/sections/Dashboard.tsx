import type { DashboardSummary, VisitorStatsAdmin } from '@/lib/portfolio-api'
import { mapMessageToItem, mapProjectToItem } from '../mappers'
import { sectionEyebrowStyle } from '../styles'
import type { AdminSection } from '../types'
import { Icon } from '../ui/Icon'
import { ButtonOutline, PanelCard, TagPill } from '../ui/controls'
import { MetricCard } from '../ui/feedback'

/** Saudação pela hora local de quem abre o painel. */
function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function Dashboard({
  dashboard,
  visitorStats,
  userName,
  onNav,
}: {
  dashboard: DashboardSummary | null
  visitorStats: VisitorStatsAdmin | null
  /** Primeiro nome de quem está logado, para a saudação do início. */
  userName?: string
  onNav: (section: AdminSection) => void
}) {
  const recentMessages = dashboard?.recentMessages.map(mapMessageToItem) || []
  const featuredProjects = dashboard?.featuredProjects.map(mapProjectToItem) || []
  const chartData = visitorStats?.monthlyChart.map((item) => item.count) || []
  const maxChart = Math.max(...chartData, 1)
  const topPages = visitorStats?.topPages.slice(0, 5) || []

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 34, letterSpacing: '-0.02em', lineHeight: 1.15, margin: 0 }}>
          {greeting()}{userName ? `, ${userName}` : ''}
        </h2>
        <p style={{ margin: '8px 0 0', fontSize: 15, color: 'var(--text-muted)' }}>
          Um resumo do que está acontecendo no seu portfólio.
        </p>
      </div>

      <div className="admin-grid-4">
        <MetricCard label="Projetos" value={dashboard?.publishedProjectsCount ?? 0} sub="publicados" icon="projects" />
        <MetricCard label="Skills" value={dashboard?.skillsCount ?? 0} sub="mapeadas no painel" icon="skills" color="var(--cyan)" />
        <MetricCard label="Mensagens" value={dashboard?.unreadMessagesCount ?? 0} sub="não lidas" icon="messages" color="var(--warning)" />
        <MetricCard
          label="Visitantes"
          value={dashboard?.visitorsThisMonth ?? 0}
          sub={`${dashboard?.visitorGrowthPercent ?? 0}% em relação ao mês anterior`}
          icon="visitors"
          color="var(--cyan)"
        />
      </div>

      <div className="admin-grid-2" style={{ marginTop: 24 }}>
        <PanelCard accent="linear-gradient(to right, var(--green), transparent)">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
            <div>
              <div style={sectionEyebrowStyle}>Visitantes por mês</div>
              <h3 style={{ fontSize: 20, marginTop: 8 }}>Tendência de acesso</h3>
            </div>
            <TagPill label={visitorStats?.topCountry || 'sem dados'} color="cyan" />
          </div>
          <div style={{ display: 'flex', alignItems: 'end', gap: 8, height: 220 }}>
            {chartData.length ? chartData.map((value, index) => (
              <div key={`${value}-${index}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'end', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: '100%',
                    height: `${(value / maxChart) * 170}px`,
                    background:
                      index === chartData.length - 1
                        ? 'linear-gradient(180deg, var(--green), var(--cyan))'
                        : 'var(--bg2)',
                    borderRadius: '8px 8px 4px 4px',
                  }}
                />
                <span style={{ ...sectionEyebrowStyle, color: index === chartData.length - 1 ? 'var(--green)' : 'var(--text-dim)' }}>
                  {visitorStats?.monthlyChart[index]?.month.slice(5) || index + 1}
                </span>
              </div>
            )) : <div style={{ color: 'var(--text-muted)' }}>Nenhum dado mensal disponível ainda.</div>}
          </div>
        </PanelCard>

        <PanelCard accent="linear-gradient(to right, var(--cyan), transparent)">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
            <div>
              <div style={sectionEyebrowStyle}>Mensagens recentes</div>
              <h3 style={{ fontSize: 20, marginTop: 8 }}>Ultimos contatos</h3>
            </div>
            <ButtonOutline small onClick={() => onNav('messages')}>ver todas</ButtonOutline>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentMessages.length ? recentMessages.map((message) => (
              <div key={message.id} style={{ border: '1px solid var(--border)', padding: 16, background: 'rgba(40, 34, 64, 0.028)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <strong style={{ fontSize: 15 }}>{message.name}</strong>
                  {message.read ? <TagPill label="Lida" color="cyan" /> : <TagPill label="Nova" color="green" />}
                </div>
                <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{message.email}</div>
                <p style={{ marginTop: 10, fontSize: 13, lineHeight: 1.7, color: 'var(--text-muted)' }}>{message.msg}</p>
              </div>
            )) : <div style={{ color: 'var(--text-muted)' }}>Nenhuma mensagem recente encontrada.</div>}
          </div>
        </PanelCard>
      </div>

      <div className="admin-grid-2" style={{ marginTop: 24 }}>
        <PanelCard>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="admin-status-online" />
              <span style={sectionEyebrowStyle}>Top paginas</span>
            </div>
            <ButtonOutline small onClick={() => onNav('visitors')}>detalhes</ButtonOutline>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topPages.length ? topPages.map((item) => (
              <div key={item.page} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon name="globe" size={14} color="var(--text-dim)" />
                  <div>
                    <div style={{ fontSize: 14 }}>{item.page}</div>
                    <div style={{ ...sectionEyebrowStyle, marginTop: 4 }}>pagina acompanhada</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green)' }}>
                  <Icon name="trending" size={14} color="currentColor" />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{item.count} acessos</span>
                </div>
              </div>
            )) : <div style={{ color: 'var(--text-muted)' }}>Nenhuma pagina rastreada ainda.</div>}
          </div>
        </PanelCard>

        <PanelCard>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
            <div>
              <div style={sectionEyebrowStyle}>Projetos em destaque</div>
              <h3 style={{ fontSize: 20, marginTop: 8 }}>Selecao principal</h3>
            </div>
            <ButtonOutline small onClick={() => onNav('projects')}>gerenciar</ButtonOutline>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {featuredProjects.length ? featuredProjects.map((project) => (
              <div key={project.id} style={{ border: '1px solid var(--border)', padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <strong>{project.title}</strong>
                  <Icon name="star" size={15} color="var(--green)" />
                </div>
                <p style={{ marginTop: 10, fontSize: 13, lineHeight: 1.7, color: 'var(--text-muted)' }}>{project.desc}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                  {project.tags.map((tag) => (
                    <TagPill key={`${project.id}-${tag}`} label={tag} color="cyan" />
                  ))}
                </div>
              </div>
            )) : <div style={{ color: 'var(--text-muted)' }}>Nenhum projeto em destaque ainda.</div>}
          </div>
        </PanelCard>
      </div>
    </div>
  )
}
