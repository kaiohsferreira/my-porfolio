import type { VisitorStatsAdmin } from '@/lib/portfolio-api'
import { sectionEyebrowStyle } from '../styles'
import { PanelCard, SectionTitle, TagPill } from '../ui/controls'
import { MetricCard } from '../ui/feedback'

export function VisitorsSection({ visitorStats }: { visitorStats: VisitorStatsAdmin | null }) {
  const chartData = visitorStats?.monthlyChart || []
  const maxChart = Math.max(...chartData.map((item) => item.count), 1)

  return (
    <div>
      <SectionTitle num="05 /" title="Visitantes" />

      <div className="admin-grid-4">
        <MetricCard label="Visitantes no mes" value={visitorStats?.totalThisMonth ?? 0} sub={`${visitorStats?.totalLastMonth ?? 0} no mes anterior`} icon="visitors" />
        <MetricCard label="Crescimento" value={`${visitorStats?.growthPercent ?? 0}%`} sub="variacao mensal" icon="trending" color="oklch(78% 0.18 90)" />
        <MetricCard label="Top origem" value={visitorStats?.topCountry || 'Sem dados'} sub="maior volume atual" icon="globe" color="var(--cyan)" />
        <MetricCard label="Sessoes unicas" value={visitorStats?.uniqueSessionsThisMonth ?? 0} sub="usuarios distintos no mes" icon="dashboard" color="var(--cyan)" />
      </div>

      <div className="admin-grid-2" style={{ marginTop: 24 }}>
        <PanelCard>
          <div style={sectionEyebrowStyle}>Top paginas</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 18 }}>
            {visitorStats?.topPages.length ? visitorStats.topPages.map((item) => (
              <div key={item.page} style={{ border: '1px solid var(--border)', padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>{item.page}</span>
                  <TagPill label={`${item.count} views`} color="green" />
                </div>
              </div>
            )) : <div style={{ color: 'var(--text-muted)' }}>Nenhuma pagina rastreada ainda.</div>}
          </div>
        </PanelCard>

        <PanelCard accent="linear-gradient(to right, var(--green), transparent)">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span className="admin-status-online" />
            <span style={sectionEyebrowStyle}>Volume mensal</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'end', gap: 8, height: 220 }}>
            {chartData.length ? chartData.map((item, index) => (
              <div key={item.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'end', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: '100%',
                    height: `${(item.count / maxChart) * 170}px`,
                    background:
                      index === chartData.length - 1
                        ? 'linear-gradient(180deg, var(--green), var(--cyan))'
                        : 'linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))',
                    border: '1px solid var(--border)',
                  }}
                />
                <span style={{ ...sectionEyebrowStyle, color: index === chartData.length - 1 ? 'var(--green)' : 'var(--text-dim)' }}>
                  {item.month.slice(5)}
                </span>
              </div>
            )) : <div style={{ color: 'var(--text-muted)' }}>Nenhum dado historico disponivel ainda.</div>}
          </div>
        </PanelCard>
      </div>
    </div>
  )
}
