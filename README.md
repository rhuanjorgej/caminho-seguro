# Caminho Seguro

Protótipo de aplicativo web para apoiar a Dona Marta (74 anos, Alzheimer em estágio inicial) nas caminhadas até a padaria, e dar tranquilidade para a família. Funciona no navegador (Chrome e Safari), em tablet e celulares, por um link público.

**Importante:** é uma demonstração. A Dona Marta, a família, o bairro e a padaria são fictícios. A localização é simulada, sem GPS e sem rastreamento real. Isso aparece escrito na tela, em todas as páginas.

## O que o aplicativo faz

**Tablet da Dona Marta**
- Quatro botões grandes: Ir à padaria, Onde estou?, Preciso de ajuda e Minha família.
- Comandos por voz ("ir à padaria", "onde estou", "preciso de ajuda", "minha família") e o tablet também fala as instruções.
- Mostra data e hora na tela, para ajudar na orientação.
- Quando ela aperta Preciso de ajuda, todos os celulares conectados recebem aviso na tela, som de sirene e vibração.
- Quando um familiar confirma, o tablet mostra: **"Sua família foi avisada. Aguarde, alguém está vindo ajudar."**

**Painel da família (celular)**
- Entra com o código da demonstração, escolhe nome e parentesco.
- Vê a localização simulada em um mapa, o estado da Dona Marta e quem está conectado.
- Recebe alertas em tela cheia, com som, e confirma o atendimento com um toque.
- Histórico de todos os alertas, com horário e quem atendeu.

**Modo demonstração**
- Criar, reiniciar e conectar aparelhos por código (ou QR code).
- "Simular saída do caminho" (a Dona Marta se afasta da rota e a família é avisada).
- Campo para simular comando de voz por texto, caso o microfone da sala não funcione.

## Como a sincronização funciona (e por que Firebase)

Usei o **Firebase Realtime Database**. Ele guarda um pequeno "quadro compartilhado" para cada código de demonstração. Quando um aparelho escreve nesse quadro (por exemplo, um pedido de ajuda), todos os outros aparelhos com o mesmo código veem a mudança na hora. Escolhi o Firebase porque precisa de poucos passos, não exige criar tabelas e o plano gratuito sobra para uma apresentação.

Sem o Firebase configurado, o app entra em **modo local**: sincroniza só entre abas do mesmo navegador. Serve para testar no seu computador, mas não para tablet e celulares diferentes.

## Passo 1: configurar o Firebase (uns 10 minutos)

1. Entre em https://console.firebase.google.com com sua conta Google e clique em **Criar um projeto**. Dê um nome (ex.: caminho-seguro). Pode desativar o Google Analytics.
2. No menu da esquerda, abra **Criação** (Build) e clique em **Realtime Database**. Clique em **Criar banco de dados**, escolha o local (qualquer um serve) e marque **Iniciar no modo bloqueado**.
3. Abra a aba **Regras**, apague o que estiver lá, cole o conteúdo do arquivo `database.rules.json` deste projeto e clique em **Publicar**.
   - Essas regras liberam leitura e escrita só dentro de `sessoes/CÓDIGO`, e só para códigos de 6 letras ou números. Ninguém consegue listar todas as sessões. Como a demonstração usa só dados fictícios, não há login.
4. Clique na engrenagem (**Configurações do projeto**) > aba **Geral** > role até **Seus aplicativos** > ícone **Web** (`</>`). Dê um apelido e registre (não precisa marcar o Hosting).
5. Vai aparecer um trecho chamado `firebaseConfig`. Você vai precisar de cinco valores: `apiKey`, `authDomain`, `databaseURL`, `projectId` e `appId`.
   - Se o `databaseURL` não aparecer, copie o endereço que fica no topo da página do Realtime Database (começa com `https://` e termina com `firebaseio.com` ou `firebasedatabase.app`).

## Passo 2: testar no seu computador

Precisa do Node.js instalado (versão 18 ou mais nova).

```bash
npm install
cp .env.example .env     # depois abra o arquivo .env e cole os 5 valores do Firebase
npm run dev
```

