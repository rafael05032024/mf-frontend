import { cloneElement, useState } from 'react'
import { AtSign, ShieldCheck } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { AmountPicker, parseBRL, validateBRL } from '../components/AmountPicker'
import { Field } from '../components/Field'
import { InstagramIcon, TikTokIcon } from '../components/icons'
import { ImageUpload } from '../components/ImageUpload'
import { PageHeader } from '../components/PageHeader'
import { useToast } from '../components/Toast'
import { Alert, Button, Card, Input, Muted, NarrowContainer, Select, Stack, Textarea } from '../components/ui'
import { useApp, useAuthedUser } from '../store/AppContext'
import { mq } from '../styles/theme'
import { ageFrom, brlToFt, formatFt, HANDLE_RE, isValidCPF, maskCPF, normalizeHandle } from '../utils/format'

const STEPS = [
  { title: 'Dados pessoais', desc: 'Precisamos confirmar sua identidade. Esses dados não aparecem no seu perfil.' },
  { title: 'Seu perfil', desc: 'Como os fãs vão te encontrar na plataforma.' },
  { title: 'Capa e biografia', desc: 'Capriche: é a primeira impressão do seu perfil.' },
  { title: 'Redes sociais', desc: 'Opcional. Ajuda seus seguidores a te encontrarem.' },
  { title: 'Valor da assinatura', desc: 'Quanto seus assinantes pagarão por mês.' },
  { title: 'Verificação de documento', desc: 'Envie fotos nítidas do seu RG para validarmos seu perfil.' },
]

const COUNTRIES = ['Brasil', 'Portugal', 'Argentina', 'Estados Unidos', 'Outro']

const Progress = styled.div`
  margin-bottom: 16px;
  .meta { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; color: ${({ theme }) => theme.colors.grayText}; margin-bottom: 8px; }
  .track { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; }
  .seg { height: 6px; border-radius: 3px; background: ${({ theme }) => theme.colors.border}; transition: background-color .25s ease; }
  .seg.done { background: ${({ theme }) => theme.colors.primary}; }
`

const StepHead = styled.div`
  h2 { font-size: 20px; font-weight: 800; letter-spacing: -0.01em; }
`

const Nav = styled.div`
  display: grid;
  gap: 10px;
  grid-template-columns: 1fr;
  ${mq.sm} { grid-template-columns: auto 1fr; }
`

const Prefixed = styled.div`
  position: relative;
  > span { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: ${({ theme }) => theme.colors.grayText}; display: flex; }
  input { padding-left: 44px; }
`

