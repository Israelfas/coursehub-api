<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

CourseHub API es una API REST construida con NestJS que gestiona cursos,
estudiantes y matrículas.

## Requisitos

- Node.js 20 o superior.
- PostgreSQL 14 o superior en ejecución local.
- Una base de datos vacía llamada `coursehub`:

```bash
createdb coursehub
```

## Variables de entorno

La configuración vive fuera del código. Copie `.env.example` como `.env` y
complete los valores de su instalación local:

```bash
cp .env.example .env
```

| Variable      | Descripción                   | Por defecto   | Obligatoria |
| ------------- | ----------------------------- | ------------- | ----------- |
| `NODE_ENV`    | `development`, `test` o `production` | `development` | No   |
| `PORT`        | Puerto donde escucha la API   | `3000`        | No          |
| `DB_HOST`     | Host de PostgreSQL            | -             | Sí          |
| `DB_PORT`     | Puerto de PostgreSQL          | `5432`        | No          |
| `DB_NAME`     | Nombre de la base de datos    | -             | Sí          |
| `DB_USER`     | Usuario de PostgreSQL         | -             | Sí          |
| `DB_PASSWORD` | Contraseña del usuario        | -             | Sí          |

`.env` está excluido del repositorio y nunca debe publicarse. `.env.example` sí
se comparte: lleva los nombres esperados con valores ficticios, para que otra
persona pueda reproducir la configuración sin recibir credenciales.

### La configuración se valida al arrancar

`ConfigModule` valida el entorno con un esquema de Joi **antes** de que la
aplicación intente conectarse a PostgreSQL. Una variable ausente o con un valor
imposible detiene el arranque y nombra la variable:

```
Error: Config validation error: DB_PORT: "DB_PORT" must be a number
Error: Config validation error: DB_NAME: "DB_NAME" is required
Error: Config validation error: NODE_ENV: "NODE_ENV" must be one of [development, test, production]
```

Fallar así, temprano y con el nombre de la variable, es preferible a arrancar con
una configuración incompleta y romperse después con un error de conexión que no
explica la causa real.

El puerto se cambia editando `PORT` en el `.env`, sin tocar TypeScript.

## Puesta en marcha

```bash
npm install
createdb coursehub          # o créela desde pgAdmin con ese nombre exacto
cp .env.example .env        # y complete DB_PASSWORD con su contraseña local
npm run start:dev
```

La API queda escuchando en el puerto indicado por `PORT`. Al arrancar imprime
una línea con el puerto, el ambiente y el estado de `synchronize`; nunca
imprime la contraseña ni el objeto de configuración completo.

```
[Bootstrap] CourseHub API escuchando en el puerto 3333 | NODE_ENV=development | synchronize=true
```

## Desarrollo y producción

`synchronize` se decide a partir de `NODE_ENV`, no de un comentario que alguien
deba acordarse de editar antes de publicar:

```ts
synchronize: config.getOrThrow<string>('NODE_ENV') === 'development',
```

| Decisión           | `development`                | `production`                     |
| ------------------ | ---------------------------- | -------------------------------- |
| Fuente de valores  | `.env` local                 | Variables del entorno de despliegue |
| `synchronize`      | `true`                       | `false`                          |
| Cambios de esquema | Ajuste local desechable      | Migraciones revisadas            |

Con `synchronize: true`, TypeORM ajusta las tablas para que coincidan con las
entidades, y eso incluye **eliminar** columnas que ya no aparecen en ellas. En
una base con datos reales esa pérdida sería silenciosa e irreversible, así que
fuera de desarrollo el esquema se cambia únicamente con migraciones.

Esta configuración deja la aplicación en posición de adoptar migraciones, pero
todavía no las implementa.

La conexión usa `synchronize: true`, por lo que TypeORM crea la tabla `courses`
automáticamente en el primer arranque. Esta opción es útil solo en desarrollo;
en producción se usan migraciones.

## Cuentas de usuario