Abra o endereço mostrado (normalmente http://localhost:5173). Se o Firebase estiver certo, a etiqueta no canto da tela mostra **Conectado** (e não "Modo local").

## Passo 3: publicar na Vercel e ter o link público

**Jeito mais fácil (pelo GitHub):**
1. Crie um repositório no GitHub e envie esta pasta (o arquivo `.gitignore` já impede o envio do `.env` e do `node_modules`).
2. Em https://vercel.com, entre com o GitHub e clique em **Add New > Project**. Escolha o repositório.
3. A Vercel reconhece o Vite sozinha (comando `npm run build`, pasta de saída `dist`). Não mude nada.
4. Abra **Environment Variables** e cadastre as cinco variáveis, com os mesmos nomes do `.env.example`:
   `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_DATABASE_URL`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`.
5. Clique em **Deploy**. Ao terminar, a Vercel mostra o link público (algo como `https://caminho-seguro.vercel.app`). Esse é o link que você abre no tablet e nos celulares.

Se você mudar uma variável depois, é preciso fazer um novo deploy (aba **Deployments** > **Redeploy**), porque os valores são gravados na hora de montar o site.

**Jeito alternativo (sem GitHub):** `npm i -g vercel`, depois `vercel` dentro da pasta, cadastre as variáveis com `vercel env add NOME` e publique com `vercel --prod`.

## Passo 4: roteiro de apresentação

1. **Tablet:** abra o link e toque em **Iniciar demonstração**. Aparecem o código e o QR code.
2. **Celulares:** aponte a câmera para o QR code (ou toque em **Painel da família** e digite o código). Escolha um nome de exemplo (Helena, Carlos ou Beatriz) e toque em **Entrar no painel**. Esse toque libera o som dos alertas.
3. **Tablet:** toque em **Começar** e depois em **Ir à padaria**. A caminhada simulada dura cerca de 1 minuto, e os celulares mostram a posição se movendo.
4. **Saída do caminho (opcional):** no tablet, abra **Apresentação** > **Simular saída do caminho** (ou use a aba **Demo** no celular). Os celulares recebem um alerta amarelo.
5. **Pedido de ajuda:** no tablet, toque em **Preciso de ajuda**. Todos os celulares ficam vermelhos, tocam a sirene e vibram. Em um celular, toque em **Confirmar atendimento**. O tablet passa a mostrar a mensagem de confirmação.
6. Toque em **Encerrar ocorrência** no celular para liberar o tablet. Veja a aba **Histórico**.
7. Para repetir tudo: aba **Demo** > **Reiniciar demonstração** (ou **Apresentação** no tablet).

## Dicas e problemas comuns

- **Sem som no celular:** o navegador só deixa tocar som depois de um toque na tela. Toque em **Entrar no painel** (ou na faixa amarela "Som desligado") e use **Testar o som deste celular**. Confira também o volume.
- **Voz não funciona:** o reconhecimento de voz funciona melhor no Chrome (Android e computador) e precisa de internet e permissão do microfone. No Safari pode não funcionar. Use o campo "Simular comando de voz" no painel da apresentação.
- **Tela do celular apagando:** o app tenta manter a tela acesa, mas em alguns aparelhos isso não é permitido. Mantenha as telas ligadas durante a demonstração.
- **Fica em "Conectando...":** confira a internet e se as cinco variáveis do Firebase estão corretas (e se o banco foi criado como Realtime Database).
- **Código não encontrado:** confira o código no tablet. Se você está no modo local, o painel só enxerga demonstrações abertas no mesmo navegador.

## Limites desta versão

- Os alertas chegam com o aplicativo aberto no celular. Com a tela bloqueada ou o navegador fechado, o aviso não chega (isso exigiria notificações push, que ficam como próximo passo).
- Sem login: qualquer pessoa com o código entra na demonstração. Por isso, só use dados fictícios.
- Em um produto real, seriam necessários GPS com consentimento, login, proteção de dados de saúde (LGPD) e validação com a pessoa idosa, a família e profissionais de saúde.

## Estrutura do projeto

```
src/
  App.jsx                    escolhe a tela (início, tablet ou família)
  config/simulacao.js        bairro fictício, rota, caminhada e textos de localização
  services/sync/             Firebase e modo local (mesma interface)
  services/alarme.js         som de alerta gerado no navegador
  services/voz.js            fala e comandos por voz
  hooks/                     sessão em tempo real e utilitários
  components/                botões, modal, mapa e outras peças reutilizáveis
  pages/tablet/              telas da Dona Marta
  pages/familia/             painel dos familiares
  styles/index.css           visual, cores e tamanhos
database.rules.json          regras do Firebase para colar no console
.env.example                 modelo das variáveis do Firebase
```
