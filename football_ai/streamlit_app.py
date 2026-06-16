from __future__ import annotations

import asyncio
import json
import os
import sys
import time
import uuid
from pathlib import Path

import streamlit as st

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from agent import FootballGeniusAgent
from prompts import MODE_DESCRIPTIONS, get_available_modes
from config import settings
from styles import CUSTOM_CSS, LIGHT_CSS
from db import init_db, save_conversation, load_conversation, list_conversations, delete_conversation, search_players, search_teams, get_player, get_team, get_all_players, get_all_teams
from seed_data import seed_database
from suggestions import MODE_QUESTIONS
from rankings import get_player_ranking, get_top_teams, TOP_PLAYERS_CATEGORIES
from charts import show_player_radar, show_comparison

TYPING_HTML = '''<div class="typing-indicator"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>'''


st.set_page_config(
    page_title="Football Genius AI",
    page_icon="⚽",
    layout="wide",
    initial_sidebar_state="expanded",
)

init_db()
seed_database()


def init_session():
    if "session_id" not in st.session_state:
        st.session_state.session_id = str(uuid.uuid4())
    if "agent" not in st.session_state:
        st.session_state.agent = FootballGeniusAgent(mode="general")
    if "messages" not in st.session_state:
        loaded = load_conversation(st.session_state.session_id)
        if loaded:
            mode, msgs = loaded
            st.session_state.agent.reset_mode(mode)
            st.session_state.messages = msgs
        else:
            st.session_state.messages = []
    if "current_mode" not in st.session_state:
        st.session_state.current_mode = st.session_state.agent.mode
    if "dark_mode" not in st.session_state:
        st.session_state.dark_mode = True
    if "streaming" not in st.session_state:
        st.session_state.streaming = False


init_session()


def save_messages():
    save_conversation(
        st.session_state.session_id,
        st.session_state.current_mode,
        st.session_state.messages,
    )


def new_conversation():
    st.session_state.session_id = str(uuid.uuid4())
    st.session_state.messages = []
    save_messages()
    st.rerun()


def load_conversation_by_id(session_id: str):
    loaded = load_conversation(session_id)
    if loaded:
        mode, msgs = loaded
        st.session_state.session_id = session_id
        st.session_state.messages = msgs
        st.session_state.current_mode = mode
        st.session_state.agent.reset_mode(mode)
    st.rerun()