`User` representa una cuenta que puede autenticarse ante la API. **No se
relaciona con `Student`**: no todo estudiante tiene cuenta, ni toda cuenta
corresponde a un estudiante.

| Método | Endpoint         | Descripción                        |
| ------ | ---------------- | ---------------------------------- |
| POST   | `/auth/register` | Registra una cuenta y devuelve sus datos públicos. |

```json
{
  "email": "ana@example.com",
  "password": "<su contraseña>"
}
```

```json
{
  "id": 1,
  "email": "ana@example.com",
  "createdAt": "2026-10-19T19:34:12.841Z"
}
```

| Método | Endpoint      | Descripción                                   |
| ------ | ------------- | --------------------------------------------- |
| POST   | `/auth/login` | Comprueba las credenciales. Devuelve `200`, aún sin token. |

```json
{
  "email": "ana@example.com",
  "password": "<su contraseña>"
}
```

Responde `200` y no `201` porque no se crea ningún recurso: solo se valida un
acceso. El token llega en la Semana 9.

Los ejemplos de este README nunca llevan una contraseña escrita, ni siquiera de
prueba: un documento compartido no es sitio para un secreto, y la costumbre de
escribirlos ahí es la que termina filtrando uno real.

### El mismo error para dos fallos distintos

Un correo no registrado y una contraseña incorrecta devuelven **exactamente la
misma respuesta**:

```json
{ "message": "Credenciales inválidas", "error": "Unauthorized", "statusCode": 401 }
```

Si la API dijera "ese correo no existe", cualquiera podría probar una lista de
direcciones y descubrir cuáles son cuentas reales. En el registro sí se informa
que un correo está ocupado, porque ahí la amenaza es distinta y el usuario
necesita saber por qué no puede continuar.

Los errores de formato siguen siendo claros: un correo mal escrito o una
contraseña corta responden `400` con el detalle, porque ni siquiera llegan al
servicio y no revelan nada sobre las cuentas existentes.

### La contraseña nunca se guarda

```
cliente → DTO valida la forma → AuthService calcula el hash con bcrypt
       → PostgreSQL guarda solo passwordHash → la respuesta omite ambos
```

El texto original existe en un único punto: dentro de `AuthService.register`,
entre que llega el DTO y se calcula el hash. No se registra en consola, no entra
en un mensaje de error y no aparece en ninguna respuesta.

| Decisión | Regla |
| --- | --- |
| Correo | Se recorta y pasa a minúsculas antes de guardar y de buscar, así que `ANA@EXAMPLE.COM` y `ana@example.com` son la misma cuenta. |
| Contraseña | Entre 8 y 72 caracteres. **No** se recorta ni se pasa a minúsculas: eso cambiaría el secreto elegido. |
| Hash | bcrypt con 12 rondas, con sal incorporada. |
| Columna | Se llama `passwordHash` y lleva `select: false`, para que una consulta normal no la arrastre por accidente. |
| Correo repetido | `409`, tanto por la comprobación del servicio como por la restricción `UNIQUE` de la base. |

`UsersService.create` recibe un hash ya calculado, nunca la contraseña. Así no
existe un método `create(email, password)` que pudiera persistir el secreto por
descuido.

En el login, la contraseña **no se descifra**: un hash no es cifrado y no tiene
vuelta atrás. Tampoco se vuelve a hashear para comparar con `===`, porque bcrypt
incorpora una sal y dos hashes de la misma contraseña son distintos.
`bcrypt.compare` recibe el texto recibido y el hash guardado, y devuelve una
decisión booleana.

Como `passwordHash` es `select: false`, el hash no viaja en ninguna consulta
normal. Solo `UsersService.findByEmailWithPassword` lo carga, con `addSelect`, y
existe únicamente para el flujo de autenticación.

## Persistencia

Los tres recursos se guardan en PostgreSQL mediante TypeORM.

