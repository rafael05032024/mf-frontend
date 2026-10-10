import { useEffect, useState } from 'react'
import { getMe, updatePlan } from '../api'
import { AmountPicker, parseBRL, validateBRL } from '../components/AmountPicker'
import { PageHeader } from '../components/PageHeader'
import { useToast } from '../components/Toast'
import { Button, Card, NarrowContainer, SectionTitle, Stack } from '../components/ui'
import { useApp, useAuthedUser } from '../store/AppContext'

export default function EditProfilePlan() {
  const user = useAuthedUser()
  const { updateProfile } = useApp()
  const toast = useToast()
  const [price, setPrice] = useState(String(user.creator!.priceBRL))
  const [priceError, setPriceError] = useState<string>()
  const [savingPrice, setSavingPrice] = useState(false)

  const savePrice = async () => {
    const err = validateBRL(price, true)
    setPriceError(err)
    if (err) return
    setSavingPrice(true)
    try {
      await updatePlan(parseBRL(price))
      const r = updateProfile({ priceBRL: parseBRL(price) })
      if (!r.ok) return setPriceError(r.error)
      toast({ title: 'Valor da assinatura atualizado', tone: 'success' })
    } catch (e) {
      setPriceError(e instanceof Error ? e.message : 'Não foi possível atualizar o valor')
    } finally {
      setSavingPrice(false)
    }
  }

  // o valor da assinatura vem da API (plan_value de /accounts/me)
  useEffect(() => {
    getMe()
      .then(me => {
        if (typeof me.plan_value !== 'number') return
        setPrice(String(me.plan_value))
        updateProfile({ priceBRL: me.plan_value })
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <NarrowContainer>
      <PageHeader title="Assinatura" back="/conta/editar" />
      <Card>
        <Stack $gap={12}>
          <SectionTitle>Valor da assinatura</SectionTitle>
          <AmountPicker
            hideLabel
            label="Valor da assinatura (mensal)"
            value={price}
            onChange={v => { setPrice(v); setPriceError(undefined) }}
            error={priceError}
            presets={[15, 20, 30, 50, 100, 150]}
            whole
          />
          <Button onClick={savePrice} disabled={savingPrice || parseBRL(price) === user.creator!.priceBRL}>Salvar valor</Button>
        </Stack>
      </Card>
    </NarrowContainer>
  )
}