# SIDEBAR
with st.sidebar:
    st.markdown('<div style="text-align: center; padding: 8px 0;">', unsafe_allow_html=True)
    st.markdown(
        '<h1 style="font-size: 1.5rem; margin: 0;">⚽ Football Genius AI</h1>',
        unsafe_allow_html=True,
    )
    st.markdown(
        '<p style="font-size: 0.75rem; color: #8a9aa8; font-style: italic; margin: 0 0 8px 0;">'
        '"No hablamos de fútbol. Vivimos dentro del fútbol."</p>',
        unsafe_allow_html=True,
    )
    st.markdown('</div>', unsafe_allow_html=True)

    st.divider()

    st.subheader("Modo de análisis")

    mode_options = {
        f"{icon} {name.replace('_', ' ').title()}": name
        for name, (icon, desc) in MODE_DESCRIPTIONS.items()
    }

    current_index = list(mode_options.values()).index(st.session_state.current_mode) \
        if st.session_state.current_mode in mode_options.values() else 0

    selected_label = st.selectbox(
        "Selecciona un modo:",
        options=list(mode_options.keys()),
        index=current_index,
    )

    selected_mode = mode_options[selected_label]

    if selected_mode != st.session_state.current_mode:
        st.session_state.current_mode = selected_mode
        st.session_state.agent.reset_mode(selected_mode)
        save_messages()
        st.rerun()

    mode_icon, mode_desc = MODE_DESCRIPTIONS[st.session_state.current_mode]
    st.caption(f"{mode_icon} {mode_desc}")

    st.divider()

    with st.expander("💡 Preguntas sugeridas", expanded=True):
        questions = MODE_QUESTIONS.get(st.session_state.current_mode, MODE_QUESTIONS["general"])
        for q in questions[:5]:
            if st.button(q, use_container_width=True, type="secondary"):
                st.session_state.pending_question = q
                st.rerun()

    st.divider()

    with st.expander("🔍 Buscar jugador/equipo", expanded=False):
        search_type = st.radio("Tipo", ["Jugador", "Equipo"], horizontal=True, label_visibility="collapsed")
        search_q = st.text_input("Buscar...", placeholder="Messi, Real Madrid...", label_visibility="collapsed")
        if search_q:
            if search_type == "Jugador":
                results = search_players(search_q)
                for p in results[:8]:
                    with st.container():
                        st.markdown(f"**{p['name']}**")
                        st.caption(f"{p['nationality']} | {p['position']} | {p.get('current_club', 'Sin club') or 'Sin club'}")
                        cols = st.columns(2)
                        with cols[0]:
                            if st.button(f"ℹ️ Info", key=f"info_{p['name']}", use_container_width=True):
                                st.session_state.pending_question = f"Cuéntame todo sobre {p['name']}"
                                st.rerun()
                        with cols[1]:
                            if st.button(f"📊 Stats", key=f"stats_{p['name']}", use_container_width=True):
                                show_player_radar(p['name'])
            else:
                results = search_teams(search_q)
                for t in results[:8]:
                    with st.container():
                        st.markdown(f"**{t['name']}**")
                        st.caption(f"{t['country']} | {t.get('league', '')}")
                        if st.button(f"ℹ️ Info", key=f"info_team_{t['name']}", use_container_width=True):
                            st.session_state.pending_question = f"Cuéntame todo sobre {t['name']}"
                            st.rerun()

    st.divider()

    with st.expander("⚔️ Comparar", expanded=False):
        compare_a = st.text_input("Primero", placeholder="Jugador A", key="cmp_a", label_visibility="collapsed")
        compare_b = st.text_input("Segundo", placeholder="Jugador B", key="cmp_b", label_visibility="collapsed")
        if compare_a and compare_b:
            if st.button("Comparar", use_container_width=True):
                st.session_state.pending_question = f"Compara en detalle a {compare_a} vs {compare_b}. Dame un análisis completo con estadísticas, logros, estilos de juego, y un veredicto final."
                st.rerun()

    st.divider()

    with st.expander("🏆 Rankings", expanded=False):
        rank_type = st.radio("Ver", ["Jugadores", "Equipos"], horizontal=True, label_visibility="collapsed")
        if rank_type == "Jugadores":
            ranking = get_player_ranking()
            cat = st.selectbox("Categoría", ["General"] + list(TOP_PLAYERS_CATEGORIES.keys()))
            if cat == "General":
                for r in ranking[:15]:
                    st.markdown(f"**#{r['rank']}** {r['name']} — {r['score']} pts")
                    st.caption(f"{r['nationality']} | ⚽ {r['goals']} g | 🅰️ {r['assists']} a | 🏆 {r['ballon_dors']} BdO")
            else:
                field, _ = TOP_PLAYERS_CATEGORIES[cat]
                items = sorted(ranking, key=lambda x: x.get(field, 0) if isinstance(x.get(field, 0), (int, float)) else 0, reverse=True)[:10]
                for r in items:
                    val = r.get(field, 0)
                    st.markdown(f"**#{items.index(r)+1}** {r['name']} — **{val}**")
        else:
            teams = get_top_teams()
            for t in teams[:15]:
                st.markdown(f"**#{t['rank']}** {t['name']} — {t['total_titles']} títulos")
                st.caption(f"{t['country']} | 🏠 {t['titles_domestic']} dom. | 🌍 {t['titles_international']} int.")

    st.divider()

    with st.expander("📁 Conversaciones", expanded=False):
        col1, col2 = st.columns([3, 1])
        with col1:
            st.caption("Historial")
        with col2:
            if st.button("➕", help="Nueva conversación"):
                new_conversation()

        convos = list_conversations()
        for conv in convos[:8]:
            title = conv["title"] or "Sin título"
            sid = conv["session_id"]
            cols = st.columns([4, 1])
            with cols[0]:
                if st.button(f"💬 {title[:30]}...", key=f"conv_{sid}", use_container_width=True):
                    load_conversation_by_id(sid)
            with cols[1]:
                if st.button("✕", key=f"del_{sid}", help="Eliminar"):
                    delete_conversation(sid)
                    st.rerun()

    st.divider()

    if st.session_state.messages:
        timestamp = time.strftime("%Y-%m-%d %H:%M")
        mode_name = st.session_state.current_mode
        chat_lines = [
            f"# Football Genius AI — Conversación",
            f"**Modo:** {mode_name}  |  **Fecha:** {timestamp}",
            f"---",
        ]
        for m in st.session_state.messages:
            role = "🤔 Tú" if m["role"] == "user" else "🧠 Football Genius AI"
            chat_lines.append(f"### {role}")
            chat_lines.append(m["content"])
            chat_lines.append("")
        chat_text = "\n".join(chat_lines)
        st.download_button(
            "📥 Exportar chat",
            data=chat_text,
            file_name=f"football-genius-{st.session_state.session_id[:8]}.md",
            mime="text/markdown",
            use_container_width=True,
        )

    st.divider()

    st.caption(f"🔧 **Modelo:** {settings.openrouter_model or settings.openai_model}")
    st.caption(f"☁️ **Proveedor:** {settings.ai_provider}")

    st.markdown("""
    <div style="text-align:center;margin:8px 0">
        <button id="voiceBtn" onclick="startVoice()" style="background:linear-gradient(135deg,#ffd700,#daa520);border:none;border-radius:50%;width:48px;height:48px;font-size:22px;cursor:pointer;transition:all 0.2s" title="Preguntar por voz">🎤</button>
        <p style="color:#8b949e;font-size:11px;margin:4px 0">Preguntar por voz</p>
    </div>
    <script>
    function startVoice() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Tu navegador no soporta reconocimiento de voz');
            return;
        }
        const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        rec.lang = 'es-ES';
        rec.onresult = function(e) {
            const text = e.results[0][0].transcript;
            const input = document.querySelector('[data-testid="stChatInput"] textarea');
            if (input) {
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
                nativeInputValueSetter.call(input, text);
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        };
        rec.start();
    }
    </script>
    """, unsafe_allow_html=True)

    if st.button("🗑️ Nueva conversación", use_container_width=True, type="primary"):
        new_conversation()



