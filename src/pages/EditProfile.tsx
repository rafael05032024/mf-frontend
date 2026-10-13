import { useState } from 'react'
import { BadgeDollarSign, Image, KeyRound, ShieldCheck, PauseCircle, Share2, Trash2, UserPen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { deleteAccountRequest, getMe, mediaUrl, pauseAccount, uploadPhoto } from '../api'
import { ActionItem, List } from '../components/ActionList'
import { Avatar } from '../components/Avatar'
import { ImageUpload } from '../components/ImageUpload'
import { Modal } from '../components/Modal'
import { PageHeader } from '../components/PageHeader'
import { useToast } from '../components/Toast'
import { Button, Muted, NarrowContainer, Row, SectionTitle, Stack } from '../components/ui'
import { useApp, useAuthedUser } from '../store/AppContext'

const Head = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 0 4px;
`

const Confirm = styled(Stack)`
  padding: 32px 24px 24px;
`

export default function EditProfile() {
  const user = useAuthedUser()
  const { updateProfile, logout, deleteAccount } = useApp()
  const toast = useToast()
  const navigate = useNavigate()
  const isCreator = user.creatorStatus === 'verified' && !!user.creator
  const [confirm, setConfirm] = useState<'pause' | 'delete' | null>(null)
  const [loading, setLoading] = useState(false)

  const onAvatar = async (avatar: string) => {
    // a foto precisa ir para a API, senão o perfil público continua exibindo a antiga
    try {
      await uploadPhoto(avatar)
      const me = await getMe().catch(() => undefined)
      avatar = mediaUrl(me?.thumb) ?? avatar
    } catch (err) {
      return toast({ title: err instanceof Error ? err.message : 'Não foi possível atualizar a foto.', tone: 'danger' })
    }
    const r = updateProfile({ avatar })
    toast({ title: r.ok ? 'Foto de perfil atualizada' : r.error, tone: r.ok ? 'success' : 'info' })
  }

  const close = () => {
    if (!loading) setConfirm(null)
  }

  // pausar e excluir encerram a sessão: em ambos os casos o usuário volta para o login
  const onPause = async () => {
    if (loading) return
    setLoading(true)
    try {
      await pauseAccount()
    } catch (err) {
      setLoading(false)
      return toast({ title: err instanceof Error && err.message ? err.message : 'Não foi possível pausar a conta.', tone: 'danger' })
    }
    logout()
    toast({ title: 'Conta pausada', tone: 'success' })
    navigate('/login', { replace: true })
  }

  const onDelete = async () => {
    if (loading) return
    setLoading(true)
    try {
      await deleteAccountRequest()
    } catch (err) {
      setLoading(false)
      return toast({ title: err instanceof Error && err.message ? err.message : 'Não foi possível excluir a conta.', tone: 'danger' })
    }
    deleteAccount()
    toast({ title: 'Conta excluída', tone: 'success' })
    navigate('/login', { replace: true })
  }

  return (
    <NarrowContainer>
      <PageHeader title="Configurações do perfil" back="/conta" />
      <Stack $gap={20}>
        <Head>
          {isCreator ? (
            <ImageUpload hideLabel label="Foto de perfil" shape="avatar" size={160} crop value={user.creator?.avatar} onChange={onAvatar} />
          ) : (
            <Avatar name={user.name} size={160} />
          )}
          <Muted>@{user.handle}</Muted>
        </Head>

        <List>
          <ActionItem icon={<UserPen size={20} />} title="Nome de perfil e identificador" to="/conta/editar/nome" />
          {user.level === 2 && <ActionItem icon={<ShieldCheck size={20} />} title="Verificar conta" to="/conta/editar/verificar" />}
          {isCreator && (
            <>
              <ActionItem icon={<Image size={20} />} title="Foto de capa e biografia" to="/conta/editar/capa" />
              <ActionItem icon={<BadgeDollarSign size={20} />} title="Assinatura" to="/conta/editar/assinatura" />
              <ActionItem icon={<Share2 size={20} />} title="Redes sociais" to="/conta/editar/redes" />
            </>
          )}
        </List>

        <List>
          <ActionItem icon={<KeyRound size={20} />} tone="neutral" title="Alterar senha" to="/conta/editar/senha" />
          <ActionItem
            icon={<PauseCircle size={20} />}
            tone="neutral"
            title="Pausar conta"
            onClick={() => setConfirm('pause')}
          />
          <ActionItem icon={<Trash2 size={20} />} tone="danger" title="Excluir conta" onClick={() => setConfirm('delete')} />
        </List>
      </Stack>

      <Modal open={confirm === 'pause'} onClose={close} label="Pausar conta">
        <Confirm>
          <SectionTitle>Pausar conta?</SectionTitle>
          <Muted>Seu perfil ficará oculto e sua sessão será encerrada. Faça login novamente para reativar a conta.</Muted>
          <Row $gap={8}>
            <Button $variant="outline" $block onClick={close} disabled={loading}>Cancelar</Button>
            <Button $block onClick={onPause} disabled={loading}>{loading ? 'Pausando...' : 'Pausar'}</Button>
          </Row>
        </Confirm>
      </Modal>

      <Modal open={confirm === 'delete'} onClose={close} label="Excluir conta">
        <Confirm>
          <SectionTitle>Excluir conta?</SectionTitle>
          <Muted>Esta ação é permanente: seu perfil, publicações e saldo serão removidos e não poderão ser recuperados.</Muted>
          <Row $gap={8}>
            <Button $variant="outline" $block onClick={close} disabled={loading}>Cancelar</Button>
            <Button $variant="danger" $block onClick={onDelete} disabled={loading}>{loading ? 'Excluindo...' : 'Excluir'}</Button>
          </Row>
        </Confirm>
      </Modal>
    </NarrowContainer>
  )
}
