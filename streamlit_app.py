from __future__ import annotations

import asyncio
import os

import streamlit as st

try:
    from agent import FootballGeniusAgent
    from prompts import MODE_DESCRIPTIONS, get_available_modes
    from config import settings
except ImportError:
    import sys
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from agent import FootballGeniusAgent
    from prompts import MODE_DESCRIPTIONS, get_available_modes
    from config import settings


st.set_page_config(
    page_title="Football Genius AI",
    page_icon="⚽",
    layout="wide",
    initial_sidebar_state="expanded",
)


def init_session():
    if "agent" not in st.session_state:
        st.session_state.agent = FootballGeniusAgent(mode="general")
    if "messages" not in st.session_state:
        st.session_state.messages = []
    if "current_mode" not in st.session_state:
        st.session_state.current_mode = "general"


def run_async(coro):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    return loop.run_until_complete(coro)


init_session()

# SIDEBAR
with st.sidebar:
    st.title("⚽ Football Genius AI")
    st.caption("\"No hablamos de fútbol. Vivimos dentro del fútbol.\"")

    st.divider()

    st.subheader("Modo de análisis")

    available_modes = get_available_modes()
    mode_options = {
        f"{icon} {name.replace('_', ' ').title()}": name
        for name, (icon, desc) in MODE_DESCRIPTIONS.items()
    }

    selected_label = st.selectbox(
        "Selecciona un modo:",
        options=list(mode_options.keys()),
        index=list(mode_options.values()).index(
            st.session_state.current_mode
        ) if st.session_state.current_mode in mode_options.values() else 0,
    )

    selected_mode = mode_options[selected_label]

    if selected_mode != st.session_state.current_mode:
        st.session_state.current_mode = selected_mode
        st.session_state.agent.reset_mode(selected_mode)
        st.session_state.messages = []
        st.rerun()

    st.divider()

    with st.expander("ℹ️ Modos disponibles", expanded=False):
        for name, (icon, desc) in MODE_DESCRIPTIONS.items():
            st.markdown(f"**{icon} {name.replace('_', ' ').title()}**: {desc}")

    st.divider()

    if st.button("🗑️ Nueva conversación", use_container_width=True):
        st.session_state.messages = []
        st.rerun()

    st.divider()
    st.caption(f"Modelo: `{settings.openrouter_model or settings.openai_model or settings.anthropic_model}`")
    st.caption(f"Proveedor: `{settings.ai_provider}`")


# MAIN CHAT
st.title("⚽ Football Genius AI")

mode_icon, mode_desc = MODE_DESCRIPTIONS.get(st.session_state.current_mode, ("", ""))
st.caption(f"**Modo activo:** {mode_icon} **{st.session_state.current_mode.upper()}** — {mode_desc}")

# Display messages
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

# Chat input
if prompt := st.chat_input("Pregúntame sobre fútbol..."):
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    with st.chat_message("assistant"):
        with st.spinner("Analizando..."):
            response = run_async(
                st.session_state.agent.ask(prompt)
            )
        st.markdown(response)
        st.session_state.messages.append({"role": "assistant", "content": response})
