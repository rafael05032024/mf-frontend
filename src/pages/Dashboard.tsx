import { useMemo, useState } from 'react'
import { Clock, TrendingDown, TrendingUp, Users, Wallet } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import styled from 'styled-components'
import { PageHeader } from '../components/PageHeader'
import { Button, Card, Muted, Row, SectionTitle, Stack, Container } from '../components/ui'
import { useAuthedUser } from '../store/AppContext'
import { buildStats } from '../store/seed'
import { mq } from '../styles/theme'
import { formatBRL, formatFt, formatNumber, ftToBrl } from '../utils/format'

const SERIES = '#0098D1' // azul da marca em tom validado (≥3:1 sobre branco)
const GRID = '#EDEDED'
const AXIS = '#6E6E6E'

const Tiles = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr;
  ${mq.sm} { grid-template-columns: repeat(3, 1fr); }
`

const Tile = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: 4px;
  .label { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: ${({ theme }) => theme.colors.dark}; }
  .label svg { color: ${({ theme }) => theme.colors.primaryText}; }
  .value { font-size: 28px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.2; }
  .sub { font-size: 13px; color: ${({ theme }) => theme.colors.grayText}; display: flex; align-items: center; gap: 4px; }
  .up { color: ${({ theme }) => theme.colors.success}; font-weight: 600; }
  .down { color: ${({ theme }) => theme.colors.danger}; font-weight: 600; }
`

const Charts = styled.div`
  display: grid;
  gap: 16px;
  ${mq.lg} { grid-template-columns: 3fr 2fr; }
`

const ChartBox = styled.div`
  height: 240px;
  margin: 16px -8px 0 -16px;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
  font-size: 14px;
  th, td { padding: 10px 8px; text-align: right; border-bottom: 1px solid ${({ theme }) => theme.colors.light}; }
  th:first-child, td:first-child { text-align: left; }
  th { font-weight: 600; color: ${({ theme }) => theme.colors.grayText}; font-size: 13px; }
  td { font-variant-numeric: tabular-nums; }
`

const TipBox = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.sm};
  box-shadow: ${({ theme }) => theme.shadow.md};
  padding: 8px 12px;
  font-size: 13px;
  strong { display: block; font-size: 14px; }
  span { color: ${({ theme }) => theme.colors.grayText}; }
