import { useDeferredValue, useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import styled from 'styled-components'
import { FeaturedCarousel } from '../components/FeaturedCarousel'
import { ProfileCard } from '../components/ProfileCard'
import { Container, IconButton, Muted, SectionTitle, Stack } from '../components/ui'
import { useApp } from '../store/AppContext'
import { mq } from '../styles/theme'

const SearchBox = styled.div`
  position: relative;
  > svg { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: ${({ theme }) => theme.colors.gray}; pointer-events: none; }
  input {
    width: 100%;
    height: 52px;
    padding: 0 52px 0 48px;
    border-radius: ${({ theme }) => theme.radius.pill};
    border: 1.5px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.white};
    font-size: 16px;
    transition: border-color .18s ease, box-shadow .18s ease;
    &::placeholder { color: ${({ theme }) => theme.colors.gray}; }
    &:focus { outline: none; border-color: ${({ theme }) => theme.colors.primary}; box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primarySoft}; }
    &::-webkit-search-cancel-button { display: none; }
  }
  button { position: absolute; right: 4px; top: 4px; }
`

const Grid = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr;
  ${mq.sm} { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
  ${mq.lg} { grid-template-columns: repeat(3, minmax(0, 1fr)); }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 16px;
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  svg { color: ${({ theme }) => theme.colors.gray}; margin-bottom: 8px; }
  strong { display: block; margin-bottom: 4px; }
`

export default function Home() {
  const { profiles, user } = useApp()
  const [query, setQuery] = useState('')
  const deferred = useDeferredValue(query)
  const q = deferred.trim().toLowerCase().replace(/^@/, '')

  const others = useMemo(() => profiles.filter(p => p.id !== user?.id), [profiles, user?.id])
  const featured = useMemo(() => others.filter(p => p.featured), [others])
  const results = useMemo(
    () => (q ? others.filter(p => p.name.toLowerCase().includes(q) || p.handle.includes(q)) : others),
    [others, q],
  )
  const searching = query.trim().length > 0

  return (
    <Container>
      <Stack $gap={24}>
        <SearchBox role="search">
          <Search size={20} aria-hidden />
          <label htmlFor="search" className="sr-only">Buscar perfis</label>
          <input
            id="search"
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar perfis por nome ou @perfil"
            autoComplete="off"
            enterKeyHint="search"
          />
          {query && (
            <IconButton onClick={() => setQuery('')} aria-label="Limpar busca">
              <X size={18} />
            </IconButton>
          )}
        </SearchBox>

        {!searching && featured.length > 0 && <FeaturedCarousel profiles={featured} />}

        <section aria-label={searching ? 'Resultados da busca' : 'Perfis'}>
          <SectionTitle style={{ marginBottom: 12 }}>
            {searching ? `Resultados para “${query.trim()}”` : 'Perfis'}
          </SectionTitle>
          <p className="sr-only" aria-live="polite">{results.length} perfis encontrados</p>
          {results.length === 0 ? (
            <EmptyState>
              <Search size={32} aria-hidden />
              <strong>Nenhum perfil encontrado</strong>
              <Muted>Tente buscar por outro nome ou @perfil.</Muted>
            </EmptyState>
          ) : (
            <Grid>
              {results.map(p => (
                <li key={p.id}><ProfileCard profile={p} /></li>
              ))}
            </Grid>
          )}
        </section>
      </Stack>
    </Container>
  )
}