# MAIN AREA
st.markdown(CUSTOM_CSS if st.session_state.dark_mode else LIGHT_CSS, unsafe_allow_html=True)

mode_icon, mode_desc = MODE_DESCRIPTIONS.get(st.session_state.current_mode, ("", ""))
header_col1, header_col2 = st.columns([6, 1])
with header_col1:
    st.title("⚽ Football Genius AI")
    st.markdown(
        f'<span class="mode-indicator">{mode_icon} Modo: <b>{st.session_state.current_mode.upper()}</b> &nbsp;—&nbsp; {mode_desc}</span>',
        unsafe_allow_html=True,
    )
with header_col2:
    st.markdown("<br>", unsafe_allow_html=True)
    if st.button("🌙" if st.session_state.dark_mode else "☀️", help="Toggle theme"):
        st.session_state.dark_mode = not st.session_state.dark_mode
        st.rerun()

# Chat messages
chat_container = st.container()
with chat_container:
    for msg in st.session_state.messages:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

    if st.session_state.get("pending_question"):
        query = st.session_state.pending_question
        st.session_state.pending_question = None

        st.session_state.messages.append({"role": "user", "content": query})
        with st.chat_message("user"):
            st.markdown(query)

        with st.chat_message("assistant"):
            place = st.empty()
            place.markdown(TYPING_HTML, unsafe_allow_html=True)
            full_response = ""
            try:
                async def stream_and_collect():
                    result = ""
                    async for chunk in st.session_state.agent.ask_stream(query, st.session_state.messages[:-1]):
                        result += chunk
                        place.markdown(result + "▌")
                    return result

                full_response = asyncio.run(stream_and_collect())
                place.markdown(full_response)
            except Exception as e:
                try:
                    full_response = asyncio.run(
                        st.session_state.agent.ask(query, st.session_state.messages[:-1])
                    )
                    place.markdown(full_response)
                except Exception as e2:
                    place.error(f"Error: {e2}")

        st.session_state.messages.append({"role": "assistant", "content": full_response})
        save_messages()
        st.rerun()

# Chat input
if prompt := st.chat_input("Pregúntame sobre fútbol..."):
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    with st.chat_message("assistant"):
        place = st.empty()
        place.markdown(TYPING_HTML, unsafe_allow_html=True)
        full_response = ""
        try:
            async def stream_and_collect():
                result = ""
                async for chunk in st.session_state.agent.ask_stream(prompt, st.session_state.messages[:-1]):
                    result += chunk
                    place.markdown(result + "▌")
                return result

            full_response = asyncio.run(stream_and_collect())
            place.markdown(full_response)
        except Exception as e:
            try:
                full_response = asyncio.run(
                    st.session_state.agent.ask(prompt, st.session_state.messages[:-1])
                )
                place.markdown(full_response)
            except Exception as e2:
                place.error(f"Error: {e2}")

    st.session_state.messages.append({"role": "assistant", "content": full_response})
    save_messages()
    st.rerun()

# Footer
st.markdown(
    '<div class="footer">⚽ Football Genius AI — La inteligencia artificial del fútbol mundial</div>',
    unsafe_allow_html=True,
)

st.markdown("""
<script>
// Autoscroll
function scrollToBottom() {
    const main = document.querySelector('[data-testid="stAppViewContainer"]');
    if (main) main.scrollTop = main.scrollHeight;
}
const observer = new MutationObserver(scrollToBottom);
observer.observe(document.body, { childList: true, subtree: true });

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl+Shift+N = new conversation
    if (e.ctrlKey && e.shiftKey && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        const btn = document.querySelector('button[kind="primary"]');
        if (btn) btn.click();
    }
    // / to focus search (only when not typing in input)
    if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tag = document.activeElement?.tagName?.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') {
            e.preventDefault();
            const searchInput = document.querySelector('[data-testid="stTextInput"] input');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
    }
    // Escape to blur
    if (e.key === 'Escape') {
        if (document.activeElement) document.activeElement.blur();
    }
});
</script>
""", unsafe_allow_html=True)
