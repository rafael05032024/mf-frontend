import type { Media, Profile } from '../types'

const img = (seed: string, w: number, h: number) => `https://picsum.photos/seed/${seed}/${w}/${h}`
const avatar = (n: number) => `https://i.pravatar.cc/300?img=${n}`

const captions = [
  'Fim de tarde na praia 🌅',
  'Nova pedicure, o que acharam?',
  'Sessão especial para assinantes',
  'Bastidores do ensaio de hoje',
  'Relax de domingo',
  'Look do dia com sandália nova',
  'Conteúdo exclusivo da semana',
  'Pezinhos na areia',
]

function buildMedia(seed: string, count: number): Media[] {
  let s = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0)
  const rand = () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
  return Array.from({ length: count }, (_, i) => {
    const isVideo = rand() < 0.3
    const secs = 15 + Math.floor(rand() * 180)
    return {
      id: `${seed}-m${i}`,
      type: isVideo ? 'video' : 'photo',
      url: img(`${seed}-${i}`, 600, 600),
      caption: captions[Math.floor(rand() * captions.length)],
      paid: i > 1 && rand() < 0.65,
      createdAt: new Date(Date.now() - (i + 1) * 86400000 * (1 + rand() * 3)).toISOString(),
      duration: isVideo ? `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}` : undefined,
    } satisfies Media
  })
}

type Seed = Omit<Profile, 'id' | 'avatar' | 'cover' | 'media'> & { avatarN: number; mediaCount: number }

const seeds: Seed[] = [
  { name: 'Isabela Moura', handle: 'isa.moura', verified: true, featured: true, avatarN: 5, mediaCount: 16, priceBRL: 29.9,
    bio: 'Modelo de pés há 4 anos. Conteúdo semanal, pedidos personalizados e muito carinho com quem me acompanha. 💅', instagram: 'isa.moura', tiktok: 'isamoura' },
  { name: 'Camila Rocha', handle: 'camifeet', verified: true, featured: true, avatarN: 9, mediaCount: 12, priceBRL: 24.9,
    bio: 'Unhas sempre feitas, fotos em alta resolução e vídeos toda sexta.', instagram: 'camifeet' },
  { name: 'Larissa Duarte', handle: 'lari_soles', verified: true, featured: true, avatarN: 16, mediaCount: 20, priceBRL: 39.9,
    bio: 'Fotógrafa e modelo. Ensaios artísticos com foco em estética e iluminação natural.', instagram: 'larisoles', tiktok: 'lari_soles' },
  { name: 'Beatriz Lima', handle: 'bia.pezinhos', verified: false, featured: true, avatarN: 20, mediaCount: 9, priceBRL: 15,
    bio: 'Começando por aqui! Assine e acompanhe desde o início.', tiktok: 'biapezinhos' },
  { name: 'Juliana Prado', handle: 'ju.prado', verified: true, featured: true, avatarN: 23, mediaCount: 14, priceBRL: 49.9,
    bio: 'Bailarina. Pés fortes, delicados e cheios de história. Conteúdo premium.', instagram: 'juprado' },
  { name: 'Mariana Alves', handle: 'mari.alves', verified: true, avatarN: 25, mediaCount: 11, priceBRL: 19.9,
    bio: 'Praia, sol e pés na areia. Postagens diárias.', instagram: 'mari.alves', tiktok: 'marialves' },
  { name: 'Fernanda Costa', handle: 'fe_costa', verified: false, avatarN: 29, mediaCount: 8, priceBRL: 17.9,
    bio: 'Conteúdo leve, divertido e sempre com meias coloridas. 🧦' },
  { name: 'Rafaela Nunes', handle: 'rafa.nunes', verified: true, avatarN: 32, mediaCount: 18, priceBRL: 34.9,
    bio: 'Pés tamanho 35, arco alto. Pedidos personalizados via chat.', instagram: 'rafanunes' },
  { name: 'Gabriela Torres', handle: 'gabi.torres', verified: true, avatarN: 38, mediaCount: 10, priceBRL: 22.9,
    bio: 'Estudante de moda. Sandálias, saltos e muito estilo.', tiktok: 'gabitorres' },
  { name: 'Letícia Ramos', handle: 'leti.ramos', verified: false, avatarN: 41, mediaCount: 7, priceBRL: 15.9,
    bio: 'Novidades toda semana. Obrigada por estar aqui!' },
  { name: 'Amanda Ribeiro', handle: 'amanda.feet', verified: true, avatarN: 44, mediaCount: 15, priceBRL: 59.9,
    bio: 'Top 1% da plataforma. Vídeos longos, alta qualidade e respostas rápidas.', instagram: 'amandafeet', tiktok: 'amanda.feet' },
  { name: 'Natália Gomes', handle: 'nat.gomes', verified: true, avatarN: 45, mediaCount: 12, priceBRL: 27.9,
    bio: 'Spa day todo domingo. Hidratação, esfoliação e muito autocuidado.', instagram: 'natgomes' },
]

export const mockProfiles: Profile[] = seeds.map(({ avatarN, mediaCount, ...s }, i) => ({
  ...s,
  id: `p${i + 1}`,
  avatar: avatar(avatarN),
  cover: img(`cover-${s.handle}`, 1200, 400),
  media: buildMedia(s.handle, mediaCount),
}))
