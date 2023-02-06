# UpdateCheckerNotifier

É um projeto que busca novas atualizações do aplicativo a partir do repositório do GitHub e notifica o usuário sobre essas atualizações. O objetivo é manter o usuário informado sobre as versões mais recentes de seu software e possibilitar a atualização de maneira simples e rápida.

# Funcionalidades
Verifica a versão mais recente do aplicativo no repositório do Github.
Exibi uma notificação para o usuário quando uma nova atualização estiver disponível.
Gerenciamento de eventos para personalização da verificação de atualizações e exibição de notificações.
Possibilidade de escolher o idioma usado para as mensagens de log e notificações.

# Configuração de idioma
Você pode escolher o idioma que será utilizado usado para as mensagens de log e notificações adicionando a seguinte opção à chamada do método updateNotification:

```javascript
import { updateCheckerNotifier, Language } from 'electron-update-checker-notifier';

updateCheckerNotifier.language = Language.PT_BR;

updateCheckerNotifier.updateNotification();
```
```javascript
import { UpdateCheckerNotifier, Language } from 'electron-update-checker-notifier';

const notifier = new UpdateCheckerNotifier();

notifier.updateNotification({
  language: Language.PT_BR,
});
```

Os idiomas atualmente suportados são:

* en-US (Inglês - Estados Unidos)
* pt-BR (Português - Brasil)


# Instalação

```bash
npm install electron-update-checker-notifier
```
# Uso

Para usar UpdateCheckerNotifier, você precisa importá-lo e criar uma instância. Em seguida, você pode chamar o método updateNotification() para verificar se há atualizações disponíveis para o seu aplicativo.


```javascript
import { UpdateCheckerNotifier } from 'electron-update-checker-notifier';

const notifier = new UpdateCheckerNotifier();
notifier.updateNotification();
```

# Opções
Você pode passar opções para o método updateNotification() para personalizar o comportamento.

**repository** (opcional): O repositório do seu aplicativo no GitHub. Se não for especificado, ele usará o repositório definido no arquivo package.json do seu aplicativo.

**token** (opcional): O token de acesso à API do GitHub.

**debug** (opcional, padrão: false): Permite verificar atualizações durante o desenvolvimento.

**disableDialogsEventsOnly** (opcional, padrão: false): Notifica quando houver novas versões disponíveis, caso contrário, permanece silencioso.

**language** (opcional, padrão: Language.EN): O idioma usado para as mensagens de log e notificações.

**logger** (opcional): O registrador. Você pode passar um registrador como electron-log, winston ou outro com as seguintes interfaces: { info(), warn(), error() }. 
Defina como null se você desejar desativar o recurso de log.

# Eventos
UpdateCheckerNotifier emite vários eventos que você pode ouvir para obter informações sobre o processo de atualização.

**checking-for-update**: Emitido quando o processo de verificação de atualização começa.

**update-available**: Emitido quando há uma nova versão disponível para download.

**update-not-available**: Emitido quando não há novas atualizações disponíveis.

**this-is-last-update**: Emitido quando quando a verificação de atualização determina que a versão atual do seu aplicativo é a última versão disponível.

**error**: Emitido quando ocorre um erro durante o processo de verificação de atualização.

Você pode ouvir esses eventos da seguinte maneira:

```javascript
notifier.on('checking-for-update', () => {
  console.log('Verificando por atualizações...');
});

notifier.on('update-available', (info: UpdateInfo) => {
  console.log(`Uma nova versão (${info.version}) está disponível para download!`);
});

notifier.on('update-not-available', (info: UpdateInfo) => {
  console.log('Não há novas atualizações disponíveis.');
});

notifier.on('this-is-last-update', (info: UpdateInfo) => {
  console.log('Esta é a última atualização disponível: ', info);
});

notifier.on('error', (error: Error) => {
  console.error(`Ocorreu um erro: ${error}`);
});
```
O objeto **UpdateInfo** é passado como um argumento para o manipulador de eventos e contém informações sobre a versão atual e a última versão disponível do seu aplicativo.

# Exemplo
Aqui está um exemplo completo de como usar UpdateCheckerNotifier em um aplicativo Electron:

```javascript
import { updateCheckerNotifier, Language } from 'electron-update-checker-notifier';

updateCheckerNotifier.repository = 'user/repo'
updateCheckerNotifier.token = 'my-github-token'
updateCheckerNotifier.debug = true
updateCheckerNotifier.disableDialogsEventsOnly = false
updateCheckerNotifier.language = Language.PT_BR
updateCheckerNotifier.logger = log

updateCheckerNotifier.updateNotification();
```

```javascript
import { UpdateCheckerNotifier, Language } from 'electron-update-checker-notifier';

const notifier = new UpdateCheckerNotifier();

notifier.updateNotification({
  repository: 'user/repo',
  token: 'my-github-token',
  debug: true,
  disableDialogsEventsOnly: false,
  language: Language.PT_BR,
  logger: log,
});

notifier.on('update-available', (info: UpdateInfo) => {
  console.log(`Uma nova versão (${info.version}) está disponível para download!`);
});

notifier.on('error', (error: Error) => {
  console.error(`Ocorreu um erro: ${error}`);
});
```

# Contribuição
Se você deseja contribuir para este projeto, siga as seguintes etapas:

1. Faça um fork do repositório
2. Crie sua branch
3. Commit suas alterações
4. Push na branch
5. Crie um pull request

# Reconhecimentos
Gostaría de agradecer aos seguintes desenvolvedores pelo trabalho realizado no projeto [electron-update-notifier](https://github.com/ankurk91/electron-update-notifier):

* [ankurk91](https://github.com/ankurk91)
* [pd4d10](https://github.com/pd4d10)

Obrigado por sua dedicação e contribuição com a comunidade.

# Licença
Este projeto está licenciado sob a licença MIT. Veja o arquivo [LICENSE](https://github.com/FabioLucenaRibas/electron-update-checker-notifier/blob/main/LICENSE) para mais detalhes.
