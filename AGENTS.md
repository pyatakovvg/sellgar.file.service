# @service/file

`services/file_srv` - control-plane файлов и папок. Он владеет file metadata,
каталогами, lifecycle/status и reference cleanup.

Файловые bytes и MinIO-адаптер принадлежат `services/media_srv`. `file_srv`
создает pending-запись, подтверждает готовность файла после записи объекта и
инициирует удаление объекта через `media_srv`.

## Что здесь находится

- `src/main.ts` - HTTP bootstrap с validation pipe и RMQ command consumer.
- `src/app.module.ts` - `ConfigModule`, `TypeOrmModule`, `ApiV1Module`.
- `src/api/v1/file` - file metadata, lifecycle/status, TypeORM-модель и repository-слой файлов.
- `src/api/v1/folder` - операции с папками.

## Правила изменений

- Файловые метаданные меняйте здесь, а object storage операции - в `services/media_srv`.
- При изменении file lifecycle DTO проверьте gateway file v1 в admin/client/mobile.
- `file_srv` не владеет связями файлов с товарами, вариантами или другими доменными сущностями. Такие связи хранят сервисы-владельцы домена, например `product_srv` через `variant_image`.
- После успешной загрузки файл может использоваться другими сервисами по UUID; публичный byte stream изображений должен идти через `media_srv`/CDN, а не через admin/client file endpoint.
- RMQ publisher файловых событий использует `AMQP_EVENTS_EXCHANGE` с `exchangeType: 'topic'` и `wildcards: true`; без `wildcards` NestJS отправляет события в очередь команд вместо exchange.
- Внутреннюю коммуникацию с `media_srv` и доменными сервисами строить через RabbitMQ. Не передавать file bytes через Rabbit.
- `file.delete` сначала удаляет объект через `media.object.delete`, затем
  отмечает metadata как `deleted`. Повторное удаление безопасно.
- Очередь `${AMQP_SERVICE_QUEUE}.events` принимает `brand.images.removed`
  из `AMQP_EVENTS_EXCHANGE`. Payload `imageUuids` содержит изображения,
  отсоединенные брендом после успешного сохранения. Подтверждение сообщения
  отправляется после удаления; при сбое сообщение возвращается в очередь.
- Не храните клиентские правила доступа в сервисе, если они относятся только к конкретному gateway; сервис должен проверять доменный контракт.

## Проверка

Основная проверка: `yarn workspace @service/file run build`.