| Tabla         | Entidad      | Restricciones                                        |
| ------------- | ------------ | ---------------------------------------------------- |
| `courses`     | `Course`     | Clave primaria autogenerada.                         |
| `students`    | `Student`    | `email` único.                                       |
| `enrollments` | `Enrollment` | Claves foráneas a `students` y `courses`; la pareja `studentId` + `courseId` es única. |

Las matrículas usan relaciones reales: `enrollments.studentId` y
`enrollments.courseId` son claves foráneas con `ON DELETE RESTRICT`. Esto
significa que **un curso o un estudiante con matrículas no se puede eliminar**:
la API responde `409` y pide cancelar primero las matrículas.

Se eligió `RESTRICT` y no `CASCADE` a propósito. Con `CASCADE`, borrar un curso
haría desaparecer en silencio el historial de quiénes estaban inscritos en él.
Perder datos debe ser una decisión explícita, no un efecto secundario.

## Códigos de respuesta

| Código | Cuándo se usa                                                              |
| ------ | --------------------------------------------------------------------------- |
| `400`  | Datos inválidos en el body o la ruta, y matricular a un estudiante inactivo. |
| `404`  | El curso, el estudiante o la matrícula no existen.                           |
| `409`  | Correo repetido, matrícula duplicada, o borrar un recurso con matrículas.      |

El estudiante inactivo responde `400` y no `409` porque el recurso no está en
conflicto: la petición es la que no es válida y el cliente debe corregirla.

### Dos defensas para las reglas de unicidad

El correo del estudiante y la pareja estudiante-curso se protegen en dos capas:

1. **El servicio** consulta antes de guardar y lanza un `409` con un mensaje
   comprensible. Es el camino habitual.
2. **PostgreSQL** tiene la restricción `UNIQUE`, que es la garantía definitiva.

La segunda capa no es redundante. Si dos solicitudes llegan casi a la vez, ambas
pueden ver el correo libre antes de que ninguna haya guardado, y la que pierde la
carrera choca contra la restricción de la base.

Ese choque no debe salir como un `500` sin contexto. El filtro global
[`DatabaseConstraintFilter`](src/common/filters/database-constraint.filter.ts) atrapa el
`QueryFailedError` con código `23505` de PostgreSQL y lo convierte en el mismo
`409` que habría devuelto el servicio. El filtro identifica la columna en
conflicto leyendo el campo `detail` del error, no el nombre de la restricción,
porque TypeORM genera esos nombres de forma automática.

El mismo filtro traduce los códigos `23001` y `23503`, que PostgreSQL usa cuando
una clave foránea impide una operación. Son dos códigos distintos: `23001` es el
de `ON DELETE RESTRICT` y `23503` el de una fila referenciada que no existe.

## Endpoints de cursos

El recurso `courses` se guarda en la tabla `courses` de PostgreSQL. Los ids los
genera la base de datos y no se reutilizan después de eliminar un registro.

| Método | Endpoint                  | Descripción                                                          |
| ------ | ------------------------- | -------------------------------------------------------------------- |
| GET    | `/courses`                | Lista cursos paginados; admite `level`, `page`, `limit`, `sortBy` y `order`. |
| GET    | `/courses?level=beginner` | Lista cursos filtrados por nivel.                                    |
| GET    | `/courses/:id`            | Consulta un curso por id; responde 404 si no existe.                 |
| POST   | `/courses`                | Crea un curso.                                                       |
| PATCH  | `/courses/:id`            | Actualiza parte de un curso; 400 por datos inválidos y 404 si falta. |
| DELETE | `/courses/:id`            | Elimina un curso; responde 404 si no existe.                         |

### Listado paginado

`GET /courses` devuelve una página de resultados, no la tabla completa.

| Parámetro | Valor por defecto | Reglas                                      |
| --------- | ----------------- | ------------------------------------------- |
| `level`   | sin filtro        | Opcional; igualdad exacta.                  |
| `page`    | `1`               | Entero ≥ 1.                                 |
| `limit`   | `10`              | Entero entre 1 y 50.                        |
| `sortBy`  | `id`              | Solo `id`, `title` o `level`.               |
| `order`   | `ASC`             | Solo `ASC` o `DESC`; no distingue mayúsculas. |

