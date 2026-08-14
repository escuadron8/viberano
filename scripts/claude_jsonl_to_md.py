#!/usr/bin/env python3
"""Convierte sesiones de Claude Code (.jsonl) a Markdown legible.

Uso:
    python claude_jsonl_to_md.py <archivo.jsonl | carpeta> [--out carpeta_salida] [--tools]

--tools   incluye un resumen compacto de las llamadas a herramientas
          (por defecto solo se exportan los mensajes de usuario y las
          respuestas de texto de Claude, para máxima legibilidad).
"""

import argparse
import json
import sys
from pathlib import Path


def extract_text_blocks(content, include_tools):
    """Devuelve una lista de strings Markdown a partir del `content` de un mensaje."""
    if isinstance(content, str):
        return [content] if content.strip() else []

    parts = []
    for block in content:
        btype = block.get("type")
        if btype == "text":
            text = block.get("text", "")
            if text.strip():
                parts.append(text)
        elif btype == "tool_use" and include_tools:
            name = block.get("name", "?")
            inp = json.dumps(block.get("input", {}), ensure_ascii=False)[:300]
            parts.append(f"> 🔧 **Tool call:** `{name}` {inp}")
        elif btype == "tool_result" and include_tools:
            result = block.get("content", "")
            if isinstance(result, list):
                result = " ".join(
                    b.get("text", "") for b in result if isinstance(b, dict)
                )
            result = str(result).strip()
            if result:
                snippet = result[:500] + ("…" if len(result) > 500 else "")
                parts.append(f"> 📄 **Tool result:** {snippet}")
        # thinking / otros bloques se omiten siempre
    return parts


def convert_session(path: Path, include_tools: bool) -> str:
    title = None
    lines_out = []

    with path.open(encoding="utf-8") as f:
        for raw in f:
            raw = raw.strip()
            if not raw:
                continue
            try:
                entry = json.loads(raw)
            except json.JSONDecodeError:
                continue

            etype = entry.get("type")

            if etype == "ai-title" and not title:
                title = entry.get("aiTitle")

            if etype not in ("user", "assistant"):
                continue

            message = entry.get("message")
            if not message:
                continue

            role = message.get("role")
            content = message.get("content")
            blocks = extract_text_blocks(content, include_tools)
            if not blocks:
                continue

            speaker = "🧑 Usuario" if role == "user" else "🤖 Claude"
            for b in blocks:
                lines_out.append(f"### {speaker}\n\n{b}\n")

    header_title = title or path.stem
    header = f"# {header_title}\n\n_Sesión: `{path.name}`_\n\n---\n\n"
    return header + "\n".join(lines_out)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("target", help="Archivo .jsonl o carpeta con varios")
    parser.add_argument("--out", default="claude_md_export", help="Carpeta de salida")
    parser.add_argument(
        "--tools", action="store_true", help="Incluir llamadas y resultados de herramientas"
    )
    args = parser.parse_args()

    target = Path(args.target)
    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    if target.is_dir():
        jsonl_files = sorted(target.glob("*.jsonl"))
    else:
        jsonl_files = [target]

    if not jsonl_files:
        print(f"No se encontraron archivos .jsonl en {target}", file=sys.stderr)
        sys.exit(1)

    for jf in jsonl_files:
        md = convert_session(jf, args.tools)
        out_path = out_dir / (jf.stem + ".md")
        out_path.write_text(md, encoding="utf-8")
        print(f"OK: {jf.name} -> {out_path}")


if __name__ == "__main__":
    main()
