import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CalendarCheck, Image as ImageIcon, Lock, Pencil, Plus, Video } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { getProfile, ApiError } from '../api'
import { PageLoader } from '../components/PageLoader'
import { Avatar } from '../components/Avatar'
import { InstagramIcon, TikTokIcon, VerifiedBadge } from '../components/icons'
import { MediaGrid } from '../components/MediaGrid'
import { LoginModal } from '../components/LoginModal'
import { MediaViewer } from '../components/MediaViewer'
import { Modal } from '../components/Modal'
import { SubscribeModal, SuccessModal } from '../components/SubscribeModals'
import { Button, Container, Muted, Title } from '../components/ui'
import { useApp } from '../store/AppContext'
import { mq } from '../styles/theme'
import type { Media, MediaType, Profile } from '../types'
import { brlToFt, formatDate, formatFt } from '../utils/format'

const Wrap = styled(Container)`
  padding-top: 0;
  ${mq.md} { padding-top: 24px; }
`

const Hero = styled.section`
  background: ${({ theme }) => theme.colors.white};
  margin: 0 -16px;
  ${mq.md} { margin: 0; border-radius: ${({ theme }) => theme.radius.lg}; border: 1px solid ${({ theme }) => theme.colors.border}; overflow: hidden; }
`

const Cover = styled.div`
  position: relative;
  height: 150px;
  background: ${({ theme }) => theme.colors.primarySoft};
  ${mq.md} { height: 260px; }
  > img { width: 100%; height: 100%; object-fit: cover; }
`

const BackBtn = styled.button`
  position: absolute;
  top: 12px;
  left: 12px;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  color: ${({ theme }) => theme.colors.white};
  backdrop-filter: blur(6px);
`

const Info = styled.div`
  padding: 0 16px 20px;
  ${mq.md} { padding: 0 28px 28px; }
`

const TopRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  position: relative;
  z-index: 1;
  margin-top: -48px;
  ${mq.md} { margin-top: -64px; }
  > span { width: 96px !important; height: 96px !important; ${mq.md} { width: 128px !important; height: 128px !important; } }
`

const Socials = styled.div`
  display: flex;
  flex-shrink: 0;
  gap: 4px;
  a {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.light};
    color: ${({ theme }) => theme.colors.dark};
    transition: background-color .18s ease, color .18s ease;
    &:hover { background: ${({ theme }) => theme.colors.primarySoft}; color: ${({ theme }) => theme.colors.primaryText}; }
  }
`

const Name = styled(Title)`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
`

const Side = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 56px; /* 48px sobrepostos à capa + respiro */
  ${mq.md} { padding-top: 76px; }
`

const Counters = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  li {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 14px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.dark};
  }
  svg { color: ${({ theme }) => theme.colors.grayText}; }
  .label {
    font-weight: 500;
    color: ${({ theme }) => theme.colors.grayText};
    /* oculto visualmente no mobile, mas lido por leitores de tela */
    position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap;
    ${mq.md} { position: static; width: auto; height: auto; overflow: visible; clip: auto; }
  }
`

const ActionArea = styled.div`
  margin-top: 16px;
`

const Bio = styled.p`
  white-space: pre-line;
  font-size: 13px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.dark};
  margin: 6px 0 0;
  width: 100%;
`

const Actions = styled.div`
  display: grid;
  gap: 10px;
  ${mq.sm} { display: flex; }
`

const Subscribed = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.successSoft};
  color: ${({ theme }) => theme.colors.success};
  font-weight: 600;
  font-size: 14px;
`

const Tabs = styled.div`
  display: flex;
  gap: 4px;
  margin: 20px 0 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  overflow-x: auto;
`

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  min-height: 48px;
  padding: 0 16px;
  border: 0;
  background: transparent;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.04em;
  color: ${({ $active, theme }) => ($active ? theme.colors.primaryText : theme.colors.grayText)};
  box-shadow: inset 0 -3px 0 ${({ $active, theme }) => ($active ? theme.colors.primary : 'transparent')};
  transition: color .18s ease, box-shadow .18s ease;
  ${mq.md} { flex: 0 0 auto; }
`

// TODO: substituir pela descrição real quando a API a fornecer
const MOCK_DESCRIPTIONS = [
  'Bom dia, amores! ☀️ Acordei com vontade de compartilhar esse momento com vocês 💕',
  'Um pedacinho do meu dia que eu não podia deixar de mostrar 😘🔥 Me conta o que acharam!',
  'Domingo é dia de relaxar 🌸✨ Quem mais está curtindo o descanso? 😴💖',
  'Preparei algo especial pra vocês hoje 😈🎁 Não esqueçam de deixar o feedback 👇',
]
const mockDescription = (id: string) =>
  MOCK_DESCRIPTIONS[[...String(id)].reduce((a, c) => a + c.charCodeAt(0), 0) % MOCK_DESCRIPTIONS.length]

const Empty = styled.div`
  text-align: center;
  padding: 40px 16px;
  color: ${({ theme }) => theme.colors.grayText};
  svg { margin: 0 auto 8px; color: ${({ theme }) => theme.colors.gray}; }
