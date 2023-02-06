# UpdateCheckerNotifier

É uma biblioteca em Typescript que permite verificar atualizações para aplicativos Electron.

# Instalação

Você pode instalar UpdateCheckerNotifier com npm:

```bash
    npm install electron-update-checker-notifier
```
ou com yarn:


```bash
    yarn add electron-update-checker-notifier
```

# Uso

Para usar UpdateCheckerNotifier, você precisa importá-lo e criar uma instância. Em seguida, você pode chamar o método updateNotification() para verificar se há atualizações disponíveis para o seu aplicativo.


```javascript
import { UpdateCheckerNotifier } from 'electron-update-checker-notifier';

const notifier = new UpdateCheckerNotifier();
notifier.updateNotification();
```

# Opções
Você pode passar opções para o método updateNotification() para personalizar a comportamento de atualização.

**repository** (opcional): O repositório do seu aplicativo no GitHub. Se não for especificado, ele usará o repositório definido no arquivo package.json do seu aplicativo.

**token** (opcional): O token de acesso à API do GitHub.

**debug** (opcional, padrão: false): Permite verificar atualizações durante o desenvolvimento.

**disableDialogsEventsOnly** (opcional, padrão: false): Notifica quando houver novas versões disponíveis, caso contrário, permanece silencioso.

**language** (opcional, padrão: Language.EN): O idioma usado para as mensagens de log e notificações.

**logger** (opcional): O registrador. Você pode passar um registrador como electron-log, winston ou outro com as seguintes interfaces: { info(), warn(), error() }. Defina como null se você desejar desativar o recurso de log.

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

notifier.on('update-available', (info) => {
  console.log(`Uma nova versão (${info.version}) está disponível para download!`);
});

notifier.on('update-not-available', (info) => {
  console.log('Não há novas atualizações disponíveis.');
});

notifier.on('this-is-last-update', (info) => {
  console.log('Esta é a última atualização disponível: ', info);
});

notifier.on('error', (error) => {
  console.error(Ocorreu um erro: ${error});
});
```
O objeto **UpdateInfo** é passado como um argumento para o manipulador de eventos e contém informações sobre a versão atual e a última versão disponível do seu aplicativo.

Exemplo completo
Aqui está um exemplo completo de como usar UpdateCheckerNotifier em um aplicativo Electron:

```javascript
import { UpdateCheckerNotifier, Language } from 'electron-update-checker-notifier';

const notifier = new UpdateCheckerNotifier({
repository: 'user/my-app',
token: 'my-github-token',
debug: true,
disableDialogsEventsOnly: false,
language: Language.PT_BR,
logger: log,
});

notifier.updateNotification();

notifier.on('update-available', (info) => {
  console.log(`Uma nova versão (${info.version}) está disponível para download!`);
});

notifier.on('error', (error) => {
console.error(Ocorreu um erro: ${error});
});
```

ou 

```javascript
import { updateCheckerNotifier, Language } from 'electron-update-checker-notifier';

updateCheckerNotifier.repository = 'user/my-app'
updateCheckerNotifier.token = 'my-github-token'
updateCheckerNotifier.debug = true
updateCheckerNotifier.disableDialogsEventsOnly = false
updateCheckerNotifier.language = Language.PT_BR
updateCheckerNotifier.logger = log

updateCheckerNotifier.updateNotification();

