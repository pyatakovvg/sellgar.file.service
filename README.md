
## CI и доставка

Push в `development` запускает unit → build → publish → migrate → deploy.
`unit` — обязательная job с юнит-тестами из Docker target `tests` до сборки приложения.
Если тесты или миграции не прошли, deploy не запускается.
Сборка, тесты и публикация выполняются на GitHub-hosted runners;
migrate/deploy — на общем organization runner в dev VM.
Обычная раскатка выполняется Helm с ожиданием готовности и проверкой image digest.
Argo CD продолжает управлять платформой, но не этим приложением.

Docker targets: `application`, `tests`, `migration`.
Миграционный образ запускает TypeORM CLI отдельной Kubernetes Job до раскатки приложения. В runtime приложения миграции автоматически не запускаются.

Настройки среды хранятся в `helm/dev/values.yaml`, Secret refs — в
`helm/values.app.yaml`. Версионный immutable ConfigMap монтируется через
`environmentFile`; значения credentials не передаются в GitHub-hosted jobs или Git.
Внутренний HTTP-порт — 8080, в dev одна реплика.

PR запускает unit → build без публикации и деплоя. Push в `release/*` публикует
кандидат с `release.json`; ручной production workflow из `master` принимает
`candidate-<run-number>.<attempt>`, проверяет успешный исходный CI и идентичность
дерева, продвигает те же digest без пересборки. Production ещё не подготовлен:
нужны его values, Secrets, runner и GitHub environment protections.
Откат миграций в эту схему не включён.

Общие workflows закреплены тегом `delivery-v0.7.0` в `sellgar.infrastructure`.
Порядок установки runner и передачи управления: [доставка приложений](https://github.com/sellgar/sellgar.infrastructure/blob/development/docs/application-delivery.md).