`

type Filter = 'all' | MediaType
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'TODOS' },
  { key: 'photo', label: 'FOTOS' },
  { key: 'video', label: 'VÍDEOS' },
]

export default function ProfileDetail() {
  const { handle = '' } = useParams()
  const navigate = useNavigate()
  const { user, isSubscribed, subscribe } = useApp()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [viewing, setViewing] = useState<Media | null>(null)
  const closeSuccess = useCallback(() => setSuccessOpen(false), [])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    getProfile(handle)
      .then(p => active && setProfile(p))
      .catch(e => {
        if (!active) return
        setProfile(null)
        setError(e instanceof ApiError && e.status === 404 ? '' : e instanceof Error ? e.message : 'Erro ao carregar perfil')
      })
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [handle, user?.id]) // recarrega ao logar/deslogar (token muda)

  const media = useMemo(
    () => (profile ? (filter === 'all' ? profile.media : profile.media.filter(m => m.type === filter)) : []),
    [profile, filter],
  )

  if (loading) return <PageLoader />

  if (!profile) {
    return (
      <Container>
        <Empty>
          <Title>{error ? 'Não foi possível carregar' : 'Perfil não encontrado'}</Title>
          <Muted style={{ margin: '8px 0 20px' }}>{error || `O perfil @${handle} não existe ou foi removido.`}</Muted>
          <Button onClick={() => navigate('/')}>Voltar ao início</Button>
        </Empty>
      </Container>
    )
  }

  const isOwner = user?.handle === profile.handle
  const subscribed = isSubscribed(profile.id)
  const subscription = user?.subscriptions.find(s => s.profileId === profile.id)
  const canSee = isOwner || subscribed
  const photos = profile.counters?.photos ?? profile.media.filter(m => m.type === 'photo').length
  const videos = profile.counters?.videos ?? profile.media.length - photos
  const priv = profile.counters?.private ?? profile.media.filter(m => m.paid).length

  const askSubscribe = () => (user ? setConfirmOpen(true) : setLoginOpen(true))

  const confirm = () => {
    const r = subscribe(profile)
    if (!r.ok) return
    setConfirmOpen(false)
    setSuccessOpen(true)
  }

  return (
    <Wrap>
      <Hero>
        <Cover>
          <img src={profile.cover} alt={`Capa de ${profile.name}`} />
          <BackBtn onClick={() => navigate(-1)} aria-label="Voltar">
            <ArrowLeft size={22} />
          </BackBtn>
        </Cover>
        <Info>
          <TopRow>
            <Avatar name={profile.name} src={profile.avatar} size={96} ring />
            <Side>
            <Counters aria-label="Estatísticas do perfil">
              <li title="Fotos"><ImageIcon size={15} aria-hidden /> {photos} <span className="label">fotos</span></li>
              <li title="Vídeos"><Video size={15} aria-hidden /> {videos} <span className="label">vídeos</span></li>
              <li title="Mídias privadas"><Lock size={15} aria-hidden /> {priv} <span className="label">privadas</span></li>
            </Counters>
            {(profile.instagram || profile.tiktok) && (
              <Socials>
                {profile.instagram && (
                  <a href={`https://instagram.com/${profile.instagram}`} target="_blank" rel="noreferrer" aria-label={`Instagram de ${profile.name}`}>
                    <InstagramIcon size={18} />
                  </a>
                )}
                {profile.tiktok && (
                  <a href={`https://tiktok.com/@${profile.tiktok}`} target="_blank" rel="noreferrer" aria-label={`TikTok de ${profile.name}`}>
                    <TikTokIcon size={18} />
                  </a>
                )}
              </Socials>
            )}
            </Side>
          </TopRow>

          <Name as="h1">
            {profile.name} {profile.verified && <VerifiedBadge size={22} />}
          </Name>
          <Muted>@{profile.handle}</Muted>

          {profile.bio && <Bio>{profile.bio}</Bio>}

          <ActionArea>
          {isOwner ? (
            <Actions>
              <Button $size="lg" onClick={() => navigate('/postar')}>
                <Plus size={20} strokeWidth={2.6} /> Postar conteúdo
              </Button>
              <Button $size="lg" $variant="outline" onClick={() => navigate('/conta/editar')}>
                <Pencil size={18} /> Editar perfil
              </Button>
            </Actions>
          ) : subscribed && subscription ? (
            <Subscribed role="status">
              <CalendarCheck size={20} /> Assinante · acesso até {formatDate(subscription.expiresAt)}
            </Subscribed>
          ) : (
            <Button $size="lg" $block onClick={askSubscribe}>
              Assinar por {formatFt(brlToFt(profile.priceBRL))}/mês
            </Button>
          )}

          </ActionArea>
        </Info>
      </Hero>

      <section aria-label="Mídias">
        <Tabs role="tablist" aria-label="Filtrar mídias">
          {FILTERS.map(f => (
            <Tab key={f.key} role="tab" aria-selected={filter === f.key} $active={filter === f.key} onClick={() => setFilter(f.key)}>
              {f.label}
            </Tab>
          ))}
        </Tabs>
        {media.length === 0 ? (
          <Empty>
            <ImageIcon size={32} aria-hidden />
            <p>Nenhuma mídia por aqui ainda.</p>
            {isOwner && (
              <Link to="/postar" style={{ fontWeight: 700 }}>Fazer minha primeira postagem</Link>
            )}
          </Empty>
        ) : (
          <MediaGrid
            media={media}
            isLocked={m => m.paid && !canSee}
            onOpen={m => (m.paid && !canSee ? askSubscribe() : setViewing(m))}
          />
        )}
      </section>

      {!isOwner && (
        <SubscribeModal
          profile={profile}
          open={confirmOpen}
          balanceFt={user?.balanceFt ?? 0}
          onClose={() => setConfirmOpen(false)}
          onConfirm={confirm}
        />
      )}
      <LoginModal open={loginOpen && !user} onClose={() => setLoginOpen(false)} />
      <SuccessModal open={successOpen} onClose={closeSuccess} handle={profile.handle} />

      <Modal open={!!viewing} onClose={() => setViewing(null)} label="Visualizar mídia" width={720}>
        {viewing && (
          <MediaViewer media={viewing} description={mockDescription(viewing.id)} />
        )}
      </Modal>
    </Wrap>
  )
}
