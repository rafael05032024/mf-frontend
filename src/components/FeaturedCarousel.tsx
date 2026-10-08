import { useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { mq } from '../styles/theme'
import type { ProfileSummary } from '../api'
import { Avatar } from './Avatar'
import { VerifiedBadge } from './icons'
import { IconButton, SectionTitle } from './ui'

// equivalente ao `ease-in-out` do CSS: cubic-bezier(0.42, 0, 0.58, 1)
function easeInOut(x: number) {
  const bez = (a: number, b: number, u: number) => 3 * a * u * (1 - u) ** 2 + 3 * b * u ** 2 * (1 - u) + u ** 3
  let lo = 0
  let hi = 1
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2
    if (bez(0.42, 0.58, mid) < x) lo = mid
    else hi = mid
  }
  return bez(0, 1, (lo + hi) / 2)
}

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
`

const Wrap = styled.div`
  position: relative;
`

const NavButton = styled(IconButton)<{ $side: 'left' | 'right' }>`
  display: none;
  ${mq.md} {
    display: inline-flex;
    position: absolute;
    z-index: 2;
    top: 50%;
    ${({ $side }) => ($side === 'left' ? 'left: 8px;' : 'right: 8px;')}
    transform: translateY(-50%);
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.white};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
  }
`

export function FeaturedCarousel({ profiles }: { profiles: ProfileSummary[] }) {
  const ref = useRef<HTMLUListElement>(null)
  const raf = useRef(0)

  const animateTo = (target: number) => {
    const el = ref.current
    if (!el) return
    cancelAnimationFrame(raf.current)
    const from = el.scrollLeft
    const dist = target - from
    const duration = Math.min(2800, Math.max(1800, Math.abs(dist) * 2.2))
    const start = performance.now()
    // snap e smooth nativos brigam com a animação manual
    el.style.scrollSnapType = 'none'
    el.style.scrollBehavior = 'auto'
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const ease = easeInOut(t)
      el.scrollLeft = from + dist * ease
      if (t < 1) raf.current = requestAnimationFrame(step)
      else {
        el.style.scrollSnapType = ''
        el.style.scrollBehavior = ''
      }
    }
    raf.current = requestAnimationFrame(step)
  }

  const scroll = (dir: 1 | -1) => {
    const el = ref.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    const atEnd = el.scrollLeft >= max - 4
    const atStart = el.scrollLeft <= 4
    if (dir === 1 && atEnd) animateTo(0)
    else if (dir === -1 && atStart) animateTo(max)
    else animateTo(Math.min(max, Math.max(0, el.scrollLeft + dir * el.clientWidth * 0.9)))
  }

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  return (
    <section aria-roledescription="carrossel" aria-label="Perfis em destaque">
      <SectionTitle style={{ marginBottom: 12 }}>Em destaque</SectionTitle>
      <Wrap>
        <NavButton $side="left" onClick={() => scroll(-1)} aria-label="Destaques anteriores"><ChevronLeft size={20} /></NavButton>
        <NavButton $side="right" onClick={() => scroll(1)} aria-label="Próximos destaques"><ChevronRight size={20} /></NavButton>
      <Track ref={ref}>
        {profiles.map((p, i) => (
          <li key={p.handle} aria-roledescription="slide" aria-label={`${i + 1} de ${profiles.length}`}>
            <Slide to={`/perfil/${p.handle}`}>
              {(p.cover ?? p.avatar) && <img src={p.cover ?? p.avatar} alt="" loading="lazy" />}
              <Info>
                <Avatar name={p.handle} src={p.avatar} size={44} />
                <div>
                  <strong>
                    @{p.handle} {p.verified && <VerifiedBadge size={16} />}
                  </strong>
                </div>
              </Info>
            </Slide>
          </li>
        ))}
      </Track>
      </Wrap>
    </section>
  )
}
