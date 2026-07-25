---
version: alpha
name: tutor-design-system-final
description: Sistema de diseño oficial y definitivo para la aplicación móvil 'TUTOR' (Escuadrón 8). Basado en una estética 100% luminosa y limpia (estilo anti-oscuridad/Jedi), tipografía Inter libre de derechos, paleta de colores propia con tonos suaves y accesibles, burbujas de chat con sombras (elevation) para garantizar contraste, y un sistema de progreso circular.

colors:
  # Paleta Principal - Azul Calma / Confianza Luminoso
  primary: "#60A5FA"           # Azul cielo claro y aéreo para elementos principales y burbujas de IA.
  primary-soft: "#93C5FD"      # Tono secundario para acentos suaves.
  
  # Paleta de Éxito y Guía - Verde Menta Suave
  success: "#6EE7B7"           # Verde menta claro para el botón "Empezar", iconos y gráficos de progreso.
  
  # Paleta Neutra - Blancos y Grises (Luminosidad Absoluta)
  canvas: "#FFFFFF"            # Fondo principal de la aplicación.
  canvas-soft: "#F8FAFC"       # Fondo secundario para contenedores, tarjetas y burbujas de usuario.
  ink-base: "#334155"          # Texto principal (Gris carbón suave, sin negro profundo).
  ink-secondary: "#475569"     # Texto secundario y subtítulos.
  hairline: "#E2E8F0"          # Líneas divisorias y bordes.

  # Elementos de Chat Específicos (Con distinción clara y sombras)
  chat-ai-bg: "#E0F2FE"        # Fondo de burbuja del Asistente IA (Azul cielo muy claro).
  chat-user-bg: "#F8FAFC"      # Fondo de burbuja del Usuario (Blanco roto / Gris muy suave).

typography:
  # Tipografía 100% libre de derechos (Google Fonts)
  display-xl:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.5px

  heading-md:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.4

  body-md:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.5

  button-md:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 15px
    fontWeight: 600
    lineHeight: 1.0

rounded:
  sm: 6px
  md: 8px
  lg: 16px
  pill: 9999px

spacing:
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px

components:
  # Botón de Acción Principal (Verde Menta Suave)
  button-primary:
    backgroundColor: "{colors.success}"
    textColor: "{colors.ink-base}"
    typography: "{typography.button-md}"
    rounded: "{rounded.pill}"
    padding: 16px 32px

  # Tarjetas de Contenedor General
  card-container:
    backgroundColor: "{colors.canvas}"
    borderColor: "{colors.hairline}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
    shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"

  # Elementos de Chat con Elevación (Sombra sutil para contraste)
  chat-bubble-ai:
    backgroundColor: "{colors.chat-ai-bg}"
    textColor: "{colors.ink-base}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
    shadow: "0 2px 4px rgba(0, 0, 0, 0.04)"

  chat-bubble-user:
    backgroundColor: "{colors.chat-user-bg}"
    textColor: "{colors.ink-base}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
    shadow: "0 2px 4px rgba(0, 0, 0, 0.04)"

  # Campo de Entrada de Texto
  text-input:
    backgroundColor: "{colors.canvas-soft}"
    borderColor: "{colors.hairline}"
    textColor: "{colors.ink-base}"
    rounded: "{rounded.pill}"
    padding: 16px 20px
---

## Overview

Este documento recoge las especificaciones finales del sistema de diseño para la aplicación móvil **TUTOR** (Escuadrón 8), optimizado tras un proceso de iteración creativa enfocado en la luminosidad absoluta, la accesibilidad y la seguridad legal (evitando copyright y tipografías privativas).

## Pantallas Clave Definidas para la Entrega (4 de Agosto)

1. **Onboarding (Pantalla 1):**
   * **Iconografía:** Brújula estelar principal con detalles en verde luminoso (`#6EE7B7`).
   * **Textos (Copywriting positivo y claro):** 
     * Headline: *"Tutor: Tu guía personal en cada nueva herramienta."*
     * Subtítulo: *"Aprende de forma intuitiva y guiada, a tu propio ritmo."*
   * **CTA:** Botón principal en verde menta suave.

2. **Selección de Software (Pantalla 2):**
   * Listado visual y limpio de herramientas (Salesforce, Jira, Figma, Tableau) sobre tarjetas claras.

3. **Tutoría Conversacional - Pantalla Estrella (Pantalla 3):**
   * Interfaz de chat con burbujas diferenciadas y luminosas (Azul cielo muy claro para la IA y gris pálido/blanco roto para el usuario).
   * Incorporación de sombra sutil (*elevation*) en ambas burbujas para garantizar un contraste perfecto sobre el fondo blanco.

4. **Progreso y Recomendaciones (Pantalla 4):**
   * Indicador gráfico circular (anillo de progreso en verde menta suave) y tarjetas de micro-lecciones recomendadas.
