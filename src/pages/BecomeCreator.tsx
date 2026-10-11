import { cloneElement, useEffect, useRef, useState } from 'react'
import { AtSign, Clock, ExternalLink } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Navigate, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { ApiError, createLiveness, createPlan, eventName, getMe, mediaUrl, preRegisterPartner, subscribeEvents, updateMe, uploadCover, uploadPhoto } from '../api'
import { AmountPicker, parseBRL, validateBRL } from '../components/AmountPicker'
import { EmojiTextarea } from '../components/EmojiTextarea'
import { Field } from '../components/Field'
import { InstagramIcon, TikTokIcon } from '../components/icons'
import { ImageUpload } from '../components/ImageUpload'
import { Modal } from '../components/Modal'
import { PageHeader } from '../components/PageHeader'
import { useToast } from '../components/Toast'
import { Button, Card, Input, Muted, NarrowContainer, Stack } from '../components/ui'
import { useApp, useAuthedUser } from '../store/AppContext'
import { ageFrom, brlToFt, formatFt, HANDLE_RE, isValidCPF, maskCPF, normalizeHandle } from '../utils/format'

type StepId = 'personal' | 'profile' | 'cover' | 'social' | 'price' | 'verify'

const ALL_STEPS: { id: StepId; title: string; desc: string }[] = [
  { id: 'personal', title: 'Dados pessoais', desc: 'Precisamos confirmar sua identidade. Esses dados não aparecem no seu perfil.' },
  { id: 'profile', title: 'Seu perfil', desc: 'Como os fãs vão te encontrar na plataforma.' },
  { id: 'cover', title: 'Capa e biografia', desc: 'Capriche: é a primeira impressão do seu perfil.' },
  { id: 'social', title: 'Redes sociais', desc: 'Opcional. Ajuda seus seguidores a te encontrarem.' },
  { id: 'price', title: 'Valor da assinatura', desc: 'Quanto seus assinantes pagarão por mês.' },
  { id: 'verify', title: 'Verificação de documentos', desc: 'Escaneie o QRCode com o celular ou abra o link neste aparelho para verificar seus documentos.' },
]

// conta level 2 (pré-cadastro): só falta confirmar identidade e verificar documentos; perfil, foto, capa, bio, redes e plano já existem
const VERIFY_STEPS = ALL_STEPS.filter(s => s.id === 'personal' || s.id === 'verify')

const ReviewNotice = styled.div`
  padding: 28px 20px 24px;
  text-align: center;
  display: grid;
  gap: 8px;
  justify-items: center;
  h2 { font-size: 20px; }
  svg { color: ${({ theme }) => theme.colors.primaryText}; }
`

const Progress = styled.div`
  margin-bottom: 16px;
  .meta { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; color: ${({ theme }) => theme.colors.grayText}; margin-bottom: 8px; }
  .track { display: grid; grid-template-columns: repeat(var(--steps, 6), 1fr); gap: 6px; }
  .seg { height: 6px; border-radius: 3px; background: ${({ theme }) => theme.colors.border}; transition: background-color .25s ease; }
  .seg.done { background: ${({ theme }) => theme.colors.primary}; }
`

const StepHead = styled.div`
  h2 { font-size: 20px; font-weight: 800; letter-spacing: -0.01em; }
`

const Nav = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
`

const Prefixed = styled.div`
  position: relative;
  > span { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: ${({ theme }) => theme.colors.grayText}; display: flex; }
  input { padding-left: 44px; }
`

const QRBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  .qr { padding: 16px; background: #fff; border-radius: ${({ theme }) => theme.radius.md}; border: 1px solid ${({ theme }) => theme.colors.border}; line-height: 0; }
`

const PriceSummary = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.primarySoft};
  color: ${({ theme }) => theme.colors.primaryText};
  font-weight: 600;
  strong { font-size: 18px; font-weight: 800; }
