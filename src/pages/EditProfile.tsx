import { useState } from 'react'
import { Image, KeyRound, PauseCircle, Share2, Tag, Trash2, UserPen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
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
  const { updateProfile, setPaused, deleteAccount } = useApp()
  const toast = useToast()
  const navigate = useNavigate()
  const isCreator = user.creatorStatus === 'verified' && !!user.creator
  const [confirm, setConfirm] = useState<'pause' | 'delete' | null>(null)

  const onAvatar = (avatar: string) => {
    const r = updateProfile({ avatar })
    toast({ title: r.ok ? 'Foto de perfil atualizada' : r.error, tone: r.ok ? 'success' : 'info' })
  }

  const close = () => setConfirm(null)

  const onPause = () => {
    setPaused(!user.paused)
    toast({ title: user.paused ? 'Conta reativada' : 'Conta pausada', tone: 'success' })
    close()
  }

  const onDelete = () => {
    deleteAccount()
    navigate('/login', { replace: true })
  }

  return (
    <NarrowContainer>
      <PageHeader title="Editar Perfil" back="/conta" />
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
          {isCreator && (
            <>
              <ActionItem icon={<Image size={20} />} title="Foto de capa e biografia" to="/conta/editar/capa" />
              <ActionItem icon={<Tag size={20} />} title="Assinatura" to="/conta/editar/assinatura" />
              <ActionItem icon={<Share2 size={20} />} title="Redes sociais" to="/conta/editar/redes" />
            </>
          )}
        </List>

        <List>
          <ActionItem icon={<KeyRound size={20} />} tone="neutral" title="Alterar senha" to="/conta/editar/senha" />
          <ActionItem
            icon={<PauseCircle size={20} />}
            tone="neutral"
            title={user.paused ? 'Reativar conta' : 'Pausar conta'}
            onClick={() => setConfirm('pause')}
          />
          <ActionItem icon={<Trash2 size={20} />} tone="danger" title="Excluir conta" onClick={() => setConfirm('delete')} />
        </List>
      </Stack>

      <Modal open={confirm === 'pause'} onClose={close} label={user.paused ? 'Reativar conta' : 'Pausar conta'}>
        <Confirm>
          <SectionTitle>{user.paused ? 'Reativar conta?' : 'Pausar conta?'}</SectionTitle>
          <Muted>
            {user.paused
              ? 'Seu perfil voltará a ficar visível para os assinantes.'
              : 'Seu perfil ficará oculto até você reativar a conta. Você pode voltar quando quiser.'}
          </Muted>
          <Row $gap={8}>
            <Button $variant="outline" $block onClick={close}>Cancelar</Button>
            <Button $block onClick={onPause}>{user.paused ? 'Reativar' : 'Pausar'}</Button>
          </Row>
        </Confirm>
      </Modal>

      <Modal open={confirm === 'delete'} onClose={close} label="Excluir conta">
        <Confirm>
          <SectionTitle>Excluir conta?</SectionTitle>
          <Muted>Esta ação é permanente: seu perfil, publicações e saldo serão removidos e não poderão ser recuperados.</Muted>
          <Row $gap={8}>
            <Button $variant="outline" $block onClick={close}>Cancelar</Button>
            <Button $variant="danger" $block onClick={onDelete}>Excluir</Button>
          </Row>
        </Confirm>
      </Modal>
    </NarrowContainer>
  )
}
