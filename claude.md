# PADEL RANKING SYSTEM - PRODUCT REQUIREMENTS DOCUMENT

## Objetivo General

Desarrollar una plataforma web moderna, responsive y mobile-first para la gestión integral de torneos de pádel por parejas.

La aplicación debe permitir administrar parejas, rankings, torneos, fixtures, resultados, estadísticas e historial deportivo desde un dashboard centralizado.

El sistema debe estar preparado para escalar y soportar múltiples torneos, múltiples categorías y futuras funcionalidades avanzadas.

---

# Stack Tecnológico

## Frontend

* Next.js 15 (App Router)
* React
* TypeScript
* Tailwind CSS
* Shadcn/UI
* Lucide React
* React Hook Form
* Zod
* TanStack Query

## Backend

* Next.js Route Handlers
* Server Actions
* TypeScript

## Base de Datos

* PostgreSQL
* Prisma ORM

## Autenticación

* Auth.js (NextAuth)

## Deployment

* Vercel
* Neon PostgreSQL o Supabase PostgreSQL

---

# Diseño General

## Estética

Mantener una interfaz moderna, deportiva y de alto contraste.

### Colores

Fondo principal:

```css
bg-slate-950
```

Cards y formularios:

```css
bg-slate-900
border-slate-800
```

Color de acento:

```css
bg-lime-500
text-slate-950
```

Texto principal:

```css
text-white
```

Texto secundario:

```css
text-slate-400
```

---

# Navegación

Agregar nueva opción al menú principal:

## Parejas / Ranking

Características:

* Icono Lucide React (Users o similar)
* Ruta:

```txt
/dashboard/parejas
```

* Mantener diseño actual
* Estado activo con highlight verde lima

---

# Dashboard Principal

Crear dashboard con métricas rápidas:

## Cards

* Total de Parejas
* Torneos Activos
* Partidos Pendientes
* Partidos Finalizados
* Pareja #1 del Ranking
* Próximo Partido

## Widgets

### Ranking Top 5

Mostrar:

* Posición
* Pareja
* Puntos

### Últimos Resultados

Mostrar últimos partidos finalizados.

### Próximos Encuentros

Mostrar próximos partidos programados.

---

# Módulo Parejas / Ranking

Ruta:

```txt
/dashboard/parejas
```

---

## Modelo Prisma

```prisma
model Pareja {
  id                 String   @id @default(cuid())

  nombreJugador1     String
  nombreJugador2     String

  puntosRanking      Int      @default(0)

  partidosJugados    Int      @default(0)
  partidosGanados    Int      @default(0)
  partidosPerdidos   Int      @default(0)

  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  partidosLocal      Partido[] @relation("Local")
  partidosVisitante  Partido[] @relation("Visitante")
}
```

---

# API Parejas

## GET

Obtener todas las parejas.

Ordenar:

```txt
puntosRanking DESC
```

Respuesta:

```json
[
  {
    "id": "",
    "nombreJugador1": "",
    "nombreJugador2": "",
    "puntosRanking": 0
  }
]
```

---

## POST

Crear nueva pareja.

Body:

```json
{
  "nombreJugador1": "Juan",
  "nombreJugador2": "Pedro"
}
```

Inicializar:

```txt
0 puntos
0 ganados
0 perdidos
0 jugados
```

---

## PUT

Permitir actualizar:

* Jugador 1
* Jugador 2
* Puntos de ranking (modo administrador)

---

## DELETE

Eliminar pareja.

Validaciones:

* No permitir eliminar si participa en torneos activos.
* No permitir eliminar si tiene partidos asociados.

Responder con error controlado.

---

# UI Gestión de Parejas

## Layout

Desktop:

```txt
┌──────────────┬────────────────────────┐
│ Formulario   │ Ranking                │
│ Alta/Edición │ Tabla                  │
└──────────────┴────────────────────────┘
```

Mobile:

```txt
Formulario

Tabla Ranking
```

---

## Formulario

Campos:

* Jugador 1
* Jugador 2

Botones:

* Registrar Pareja
* Guardar Cambios

Validaciones:

* Obligatorio
* Mínimo 3 caracteres

Estados:

