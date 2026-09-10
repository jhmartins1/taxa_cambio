<div align="center">

# câmbio.

### Seu dinheiro, sem fronteiras.

Conversor de moedas com calculadora integrada, favoritos, histórico e cotações offline.
Feito com React Native e Expo para Android, iOS e web.

![React Native](https://img.shields.io/badge/React_Native-0.79-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-SDK_53-000020?style=for-the-badge&logo=expo&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

[Funcionalidades](#funcionalidades) · [Tecnologias](#tecnologias) · [Como executar](#como-executar) · [Testes](#testes)

</div>

## Sobre o projeto

O **câmbio.** facilita a conversão de valores para quem está planejando uma viagem, comparando preços ou acompanhando moedas estrangeiras. A proposta é reunir as ferramentas do dia a dia em uma interface simples: fazer a conta, converter, comparar e consultar depois.

O visual combina cartões arredondados, valores em destaque e quatro temas. As preferências, o histórico e as últimas cotações ficam salvos no próprio dispositivo.

## Funcionalidades

### Conversão de moedas

- Escolha as moedas de origem e destino e inverta o par com um toque.
- Digite valores com vírgula ou ponto decimal.
- Consulte a taxa usada e a data da cotação retornada pela API.
- Acompanhe os estados de carregamento e as mensagens de erro.

### Conversão simultânea

- Converta um valor para as outras **sete moedas** de uma só vez.
- Compare os resultados em uma lista, usando a mesma cotação de referência.
- Filtre a comparação para exibir apenas suas moedas favoritas.

### Favoritos

- Toque na estrela de uma moeda para adicionar ou remover dos favoritos.
- Acesse suas moedas por atalhos na tela inicial.
- Encontre as favoritas primeiro nos seletores.
- Mantenha suas escolhas salvas ao fechar e abrir o app.

### Cotações offline

- Uma consulta online salva as cotações das **oito moedas**.
- Ative **Usar cotação salva** para converter sem uma nova consulta à internet.
- Se a atualização falhar, o app tenta usar a última cotação salva automaticamente.
- Troque a moeda de origem mesmo offline: o app calcula os pares a partir dos dados armazenados.
- Veja quando os dados foram salvos e um aviso ao usar cotações que podem estar desatualizadas.

É necessário concluir uma consulta online antes do primeiro uso offline. Na versão web, a página precisa estar carregada para utilizar as cotações locais.

### Calculadora integrada

Faça a conta diretamente no campo de valor ou abra o teclado da calculadora:

```text
35 + 18 + 12      → 65
(100 + 50) × 2    → 300
200 ÷ 4          → 50
100,50 − 20      → 80,50
```

A calculadora suporta soma, subtração, multiplicação, divisão e parênteses, respeitando a ordem das operações. O total aparece antes da conversão. Contas incompletas, divisão por zero e totais negativos são tratados com mensagens na interface.

### Histórico

- Consulte as últimas **50 conversões** salvas no dispositivo.
- Veja o valor digitado, o total calculado, as moedas, os resultados e a cotação usada naquele momento.
- Consulte também conversões offline e os resultados da conversão simultânea.
- Toque em **Usar novamente** para preencher o conversor e fazer um novo cálculo.
- Exclua registros ou limpe a lista, com opção de desfazer enquanto a tela estiver aberta.

### Aparência

Escolha entre **Grafite**, **Areia**, **Oceano** e **Floresta**. Cada tema tem uma prévia visual, e a preferência fica salva automaticamente.

## Moedas disponíveis

| Código | Moeda |
| --- | --- |
| USD | Dólar americano |
| BRL | Real brasileiro |
| EUR | Euro |
| GBP | Libra esterlina |
| JPY | Iene japonês |
| CAD | Dólar canadense |
| AUD | Dólar australiano |
| CHF | Franco suíço |

## Tecnologias

| Tecnologia | Uso no projeto |
| --- | --- |
| **React Native 0.79** | Interface e componentes do aplicativo |
| **React 19** | Componentes, hooks e gerenciamento de estado |
| **Expo SDK 53** | Ambiente de desenvolvimento e geração de bundles |
| **JavaScript** | Lógica da aplicação |
| **React Native Web** | Execução da interface no navegador |
| **AsyncStorage** | Persistência de temas, favoritos, histórico e cotações |
| **Context API** | Compartilhamento do tema entre os componentes |
| **Expo Vector Icons / Feather** | Ícones da interface |
| **ExchangeRate-API** | Consulta das taxas de câmbio |
| **Node.js Test Runner** | Testes automatizados com `node:test` e `node:assert` |

A calculadora usa um interpretador de expressões aritméticas, sem `eval`. As operações de escrita do histórico são organizadas em sequência para preservar os registros durante ações simultâneas.

## Como executar

### Pré-requisitos

- Node.js e npm — o desenvolvimento e os testes foram executados com **Node.js 22**.
- Git.
- Para Android: ambiente Android configurado, com emulador ou dispositivo conectado.
- Para iOS: macOS, Xcode e simulador ou dispositivo configurado.

### Instalação

```bash
git clone https://github.com/jhmartins1/taxa_cambio.git
cd taxa_cambio
npm ci
```

### Navegador

```bash
npm run web
```

Abra o endereço local exibido pelo Expo no terminal.

### Android

```bash
npm run android
```

### iOS

```bash
npm run ios
```

Os comandos nativos compilam o aplicativo para o ambiente selecionado. Para iniciar o servidor de desenvolvimento e conectar uma build de desenvolvimento já instalada:

```bash
npm start
```

A implementação atual consulta a API sem chave configurada no projeto. Não é necessário criar um arquivo `.env` para executar o conversor.

## Testes

```bash
npm test
```

Os testes cobrem cálculos e arredondamento, expressões aritméticas, validação de entradas, favoritos, conversão simultânea, persistência e recuperação offline, histórico e falhas de armazenamento ou conexão.

Para gerar os bundles das plataformas:

```bash
npx expo export --platform all
```

Os arquivos são gerados em `dist/`. Esse comando exporta os bundles; a compilação dos aplicativos nativos é feita pelos comandos específicos de cada plataforma.

## Estrutura do projeto

```text
taxa_cambio/
├── App.js                 # Entrada da interface e navegação de aparência
├── app.json               # Configuração do Expo
├── assets/                # Ícones e imagens do aplicativo
├── src/
│   ├── components/        # Conversor, seletores, calculadora e histórico
│   ├── constants/         # Lista de moedas disponíveis
│   ├── contexts/          # Contexto de temas
│   ├── hooks/             # Persistência e estado de favoritos e histórico
│   ├── services/          # API, cache de cotações e armazenamento do histórico
│   ├── styles/            # Paletas de cores
│   └── utils/             # Cálculos, expressões e ordenação de favoritos
└── tests/                 # Testes automatizados
```

## Sobre as cotações e os dados

As taxas são consultadas na ExchangeRate-API usando o dólar como referência. O app calcula os demais pares a partir desse conjunto de dados, mantendo a comparação e as conversões offline consistentes.

Os valores são referenciais e não incluem tarifas ou impostos. Favoritos, histórico e preferências são locais: não há sincronização entre dispositivos. Limpar os dados do aplicativo ou do site pode remover essas informações.

## Contribuindo

Encontrou um problema ou pensou em uma melhoria? Abra uma [issue](https://github.com/jhmartins1/taxa_cambio/issues) descrevendo a sugestão ou os passos para reproduzir o erro. Pull requests também são bem-vindos.

Antes de enviar uma alteração, execute os testes e confira o comportamento da interface.

---

<div align="center">

### Curtiu o projeto? Deixe seu like em forma de ⭐!

Adicione uma estrela ao repositório e compartilhe com quem também pode aproveitar o app.

**Made by [0xJHM](https://www.instagram.com/jh.martins1/)**

[Instagram](https://www.instagram.com/jh.martins1/) · [GitHub](https://github.com/jhmartins1)

</div>
