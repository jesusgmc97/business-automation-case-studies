# Jesús · IA & Automatización

Web profesional en español para servicios freelance de automatización, formación práctica en IA y consultoría. Desarrollada con React, TypeScript y Vinext sobre Cloudflare Workers, con D1 para recibir solicitudes.

## Experiencia

- Identidad visual propia: blanco, verde oscuro, lima y tipografía editorial.
- Portada con una simulación de un flujo de automatización, activada por el visitante y etiquetada como ilustrativa.
- Tres servicios con llamadas a la acción que preseleccionan el interés en el formulario.
- Tres casos documentados del portfolio público, manteniendo información anonimizada.
- Calculadora interactiva de tiempo potencial, con fórmula y supuestos visibles. No predice ni garantiza resultados.
- Método de trabajo, presentación personal, preguntas frecuentes y formulario.
- Diseño adaptable, enlaces de salto, controles de teclado, foco visible, diálogo nativo de privacidad y respeto a movimiento reducido.

## Consultas

`POST /api/contact` guarda las solicitudes en la tabla D1 `contact_leads`. Solo confirma éxito después de persistir. No envía emails, no llama a servicios de IA y no expone endpoints públicos de lectura ni un panel de administración.

Cada solicitud contiene nombre, email, empresa opcional, servicio, mensaje, consentimiento, fecha, versión del aviso, identificador idempotente y estado. Las consultas pueden revisarse mediante las herramientas de propietario de Sites; pide a ChatGPT consultar las solicitudes del sitio. No debe hacerse pública ninguna lista de estos datos.

El endpoint valida origen, formato JSON, tamaño en streaming, campos, consentimiento, honeypot y tiempo mínimo de cumplimentación. Limita envíos por IP y por email en intervalos de quince minutos mediante operaciones atómicas. No guarda IP en claro; los resúmenes usados para limitar abuso son seudónimos y no equivalen a anonimización. Las entradas caducadas se borran con solicitudes posteriores. No hay CAPTCHA ni protección ilimitada frente a abuso distribuido.

Los reintentos idénticos conservan la referencia y no duplican filas. Reutilizar un identificador con datos diferentes se rechaza. Si falta la base de datos o falla el guardado, el formulario devuelve un error y mantiene la información introducida.

## Desarrollo

Requiere Node.js 22.13 o superior y npm. El proyecto se ejecuta en la nube; no hace falta mantener un ordenador personal encendido para recibir solicitudes.

```sh
npm ci
npm run dev
```

La configuración de Sites está en `.openai/hosting.json`. La vinculación `d1` debe ser `DB`. En una copia independiente de GitHub, el archivo no lleva identidad de despliegue: se debe registrar un sitio nuevo antes de publicar. Nunca copiar credenciales ni registros de consultas al repositorio.

Para crear las tablas locales, generar primero la salida de compilación y aplicar la migración con Wrangler local:

```sh
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_jittery_bishop.sql
```

El despliegue mediante Sites aplica las migraciones de producción. Los datos locales y los alojados son independientes.

## Verificación

```sh
node node_modules/typescript/bin/tsc --noEmit --incremental false
node --test tests/contact-validation.test.mjs tests/contact-integration.test.mjs
npm run build
```

Las pruebas comprueban validación, límites de bytes, persistencia real D1/SQLite, reintentos concurrentes, rechazo de sobrescrituras, límites concurrentes por email e IP, renovación de ventanas y rechazo sin escrituras ante origen o consentimiento inválidos.

## Fuentes de contenido

- Portfolio: https://github.com/jesusgmc97/business-automation-case-studies
- Clasificación con IA: `ai-complaint-triage-and-response/README.md`.
- Altas y bajas con validación humana: `employee-onboarding-and-offboarding/README.md`.
- Informes: `weekly-reporting-data-transformation/README.md`.
- INE, publicado 22/10/2026: 33,6 % de las empresas españolas de 10 o más empleados usó IA en el primer trimestre de 2026. https://www.ine.es/dyngs/Prensa/ETICCE20251T2026.htm
- Brynjolfsson, Li y Raymond, *Generative AI at Work*, QJE 2025: +15 % de incidencias resueltas por hora de media en un estudio con 5.172 agentes de una empresa; variación entre personas. https://doi.org/10.1093/qje/qjae044

Las cifras externas son contexto, no resultados de estos servicios. No se han creado testimonios, clientes, certificaciones, años de experiencia ni ahorros no verificados. Los casos son documentación del propio autor, no una auditoría independiente.

## Personalización y apertura al público

La primera versión alojada conserva acceso privado del propietario. Antes de abrirla comercialmente, concretar identidad y contacto profesional para completar el aviso legal y de privacidad, política de conservación, y el canal elegido para atender solicitudes. La información de privacidad actual describe el comportamiento del formulario y no pretende sustituir un aviso legal completo. Dominio propio y avisos por email son opciones de configuración posteriores, no funciones ya conectadas.

Textos y componentes: `app/page.tsx`. Diseño y puntos de adaptación: `app/globals.css`. Metadatos: `app/layout.tsx`. No hay analítica de marketing, fuentes externas ni scripts publicitarios en la aplicación. El alojamiento puede aplicar sus propios mecanismos de acceso y registros operativos.
