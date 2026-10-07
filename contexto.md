TECNOLOGIAS:
==========
- React
- Vite
- Typescrypt
- Styled Components

NOME: 
=====
My Foot

IDEIA CENTRAL:
==============
My Foot será um makteplace de compra e venda de mídias pés, semelhante ao
privacy e OnlyFans, porém focado no nicho da podolatria, fornecendo mais 
benefícios e facilidade para os produtores desse tipo de conteúdo poderem 
monetizar seus conteúdos. A compra e venda de conteúdo será dara em uma moeda utilizada no sistema, FootCoin(ft), em que R$ 1.00 equivale a 30ft

NECESSIDADES:
=============
[1] Cadastro simplificado: Nome, email, perfil e senha
[2] Login email/perfil e senha
[3] Header com título do sistema, a esquerda, e foto de perfil, ícone notificações a direita
[4] Barra de busca onde o usuário poderá buscar por perfis de outros usuários
onde, conforme vai digitando, os perfis vão sendo exibidos na listagem abaixo
[5] Carrosel de Perfis em destaque, deve somente sumir somente se o usuário
digitar na barra de busca
[6] Listagem de perfis
[7] Tela de detalhe do perfil em que serão exibidos: 
    - Foto Perfil
    - Atrás da foto de perfil a foto de capa
    - Nome do Usuário
    - Nome de perfil do usuário
    - Flag perfil verificado
    - Contadores: (N° de fotos, N° de vídeos, N° mídia privada)
    - Botão para assinar conteúdo
    - Descrição do perfil
    - Ícones de mídias sociais do perfil (Instagram, TikTok)
    - Mídias do perfil em que poderão ser escolhidos os tipos de mídia (TODOS, FOTOS, VÍDEOS), serão exibidas 4 mídias por linha onde, quando a mídia for paga deve ser exibida desfocada
[8] Quando o usuário clicar para assinar conteúdo de um perfil exibir um modal
com: Foto perfil, foto de capa do perfil, nome de perfil, valor da assinatura, botão de confirmação da assinatura. Clicando em confirmar assinatura deve-se fechar o modal de contratação e abrir outro modal de sucesso, com aproximadamente 5s de exibição informando sucesso da contratação
[9] Quando o usuário logado clicar no ícone do perfil no headbar então deve ser encaminhado para tela perfil do usuário logado, em que essa tela conterá:
  - Foto, com as siglas iniciais do nome do usuário (Ex.: Rafael será RA)
  - Saldo em carteira (em foot coins - ft)
  - Ação Torne-se um criador
  - Carteira
  - Ação para listar assinaturas
  - Ação para alterar dados do perfil
[10] Quando clicar em "listar assinaturas" deve-se exebir uma tela que será listadas as assinturas do usuário, cada linha conterá: foto do perfil, id do perfil na plataforma, data de expiração da assinatura. Quando clicar em qualquer assintaura então o usuário será encaminhado para o perfil que realizou a assinatura
[11] Quando clicar na ação "alterar dados do perfil" então será encaminhado para uma tela que poderão ser alterados Nome e Nome de Perfil, os restantes dos dados aparecem como readonly
[12] Quando o usuário clicar em carteira deverá encaminhar para uma tela com: Saldo em carteira, ação para "recarregar" e uma listagem com as últimas transações efetuadas em cada trasanação terá um tipo (Ex: assinatura de @perfil_abc), data/horário e valor da transação
[13] Quando o usuário clicar em "recarregar" deve-se exibir uma tela onde usuário informa, em R$, quanto será adicionado em sua carteira(R$15.00 - R$150.00) e abaixo serão exibidos saldo atual da conta(em ft) e o saldo, em foot coins, contando o valor escolhido pelo usuário. Abaixo deve-se ter um botão continuar, onde, quando for clicado, abre-se um modal com o valor, em R$, a ser adicionado na carteira e um QRCode (PIX) para pagamento
[14] Quando o usuário clicar em "Torne-se um criador", deve-se aparecer, divido em etapas
    [1] Formulário solicitando: País, CPF, Nome, Data de Nascimento
    [2] Formulário solicitando: Foto de perfil, Nome do Perfil, Perfil Identificador na Plataforma
    [3] Formulário solicitando: Foto de Capa, Descrição do Perfil
    [4] Formulário solicitando: Perfil Instagram, Perfil TikTok 
    [5] Formulário solicitando: Valor a ser cobrado na assinatura (R$ 15.00 - R$150.00)
    [6] Formulário solicitando: Foto RG (Frente e Verso), Foto segurando o RG
Cada etapa terá um botão "Próximo" no final, com execão da última da última etapa que, uma vez que o usuário submeteu Foto do RG e Foto segurando RG, deverá aparecer um botão "Encaminhar para validação", quando clicado aparecerá um aviso, por 10s, informando que o perfil está em validação 
[15] Para o caso do usuário que fez toda a jornada de "Torne-se um criador" e teve o perfil verificado, o sistema irá se comportar de forma diferente, com alugmas funcionalidaes a mais, são estas descritas abaixo:
  [1] Uma botão em destaque no header chamado "POSTAR"
  [2] Quando clicar no ícone de usuário no headbar vai para tela de perfil com as novas ações: Ver perfil, Controle. Quando clica na ação "Ver Perfil" o usuário tem a visão do seu perfil como se fosse um usuário que estivesse vendo para comprar conteúdos, onde, como diferencial, haverá uma ação para fazer um post de conteúdo. Quando clicar em controle, vai para uma aba de dashboard, onde serão exibidos gráfico faturamento (em ft) pelos meses, assinantes e valor a recevber
  [3] Quando a ação "Postar" for acionada seja no headber ou quando estiver fazendo a visualização do perfil então, deve-se se encaminhar para o fluxo de postagem, que funcionará da seguinte forma: Uma tela solicitando a mídia a ser postada, uma caixa de texto com a legenda da mídia, um switch para informar se a ídia será paga ou não e um botão para postar
  [4] No dados do perfil, quando clicar em "Carteira", além da ação "Recarregar" aparece a ação "Resgatar"
  [5] No dados do perfil, quando clicar em "alterar dados do perfil", Podem ser alterados nome, nome de perfil identificador na platorma, descrção do perfil, foto de capa e foto de perfil, os dados restantes aparecerão como read only

IMPORTANTE!!
- Tem quer ser responsivo para funcionar no mobile
- Respeitar cores do site conforme @paletas.md  
- utilize as skills  brand, design, ui-ux-pro-max