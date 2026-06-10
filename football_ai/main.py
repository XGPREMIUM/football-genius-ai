from __future__ import annotations

import asyncio
import sys
from typing import Optional

import typer
from rich.console import Console
from rich.live import Live
from rich.markdown import Markdown
from rich.panel import Panel
from rich.prompt import Prompt
from rich.table import Table
from rich.text import Text

from football_ai.agent import FootballGeniusAgent
from football_ai.config import settings
from football_ai.prompts import MODE_DESCRIPTIONS, get_available_modes

console = Console()
app = typer.Typer(help="FOOTBALL GENIUS AI — La inteligencia artificial del fútbol mundial", no_args_is_help=True)
agent = FootballGeniusAgent(mode=settings.default_mode)


def print_header():
    title = Text("FOOTBALL GENIUS AI", style="bold green")
    subtitle = Text("\n\"No hablamos de fútbol. Vivimos dentro del fútbol.\"", style="italic yellow")
    console.print()
    console.print(Panel(title + subtitle, border_style="green"))
    console.print()


def print_mode_info(mode: str):
    icon, desc = MODE_DESCRIPTIONS.get(mode, ("[?]", ""))
    console.print(f"  Modo activo: {icon} [{mode.upper()}] {desc}", style="cyan")
    console.print()


def print_modes_table():
    table = Table(title="Modos disponibles", border_style="blue")
    table.add_column("Comando", style="yellow")
    table.add_column("Modo", style="cyan")
    table.add_column("Descripción")
    for name, (icon, desc) in MODE_DESCRIPTIONS.items():
        table.add_row(f"/{name}", icon, desc)
    console.print(table)


@app.command()
def chat():
    """Inicia una sesión de chat interactiva con el agente"""
    print_header()
    print_mode_info(agent.mode)
    console.print("Comandos disponibles:")
    console.print("  /mode <nombre>  — Cambiar de modo")
    console.print("  /modes          — Listar modos disponibles")
    console.print("  /clear          — Limpiar conversación")
    console.print("  /exit           — Salir")
    console.print()

    conversation_history: list[dict] = []

    while True:
        try:
            query = Prompt.ask("[bold green]Tú[/bold green]")
        except (EOFError, KeyboardInterrupt):
            console.print("\n[bold red]¡Hasta la próxima, crack![/bold red]")
            break

        if not query.strip():
            continue

        if query.startswith("/"):
            handle_command(query, conversation_history)
            continue

        console.print()
        with console.status("[bold yellow]Analizando...", spinner="dots"):
            response = asyncio.run(agent.ask(query, conversation_history))

        conversation_history.append({"role": "user", "content": query})
        conversation_history.append({"role": "assistant", "content": response})

        md = Markdown(response)
        console.print(Panel(md, border_style="green", title="[bold]Football Genius AI[/bold]"))
        console.print()


def handle_command(query: str, conversation_history: list[dict]):
    cmd = query[1:].strip().lower()

    if cmd == "exit":
        console.print("[bold red]¡Hasta la próxima, crack![/bold red]")
        raise typer.Exit()

    elif cmd == "clear":
        conversation_history.clear()
        console.print("[yellow]Conversación limpiada.[/yellow]")

    elif cmd == "modes":
        print_modes_table()

    elif cmd.startswith("mode "):
        mode_name = cmd.split(" ", 1)[1].strip()
        available = get_available_modes()
        if mode_name in available:
            agent.reset_mode(mode_name)
            conversation_history.clear()
            console.print(f"[green]✓ Modo cambiado a:[/green] [bold]{mode_name}[/bold]")
            print_mode_info(mode_name)
        else:
            console.print(f"[red]✗ Modo '{mode_name}' no válido.[/red]")
            console.print(f"  Usa /modes para ver los disponibles.")

    else:
        console.print(f"[red]Comando desconocido: {query}[/red]")


@app.command()
def ask(
    query: str,
    mode: Optional[str] = typer.Option(None, "--mode", "-m", help="Modo del agente"),
):
    """Haz una consulta directa al agente"""
    active_mode = mode or settings.default_mode
    local_agent = FootballGeniusAgent(mode=active_mode)
    icon, desc = MODE_DESCRIPTIONS.get(active_mode, ("", ""))
    console.print(f"[bold]{icon} Modo:[/bold] {desc}")
    console.print()

    with console.status("[bold yellow]Analizando...", spinner="dots"):
        response = asyncio.run(local_agent.ask(query))

    md = Markdown(response)
    console.print(Panel(md, border_style="green", title="[bold]Football Genius AI[/bold]"))
    console.print()


@app.command()
def modes():
    """Lista todos los modos disponibles"""
    print_modes_table()


@app.command()
def serve():
    """Inicia el servidor API REST"""
    from football_ai.api import run_server
    run_server()


def main():
    if len(sys.argv) <= 1:
        chat()
    else:
        app()


if __name__ == "__main__":
    main()