`

const monthLabel = (ym: string, long = false) => {
  const [y, m] = ym.split('-').map(Number)
  const s = new Date(y, m - 1, 1).toLocaleDateString('pt-BR', long ? { month: 'long', year: 'numeric' } : { month: 'short' })
  return s.replace('.', '')
}

type TipProps = { active?: boolean; payload?: { payload: { month: string; revenueFt: number; subscribers: number } }[]; kind: 'revenue' | 'subs' }
function ChartTip({ active, payload, kind }: TipProps) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <TipBox>
      <span>{monthLabel(d.month, true)}</span>
      {kind === 'revenue' ? (
        <>
          <strong>{formatFt(d.revenueFt)}</strong>
          <span>{formatBRL(ftToBrl(d.revenueFt))}</span>
        </>
      ) : (
        <strong>{d.subscribers} assinantes</strong>
      )}
    </TipBox>
  )
}

export default function Dashboard() {
  const user = useAuthedUser()
  const [showTable, setShowTable] = useState(false)
  // contas sem métricas (ainda não vindas da API) usam dados mockados
  const stats = useMemo(
    () => (user.creator!.stats.monthly.length ? user.creator!.stats : buildStats(user.email, user.creator!.priceBRL || 29.9)),
    [user],
  )
  const data = stats.monthly
  const current = data[data.length - 1]
  const previous = data[data.length - 2]
  const delta = previous ? ((current.revenueFt - previous.revenueFt) / previous.revenueFt) * 100 : 0
  const subDelta = previous ? current.subscribers - previous.subscribers : 0
  const total = data.reduce((a, d) => a + d.revenueFt, 0)

  return (
    <Container>
      <PageHeader title="Controle" back="/conta" />
      <Stack $gap={16}>
        <Tiles>
          <Tile>
            <span className="label"><TrendingUp size={18} aria-hidden /> Faturamento do mês</span>
            <span className="value">{formatFt(current.revenueFt)}</span>
            <span className="sub">
              {delta >= 0 ? <TrendingUp size={14} className="up" aria-hidden /> : <TrendingDown size={14} className="down" aria-hidden />}
              <span className={delta >= 0 ? 'up' : 'down'}>{delta >= 0 ? '+' : ''}{delta.toFixed(0)}%</span> vs. mês anterior
            </span>
          </Tile>
          <Tile>
            <span className="label"><Users size={18} aria-hidden /> Assinantes ativos</span>
            <span className="value">{formatNumber(current.subscribers)}</span>
            <span className="sub">
              <span className={subDelta >= 0 ? 'up' : 'down'}>{subDelta >= 0 ? '+' : ''}{subDelta}</span> vs. mês anterior
            </span>
          </Tile>
          <Tile>
            <span className="label"><Clock size={18} aria-hidden /> Valor a receber</span>
            <span className="value">{formatFt(stats.pendingFt)}</span>
            <span className="sub">≈ {formatBRL(ftToBrl(stats.pendingFt))} · liberado em até 7 dias</span>
          </Tile>
        </Tiles>

        <Charts>
          <Card>
            <Row $between $wrap>
              <div>
                <SectionTitle>Faturamento por mês</SectionTitle>
                <Muted>Últimos 6 meses · total {formatFt(total)}</Muted>
              </div>
              <Button $variant="ghost" $size="sm" onClick={() => setShowTable(s => !s)} aria-pressed={showTable}>
                {showTable ? 'Ver gráfico' : 'Ver tabela'}
              </Button>
            </Row>
            {showTable ? (
              <Table>
                <thead>
                  <tr><th scope="col">Mês</th><th scope="col">Faturamento</th><th scope="col">Em R$</th><th scope="col">Assinantes</th></tr>
                </thead>
                <tbody>
                  {data.map(d => (
                    <tr key={d.month}>
                      <td>{monthLabel(d.month, true)}</td>
                      <td>{formatFt(d.revenueFt)}</td>
                      <td>{formatBRL(ftToBrl(d.revenueFt))}</td>
                      <td>{d.subscribers}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <ChartBox role="img" aria-label={`Gráfico de barras do faturamento mensal. Mês atual: ${formatFt(current.revenueFt)}.`}>
                <ResponsiveContainer>
                  <BarChart data={data} barCategoryGap="28%" margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke={GRID} />
                    <XAxis dataKey="month" tickFormatter={m => monthLabel(m)} tickLine={false} axisLine={false} tick={{ fill: AXIS, fontSize: 12 }} />
                    <YAxis tickFormatter={v => formatNumber(v)} tickLine={false} axisLine={false} width={56} tick={{ fill: AXIS, fontSize: 12 }} />
                    <Tooltip cursor={{ fill: 'rgba(0,175,240,.08)' }} content={<ChartTip kind="revenue" />} />
                    <Bar dataKey="revenueFt" fill={SERIES} radius={[4, 4, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartBox>
            )}
          </Card>

          <Card>
            <SectionTitle>Assinantes</SectionTitle>
            <Muted>Assinantes ativos por mês</Muted>
            <ChartBox role="img" aria-label={`Gráfico de linha de assinantes por mês. Mês atual: ${current.subscribers}.`}>
              <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={GRID} />
                  <XAxis dataKey="month" tickFormatter={m => monthLabel(m)} tickLine={false} axisLine={false} tick={{ fill: AXIS, fontSize: 12 }} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={40} tick={{ fill: AXIS, fontSize: 12 }} />
                  <Tooltip cursor={{ stroke: GRID, strokeWidth: 1 }} content={<ChartTip kind="subs" />} />
                  <Line type="monotone" dataKey="subscribers" stroke={SERIES} strokeWidth={2} dot={{ r: 4, fill: SERIES, stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartBox>
          </Card>
        </Charts>

        <Card>
          <Row $gap={12}>
            <Wallet size={22} color="#0079A8" aria-hidden />
            <div style={{ flex: 1 }}>
              <strong>Saldo disponível para resgate: {formatFt(user.balanceFt)}</strong>
              <Muted>≈ {formatBRL(ftToBrl(user.balanceFt))}</Muted>
            </div>
          </Row>
        </Card>
      </Stack>
    </Container>
  )
}
