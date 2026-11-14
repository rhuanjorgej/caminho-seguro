# Caminho Seguro

Protótipo de aplicativo web para apoiar a Dona Marta (74 anos, Alzheimer em estágio inicial) nas caminhadas até a padaria, e dar tranquilidade para a família. Funciona no navegador (Chrome e Safari), em tablet e celulares, por um link público.

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