const DocGrid = styled.div`
  display: grid;
  gap: 16px;
  ${mq.sm} { grid-template-columns: 1fr 1fr; }
  > div:last-child { ${mq.sm} { grid-column: 1 / -1; } }
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
  rgFront: string
  rgBack: string
  selfie: string
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

export default function BecomeCreator() {
  const user = useAuthedUser()
  const { submitCreator, handleAvailable } = useApp()
  const toast = useToast()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<Errors>({})
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
    price: '29.90',
    rgFront: '',
    rgBack: '',
    selfie: '',
  })

  if (user.creatorStatus !== 'none') return <Navigate to="/conta" replace />

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm(f => ({ ...f, [k]: v }))
    if (errors[k]) setErrors(e => ({ ...e, [k]: undefined }))
  }

  const validate = (s: number): Errors => {
    const er: Errors = {}
    if (s === 0) {
      if (!form.country) er.country = 'Selecione o país.'
      if (!isValidCPF(form.cpf)) er.cpf = 'CPF inválido.'
      if (form.legalName.trim().split(/\s+/).length < 2) er.legalName = 'Informe seu nome completo.'
      if (!form.birthDate) er.birthDate = 'Informe sua data de nascimento.'
      else if (ageFrom(form.birthDate) < 18) er.birthDate = 'É preciso ter 18 anos ou mais para ser criador.'
    }
    if (s === 1) {
      if (!form.avatar) er.avatar = 'Envie uma foto de perfil.'
      if (form.displayName.trim().length < 2) er.displayName = 'Informe o nome do perfil.'
      if (!HANDLE_RE.test(form.handle)) er.handle = 'Use 3 a 20 caracteres: letras minúsculas, números, "." ou "_".'
      else if (form.handle !== user.handle && !handleAvailable(form.handle)) er.handle = 'Este identificador já está em uso.'
    }
    if (s === 2) {
      if (!form.cover) er.cover = 'Envie uma foto de capa.'
      if (form.bio.trim().length < 10) er.bio = 'A biografia deve ter pelo menos 10 caracteres.'
    }
    if (s === 4) er.price = validateBRL(form.price)
    if (s === 5) {
      if (!form.rgFront) er.rgFront = 'Envie a frente do RG.'
      if (!form.rgBack) er.rgBack = 'Envie o verso do RG.'
      if (!form.selfie) er.selfie = 'Envie a foto segurando o RG.'
    }
    return Object.fromEntries(Object.entries(er).filter(([, v]) => v)) as Errors
  }

  const next = () => {
    const er = validate(step)
    setErrors(er)
    if (Object.keys(er).length) return
    setStep(s => s + 1)
    window.scrollTo({ top: 0 })
  }

  const back = () => {
    setErrors({})
    if (step === 0) navigate('/conta')
    else setStep(s => s - 1)
  }

  const submit = () => {
    const er = validate(5)
    setErrors(er)
    if (Object.keys(er).length) return
    const r = submitCreator({
      displayName: form.displayName,
      handle: form.handle,
      country: form.country,
      cpf: form.cpf,
      legalName: form.legalName.trim(),
      birthDate: form.birthDate,
      priceBRL: parseBRL(form.price),
      bio: form.bio.trim(),
      instagram: normalizeHandle(form.instagram) || undefined,
      tiktok: normalizeHandle(form.tiktok) || undefined,
      avatar: form.avatar,
      cover: form.cover,
    })
    if (!r.ok) {
      setStep(1)
      setErrors({ handle: r.error })
      return
    }
    toast({
      title: 'Perfil em validação',
      message: 'Recebemos seus documentos e estamos validando seu perfil. Você será notificado assim que for aprovado.',
      duration: 10_000,
    })
    navigate('/conta')
  }

  const docsReady = !!(form.rgFront && form.rgBack && form.selfie)
  const isLast = step === STEPS.length - 1
  const priceValid = !validateBRL(form.price)

  return (
    <NarrowContainer>
      <PageHeader title="Torne-se um criador" back="/conta" />

      <Progress aria-label={`Etapa ${step + 1} de ${STEPS.length}`}>
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

          {step === 0 && (
            <>
              <Field label="País" error={errors.country}>
                <Select value={form.country} onChange={e => set('country', e.target.value)}>
                  {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                </Select>
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

          {step === 1 && (
            <>
              <ImageUpload label="Foto de perfil" shape="avatar" value={form.avatar} onChange={v => set('avatar', v)} error={errors.avatar} hint="Enviar" />
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

          {step === 2 && (
            <>
              <ImageUpload label="Foto de capa" shape="cover" value={form.cover} onChange={v => set('cover', v)} error={errors.cover} hint="Enviar capa (proporção 3:1)" />
              <Field label="Biografia" error={errors.bio} hint={`${form.bio.length}/500`}>
                <Textarea
                  value={form.bio}
                  maxLength={500}
                  onChange={e => set('bio', e.target.value)}
                  placeholder="Conte o que seus assinantes vão encontrar por aqui…"
                />
              </Field>
            </>
          )}

          {step === 3 && (
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

          {step === 4 && (
            <>
              <AmountPicker label="Valor mensal da assinatura" value={form.price} onChange={v => set('price', v)} error={errors.price} presets={[15, 19.9, 29.9, 49.9, 99.9]} />
              <PriceSummary>
                <span>Seus assinantes pagarão</span>
                <strong>{priceValid ? `${formatFt(brlToFt(parseBRL(form.price)))}/mês` : '—'}</strong>
              </PriceSummary>
            </>
          )}

          {step === 5 && (
            <>
              <DocGrid>
                <ImageUpload label="RG (frente)" value={form.rgFront} onChange={v => set('rgFront', v)} error={errors.rgFront} hint="Enviar frente" />
                <ImageUpload label="RG (verso)" value={form.rgBack} onChange={v => set('rgBack', v)} error={errors.rgBack} hint="Enviar verso" />
                <ImageUpload label="Foto segurando o RG" value={form.selfie} onChange={v => set('selfie', v)} error={errors.selfie} hint="Selfie com o documento ao lado do rosto" />
              </DocGrid>
              <Alert $tone="info">
                <ShieldCheck size={18} />
                Seus documentos são usados apenas para verificação e nunca ficam visíveis no seu perfil.
              </Alert>
            </>
          )}

          <Nav>
            <Button $variant="ghost" onClick={back}>{step === 0 ? 'Cancelar' : 'Voltar'}</Button>
            {!isLast ? (
              <Button onClick={next} $block>Próximo</Button>
            ) : (
              docsReady && <Button onClick={submit} $block>Encaminhar para validação</Button>
            )}
          </Nav>
        </Stack>
      </Card>
    </NarrowContainer>
  )
}

