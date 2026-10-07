import { useRef } from 'react'
import { ChevronLeft, ChevronRight, Image, Video } from 'lucide-react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { mq } from '../styles/theme'
import type { Profile } from '../types'
import { Avatar } from './Avatar'
import { VerifiedBadge } from './icons'
import { IconButton, Row, SectionTitle } from './ui'

const Track = styled.ul`
  list-style: none;
  margin: 0 -16px;
  padding: 4px 16px 8px;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 78%;
  gap: 12px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding: 0 16px;
  scroll-behavior: smooth;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
  ${mq.sm} { grid-auto-columns: 46%; }
  ${mq.md} { margin: 0; padding: 4px 0 8px; scroll-padding: 0; grid-auto-columns: calc((100% - 24px) / 3); }
  li { scroll-snap-align: start; }
`

const Slide = styled(Link)`
  position: relative;
  display: block;
  aspect-ratio: 4 / 5;
  border-radius: ${({ theme }) => theme.radius.lg};
  overflow: hidden;
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.dark};
  > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
  &:hover > img { transform: scale(1.04); }
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,.78) 100%);
  }
`

const Info = styled.div`
  position: absolute;
  z-index: 1;
  left: 14px;
  right: 14px;
  bottom: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  strong { display: flex; align-items: center; gap: 4px; font-size: 16px; }
  small { display: flex; gap: 10px; font-size: 13px; opacity: 0.92; margin-top: 2px; }
  small span { display: inline-flex; align-items: center; gap: 4px; }
`

const Controls = styled.div`
  display: none;
  ${mq.md} { display: flex; gap: 4px; }
  button { border: 1px solid ${({ theme }) => theme.colors.border}; background: ${({ theme }) => theme.colors.white}; }
`

export function FeaturedCarousel({ profiles }: { profiles: Profile[] }) {
  const ref = useRef<HTMLUListElement>(null)
  const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.9 })

  return (
    <section aria-roledescription="carrossel" aria-label="Perfis em destaque">
      <Row $between style={{ marginBottom: 12 }}>
        <SectionTitle>Em destaque</SectionTitle>
        <Controls>
          <IconButton onClick={() => scroll(-1)} aria-label="Destaques anteriores"><ChevronLeft size={20} /></IconButton>
          <IconButton onClick={() => scroll(1)} aria-label="Próximos destaques"><ChevronRight size={20} /></IconButton>
        </Controls>
      </Row>
      <Track ref={ref}>
        {profiles.map((p, i) => {
          const photos = p.media.filter(m => m.type === 'photo').length
          const videos = p.media.length - photos
          return (
            <li key={p.id} aria-roledescription="slide" aria-label={`${i + 1} de ${profiles.length}`}>
              <Slide to={`/perfil/${p.handle}`}>
                <img src={p.media[0]?.url ?? p.cover} alt="" loading="lazy" />
                <Info>
                  <Avatar name={p.name} src={p.avatar} size={44} />
                  <div>
                    <strong>
                      {p.name} {p.verified && <VerifiedBadge size={16} />}
                    </strong>
                    <small>
                      <span><Image size={14} aria-hidden /> {photos}</span>
                      <span><Video size={14} aria-hidden /> {videos}</span>
                    </small>
                  </div>
                </Info>
              </Slide>
            </li>
          )
        })}
      </Track>
    </section>
  )
}