```
GET /courses?level=beginner&page=1&limit=3&sortBy=title&order=ASC
```

```json
{
  "items": [
    { "id": 1, "title": "Algoritmos y estructuras", "level": "beginner" },
    { "id": 5, "title": "Expresiones regulares", "level": "beginner" },
    { "id": 6, "title": "Fundamentos de TypeScript", "level": "beginner" }
  ],
  "meta": { "total": 4, "page": 1, "limit": 3, "totalPages": 2 }
}
```

`meta.total` cuenta todos los cursos que cumplen el filtro, mientras que
`items.length` solo cuenta los de esta página. Por eso el cliente sabe que hay
una segunda página sin tener que pedir todos los datos.

El ordenamiento se aplica siempre, incluso sin `sortBy`. Sin un orden explícito
PostgreSQL puede devolver las filas en cualquier secuencia, y un mismo curso
podría aparecer en dos páginas distintas o no aparecer en ninguna.

`sortBy` se compara contra una lista cerrada y un valor fuera de ella responde
`400`. El nombre de una columna no puede pasarse como parámetro de la consulta
igual que se pasa un valor, así que aceptarlo tal cual abriría la puerta a
inyección SQL.

Ejemplo de body para `POST /courses`:

```json
{
  "title": "Testing NestJS",
  "level": "intermediate"
}
```

`POST /courses` responde `201 Created` con ese body válido. Responde `400 Bad
Request` si `title` está vacío, si `level` no es `beginner`, `intermediate` o
`advanced`, o si se envían campos adicionales.

En `PATCH /courses/:id` se envían únicamente los campos que se desean cambiar:

```json
{
  "title": "Testing APIs with NestJS"
}
```

Las reglas de validación de creación se aplican también a los campos enviados en
PATCH. Por ejemplo, `level` debe ser `beginner`, `intermediate` o `advanced`.

## Endpoints de estudiantes

El recurso `students` se guarda en la tabla `students` de PostgreSQL.

| Método | Endpoint               | Descripción                                                                     |
| ------ | ---------------------- | ------------------------------------------------------------------------------- |
| GET    | `/students`            | Lista estudiantes; admite filtros combinados `career`, `semester` e `isActive`. |
| GET    | `/students/:id`        | Consulta un estudiante por id.                                                  |
| POST   | `/students`            | Registra un estudiante.                                                         |
| PATCH  | `/students/:id`        | Actualiza parcialmente un estudiante.                                           |
| PATCH  | `/students/:id/status` | Cambia únicamente el estado activo.                                             |
| DELETE | `/students/:id`        | Elimina un estudiante activo.                                                   |

Ejemplo de body para `POST /students`:

```json
{
  "name": "Ana Pérez",
  "email": "ana@example.com",
  "age": 20,
  "career": "Software Engineering",
  "semester": 4,
  "isActive": true
}
```

`semester` debe ser un entero entre 1 y 10. Los correos son únicos, los ids deben
ser enteros positivos y no se puede eliminar a un estudiante inactivo. Los datos
inválidos responden `400`, los estudiantes inexistentes `404` y los conflictos de
reglas de negocio `409`.

## Endpoints de matrículas

Las matrículas relacionan un estudiante activo con un curso existente mediante
claves foráneas. Las consultas devuelven también los datos públicos del estudiante
y del curso, sin exponer el correo.

| Método | Endpoint                           | Descripción                                                 |
| ------ | ---------------------------------- | ----------------------------------------------------------- |
| POST   | `/enrollments`                     | Registra una matrícula.                                     |
| GET    | `/enrollments`                     | Lista matrículas paginadas; admite `search`, `studentId`, `courseId`, `activeOnly`, `page` y `limit`. |
| GET    | `/students/:studentId/enrollments` | Lista las matrículas de un estudiante existente.            |
| GET    | `/courses/:courseId/enrollments`   | Lista las matrículas de un curso existente.                 |
| DELETE | `/enrollments/:id`                 | Cancela una matrícula.                                      |