* Loading
* Error
* Success

---

## Tabla Ranking

Columnas:

* #
* Pareja
* PJ
* PG
* PP
* Puntos
* Acciones

Acciones:

* Editar
* Eliminar

Características:

* Responsive
* Paginación
* Ordenamiento
* Búsqueda

---

# Módulo Torneos

Ruta:

```txt
/dashboard/torneos
```

---

## Modelo Prisma

```prisma
model Torneo {
  id          String @id @default(cuid())
  nombre      String
  categoria   String
  fechaInicio DateTime
  fechaFin    DateTime?
  estado      EstadoTorneo

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## Estados

```ts
enum EstadoTorneo {
  BORRADOR
  INSCRIPCION
  ACTIVO
  FINALIZADO
}
```

---

## Funcionalidades

* Crear torneo
* Editar torneo
* Eliminar torneo
* Ver detalle torneo
* Inscribir parejas

---

# Módulo Fixture

Ruta:

```txt
/dashboard/fixture
```

---

## Formatos soportados

### Liga

Todos contra todos.

### Eliminación Directa

Cuadro automático.

### Grupos + Playoffs

Fase de grupos.

Luego eliminación.

---

## Generación Automática

El sistema debe generar automáticamente:

* Partidos
* Cruces
* Calendario

---

# Módulo Partidos

## Modelo Prisma

```prisma
model Partido {
  id String @id @default(cuid())

  torneoId String

  parejaLocalId String
  parejaVisitanteId String

  fecha DateTime?

  estado EstadoPartido

  sets Json?

  ganadorId String?

  createdAt DateTime @default(now())
}
```

---

## Estados

```ts
enum EstadoPartido {
  PENDIENTE
  EN_JUEGO
  FINALIZADO
}
```

---

# Carga de Resultados

Permitir registrar:

Ejemplo:

```txt
6-4
3-6
6-2
```

Guardar:

* Sets
* Ganador
* Perdedor

---

# Ranking Automático

El ranking NO debe depender principalmente de edición manual.

Debe actualizarse automáticamente cuando un partido finaliza.

---

## Sistema Inicial de Puntos

### Fase de Grupos

Victoria:

```txt
+3
```

Derrota:

```txt
+1
```

### Semifinal

Victoria:

```txt
+5
```

### Final

Victoria:

```txt
+10
```

### Bonus Campeón

```txt
+15
```

### Bonus Subcampeón

```txt
+8
```

---

# Historial Deportivo

Cada pareja debe conservar:

* Torneos jugados
* Partidos jugados
* Partidos ganados
* Partidos perdidos
* Puntos acumulados
* Historial de ranking

---

# Dashboard de Estadísticas

Crear gráficos para:

## Ranking

Top parejas.

## Evolución

Evolución de puntos.

## Torneos

Torneos jugados.

## Rendimiento

Porcentaje de victorias.

---

# Seguridad

Solo administradores autenticados pueden:

* Crear parejas
* Editar parejas
* Eliminar parejas
* Crear torneos
* Cargar resultados

---

# Calidad Técnica

Requisitos obligatorios:

* TypeScript estricto
* Componentes reutilizables
* Server Components cuando sea posible
* Server Actions para mutaciones
* Prisma ORM
* Validaciones con Zod
* Manejo global de errores
* Loading states
* Empty states
* Skeleton loaders
* Toast notifications
* Código limpio
* Arquitectura escalable

---

# Extras Deseables

## Exportaciones

* PDF Ranking
* PDF Fixture
* PDF Resultados

## WhatsApp

Botón para compartir:

* Fixture
* Ranking
* Resultados

## Notificaciones

* Próximos partidos
* Resultados cargados

## PWA

Convertir la aplicación en Progressive Web App para uso desde celulares durante los torneos.

---

# Resultado Esperado

Generar una aplicación completa lista para producción que incluya:

* Dashboard
* Gestión de Parejas
* Ranking Automático
* Gestión de Torneos
* Fixture
* Resultados
* Estadísticas
* Historial Deportivo
* Autenticación
* Diseño Responsive Mobile First
* Prisma + PostgreSQL
* Next.js 15 + TypeScript + Tailwind