`

type Form = {
  country: string
  cpf: string
  legalName: string
  birthDate: string
  avatar: string
  displayName: string
  handle: string
  cover: string
  bio: string
  instagram: string
  tiktok: string
  price: string
}
type Errors = Partial<Record<keyof Form, string>>

/** Input com ícone à esquerda; repassa id/aria (injetados pelo Field) ao input interno. */
function Prefix({ icon, children, ...aria }: { icon: React.ReactNode; children: React.ReactElement<Record<string, unknown>> }) {
  return (
    <Prefixed>
      <span aria-hidden>{icon}</span>
      {cloneElement(children, aria)}
    </Prefixed>
  )
}

export default function BecomeCreator({ verifyOnly = false }: { verifyOnly?: boolean }) {
  const STEPS = verifyOnly ? VERIFY_STEPS : ALL_STEPS
  const user = useAuthedUser()
  const { handleAvailable, applyLevel, applyProfile } = useApp()
  const toast = useToast()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<Errors>({})
  const [verifyUrl, setVerifyUrl] = useState('')
  const [saving, setSaving] = useState(false)
  // ao prosseguir sem verificação a conta muda de status; o redirecionamento deve ir para a tela inicial
  const skipped = useRef(false)
  const [inReview, setInReview] = useState(false)
  const [form, setForm] = useState<Form>({
    country: 'Brasil',
    cpf: '',
    legalName: '',
    birthDate: '',
    avatar: '',
    displayName: user.name,
    handle: user.handle,
    cover: '',
    bio: '',
    instagram: '',
    tiktok: '',
    price: '30',
  })

  // evita reenviar o que já foi salvo quando o usuário volta e avança de novo
  const sent = useRef<Partial<Record<string, string>>>({})

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm(f => ({ ...f, [k]: v }))
    if (errors[k]) setErrors(e => ({ ...e, [k]: undefined }))
  }

  const validate = (s: StepId): Errors => {
    const er: Errors = {}
    if (s === 'personal') {
      if (!form.country) er.country = 'Selecione o país.'
      if (!isValidCPF(form.cpf)) er.cpf = 'CPF inválido.'
      if (form.legalName.trim().split(/\s+/).length < 2) er.legalName = 'Informe seu nome completo.'
      if (!form.birthDate) er.birthDate = 'Informe sua data de nascimento.'
      else if (ageFrom(form.birthDate) < 18) er.birthDate = 'É preciso ter 18 anos ou mais para ser criador.'
    }
    if (s === 'profile') {
      if (!form.avatar) er.avatar = 'Envie uma foto de perfil.'
      if (form.displayName.trim().length < 2) er.displayName = 'Informe o nome do perfil.'
      if (!HANDLE_RE.test(form.handle)) er.handle = 'Use 3 a 20 caracteres: letras minúsculas, números, "." ou "_".'
      else if (form.handle !== user.handle && !handleAvailable(form.handle)) er.handle = 'Este identificador já está em uso.'
    }
    if (s === 'cover') {
      if (!form.cover) er.cover = 'Envie uma foto de capa.'
    }
    if (s === 'price') er.price = validateBRL(form.price, true)
    return Object.fromEntries(Object.entries(er).filter(([, v]) => v)) as Errors
  }

  const once = async (key: string, value: string, fn: () => Promise<unknown>) => {
    if (sent.current[key] === value) return
    await fn()
    sent.current[key] = value
  }

  /** Salva na API os dados da etapa atual */
  const saveStep = async (s: StepId) => {
    if (s === 'personal')
      await once('s0', JSON.stringify([form.cpf, form.legalName, form.birthDate]), () =>
        updateMe({ document: form.cpf.replace(/\D/g, ''), real_name: form.legalName.trim(), birthdate: form.birthDate }))
    if (s === 'profile') {
      await once('avatar', form.avatar, () => uploadPhoto(form.avatar))
      await once('s1', JSON.stringify([form.displayName, form.handle]), () =>
        updateMe({ name: form.displayName.trim(), profile: form.handle }))
    }
    if (s === 'cover') {
      await once('cover', form.cover, () => uploadCover(form.cover))
      await once('s2', form.bio, () => updateMe({ description: form.bio.trim() }))
    }
    if (s === 'social') {
      const instagram = normalizeHandle(form.instagram)
      const tiktok = normalizeHandle(form.tiktok)
      await once('s3', JSON.stringify([instagram, tiktok]), () =>
        updateMe({ instagram: instagram ? `@${instagram}` : '', tiktok: tiktok ? `@${tiktok}` : '' }))
    }
    if (s === 'price') await once('price', form.price, () => createPlan(parseBRL(form.price)))
    // o QRCode é gerado ao entrar na etapa de verificação
    if (STEPS[STEPS.findIndex(x => x.id === s) + 1]?.id === 'verify') await loadVerification()
  }

  const loadVerification = async () => {
    if (!verifyUrl) setVerifyUrl(await createLiveness())
  }

  const next = async () => {
    const er = validate(stepId)
    setErrors(er)
    if (Object.keys(er).length) return
    setSaving(true)
    try {
      await saveStep(stepId)
    } catch (e) {
      toast({ title: 'Não foi possível salvar', message: e instanceof ApiError ? e.message : 'Tente novamente.' })
      return
    } finally {
      setSaving(false)
    }
    setStep(s => s + 1)
    window.scrollTo({ top: 0 })
  }

  const skipVerification = async () => {
    setSaving(true)
    skipped.current = true
    try {
      await preRegisterPartner()
      // consulta novamente os dados da conta logada
      const me = await getMe()
      applyLevel(user.email, me.level ?? 1)
      applyProfile(user.email, me.profile.replace(/^@/, ''), { name: me.name, avatar: mediaUrl(me.thumb), cover: mediaUrl(me.cover_photo) })
      navigate('/', { replace: true, state: { preRegistered: true } })
    } catch (e) {
      skipped.current = false
      toast({ title: 'Não foi possível prosseguir', message: e instanceof ApiError ? e.message : 'Tente novamente.' })
    } finally {
      setSaving(false)
    }
  }

  const retryVerification = async () => {
    setSaving(true)
    try {
      await loadVerification()
    } catch (e) {
      toast({ title: 'Não foi possível gerar o QRCode', message: e instanceof ApiError ? e.message : 'Tente novamente.' })
    } finally {
      setSaving(false)
    }
  }

  // Evento do WebSocket: documentos recebidos e em análise; avisa por 5s e vai para a página inicial
  useEffect(
    () =>
      subscribeEvents(data => {
        if (eventName(data) === 'liveness_request_in_review') setInReview(true)
      }),
    [],
  )
  useEffect(() => {
    if (!inReview) return
    const t = window.setTimeout(() => navigate('/'), 5000)
    return () => window.clearTimeout(t)
  }, [inReview, navigate])

  const stepId = STEPS[step].id
  const isLast = step === STEPS.length - 1
  const priceValid = !validateBRL(form.price, true)

  // depois de todos os hooks (um return antes deles quebra a renderização)
  if (verifyOnly && user.level !== 2) return <Navigate to="/conta/editar" replace />
  if (!verifyOnly && user.creatorStatus !== 'none') return <Navigate to={skipped.current ? '/' : '/conta'} state={skipped.current ? { preRegistered: true } : undefined} replace />

  return (
    <NarrowContainer>
      <PageHeader title={verifyOnly ? 'Verificar conta' : 'Torne-se um criador'} back={verifyOnly ? '/conta/editar' : '/conta'} />

      <Progress style={{ '--steps': STEPS.length } as React.CSSProperties} aria-label={`Etapa ${step + 1} de ${STEPS.length}`}>
        <div className="meta">
          <span>Etapa {step + 1} de {STEPS.length}</span>
          <span>{STEPS[step].title}</span>
        </div>
        <div className="track" aria-hidden>
          {STEPS.map((_, i) => <span key={i} className={`seg ${i <= step ? 'done' : ''}`} />)}
        </div>
      </Progress>

      <Card>
        <Stack $gap={18}>
          <StepHead>
            <h2>{STEPS[step].title}</h2>
            <Muted>{STEPS[step].desc}</Muted>
          </StepHead>

          {stepId === 'personal' && (
            <>
              <Field label="País" error={errors.country}>
                <Input value="Brasil" readOnly />
              </Field>
              <Field label="CPF" error={errors.cpf}>
                <Input inputMode="numeric" value={form.cpf} onChange={e => set('cpf', maskCPF(e.target.value))} placeholder="000.000.000-00" />
              </Field>
              <Field label="Nome completo" error={errors.legalName} hint="Igual ao do documento">
                <Input value={form.legalName} onChange={e => set('legalName', e.target.value)} autoComplete="name" />
              </Field>
              <Field label="Data de nascimento" error={errors.birthDate}>
                <Input type="date" value={form.birthDate} onChange={e => set('birthDate', e.target.value)} max={new Date().toISOString().slice(0, 10)} />
              </Field>
            </>
          )}

          {stepId === 'profile' && (
            <>
              <ImageUpload label="Foto de perfil" shape="avatar" size={180} center crop value={form.avatar} onChange={v => set('avatar', v)} error={errors.avatar} hint="Enviar" />
              <Field label="Nome do perfil" error={errors.displayName} hint="Nome exibido para os fãs">
                <Input value={form.displayName} onChange={e => set('displayName', e.target.value)} />
              </Field>
              <Field label="Perfil identificador na plataforma" error={errors.handle} hint={`myfoot.com/perfil/${form.handle || 'seu.perfil'}`}>
                <Prefix icon={<AtSign size={18} />}>
                  <Input value={form.handle} onChange={e => set('handle', normalizeHandle(e.target.value))} autoCapitalize="none" />
                </Prefix>
              </Field>
            </>
          )}

          {stepId === 'cover' && (
            <>
              <ImageUpload label="Foto de capa" shape="cover" crop value={form.cover} onChange={v => set('cover', v)} error={errors.cover} hint="Enviar capa (proporção 3:1)" />
              <Field label="Biografia" error={errors.bio} hint={`${form.bio.length}/500`}>
                <EmojiTextarea
                  value={form.bio}
                  maxLength={500}
                  onChange={v => set('bio', v)}
                  placeholder="Conte o que seus assinantes vão encontrar por aqui…"
                />
              </Field>
            </>
          )}

          {stepId === 'social' && (
            <>
              <Field label="Perfil do Instagram">
                <Prefix icon={<InstagramIcon size={18} />}>
                  <Input value={form.instagram} onChange={e => set('instagram', e.target.value)} placeholder="seu.instagram" autoCapitalize="none" />
                </Prefix>
              </Field>
              <Field label="Perfil do TikTok">
                <Prefix icon={<TikTokIcon size={18} />}>
                  <Input value={form.tiktok} onChange={e => set('tiktok', e.target.value)} placeholder="seu.tiktok" autoCapitalize="none" />
                </Prefix>
              </Field>
            </>
          )}

          {stepId === 'price' && (
            <>
              <AmountPicker label="Valor mensal da assinatura" value={form.price} onChange={v => set('price', v)} error={errors.price} presets={[15, 20, 30, 50, 100, 150]} whole />
              <PriceSummary>
                <span>Seus assinantes pagarão</span>
                <strong>{priceValid ? `${formatFt(brlToFt(parseBRL(form.price)))}/mês` : '—'}</strong>
              </PriceSummary>
            </>
          )}

          {stepId === 'verify' && (
            <>
              <QRBox>
                {verifyUrl ? (
                  <>
                    <div className="qr"><QRCodeSVG value={verifyUrl} size={200} /></div>
                    <Muted>Está no celular? Abra o link abaixo neste aparelho.</Muted>
                    <Button as="a" href={verifyUrl} target="_blank" rel="noopener noreferrer" $size="sm">
                      <ExternalLink size={16} /> Abrir verificação
                    </Button>
                  </>
                ) : (
                  <Button $variant="ghost" onClick={retryVerification} disabled={saving}>Gerar QRCode</Button>
                )}
              </QRBox>
            </>
          )}

          <Nav>
            {!isLast && <Button onClick={next} $block disabled={saving}>{saving ? 'Salvando…' : 'Próximo'}</Button>}
            {isLast && !verifyOnly && <Button $variant="outline" $block onClick={skipVerification} disabled={saving}>{saving ? 'Aguarde…' : 'Prosseguir sem verificação'}</Button>}
          </Nav>
        </Stack>
      </Card>

      <Modal open={inReview} onClose={() => {}} hideClose label="Análise em andamento" width={380}>
        <ReviewNotice>
          <Clock size={48} aria-hidden />
          <h2>Análise em andamento</h2>
          <Muted>Recebemos seus documentos. A análise para verificação da sua conta está em andamento.</Muted>
        </ReviewNotice>
      </Modal>
    </NarrowContainer>
  )
}