Ejemplo de request y respuesta exitosa para `POST /enrollments`:

```json
{
  "studentId": 1,
  "courseId": 1
}
```

```json
{
  "id": 1,
  "studentId": 1,
  "courseId": 1,
  "student": {
    "id": 1,
    "name": "Ana Pérez",
    "career": "Software Engineering",
    "semester": 4,
    "isActive": true
  },
  "course": {
    "id": 1,
    "title": "NestJS con PostgreSQL",
    "level": "intermediate"
  }
}
```

### Búsqueda de matrículas

`GET /enrollments` usa `QueryBuilder` porque la consulta atraviesa dos
relaciones y combina condiciones opcionales.

| Parámetro    | Efecto                                                               |
| ------------ | -------------------------------------------------------------------- |
| `search`     | Coincidencia parcial sin distinguir mayúsculas sobre el nombre del estudiante **o** el título del curso. |
| `studentId`  | Matrículas de ese estudiante.                                        |
| `courseId`   | Matrículas de ese curso.                                             |
| `activeOnly` | `true` deja solo las de estudiantes activos.                         |
| `page`       | Página a devolver; por defecto `1`.                                   |
| `limit`      | Tamaño de página entre 1 y 50; por defecto `10`.                      |

```
GET /enrollments?search=nest&activeOnly=true&page=1&limit=5
```

Los filtros se acumulan con `andWhere` y se combinan sin sobrescribirse. Las dos
alternativas de `search` van entre paréntesis para que el `OR` no se mezcle con
los demás filtros.

El texto buscado viaja como parámetro `:search` y nunca se concatena dentro del
SQL. Una entrada como `' OR 1=1 --` se busca literalmente y devuelve cero
resultados, en lugar de convertirse en una condición siempre verdadera.

Una búsqueda sin coincidencias responde `200` con `items: []` y `total: 0`, no
`404`: la colección de matrículas existe aunque ninguna fila coincida.

`activeOnly` se recibe como texto y se compara con `'true'`. No se convierte con
`Boolean()`, porque `Boolean('false')` es `true` en JavaScript e invertiría el
significado del filtro.

El endpoint responde `409 Conflict` para una matrícula duplicada, `400 Bad Request`
para un estudiante inactivo o datos inválidos, y `404 Not Found` si el estudiante o
el curso no existen. Ejemplo de filtro: `GET /enrollments?studentId=1&courseId=1`.

## Project setup

```bash
$ npm install
```

Antes del primer arranque cree la base `coursehub` y su archivo `.env` como se
indica en Requisitos y Variables de entorno.

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Observability

In production applications, observability is essential for understanding how your system behaves, detecting issues early, and maintaining reliable performance.

[NestJS Observe](https://observe.nestjs.com) automatically instruments your NestJS application, giving you deep visibility into your system with minimal setup:

- **Distributed tracing:** Follow requests across services and understand how they flow through your system.
- **Waterfall analysis:** Visualize request execution and identify slow operations, bottlenecks, and unexpected delays.
- **Performance analysis:** Analyze application performance in real time and quickly pinpoint areas that need optimization.
- **Metrics:** Track key application and infrastructure metrics to understand system health and performance trends.
- **Logging:** Centralize and correlate logs with traces and other telemetry to make debugging easier.
- **Error tracking:** Detect errors quickly and investigate their root causes with the surrounding context.
- **SLA monitoring:** Track service-level objectives and identify when your application is approaching or exceeding defined thresholds.
- **Alarms and alerts:** Set up alerts for critical errors, performance degradation, SLA violations, and other anomalies so your team can react quickly.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Auto-instrument your application with [NestJS Observer](https://observer.nestjs.com). Distributed tracing, metrics, and logging made easy. Error tracking and performance monitoring for your NestJS applications.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
