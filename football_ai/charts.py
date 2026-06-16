from __future__ import annotations

import streamlit as st
from db import get_player


def show_player_radar(player_name: str):
    p = get_player(player_name)
    if not p:
        st.caption("Jugador no encontrado")
        return

    stats = {
        "Goles": min((p.get("career_goals") or 0) / 9, 100),
        "Asistencias": min((p.get("career_assists") or 0) / 3, 100),
        "Balones de Oro": min((p.get("ballon_dors") or 0) * 25, 100),
        "Mundiales": min((p.get("world_cups") or 0) * 33, 100),
        "Champions": min((p.get("champions_league") or 0) * 20, 100),
        "Caps": min((p.get("caps") or 0) / 2, 100),
    }

    col1, col2 = st.columns([1, 3])
    with col1:
        st.metric("Goles", p.get("career_goals") or 0)
        st.metric("Asistencias", p.get("career_assists") or 0)
        st.metric("Balones de Oro", p.get("ballon_dors") or 0)
    with col2:
        chart_data = {"Atributo": list(stats.keys()), "Valor": list(stats.values())}
        st.bar_chart(chart_data, x="Atributo", y="Valor", height=250)

    st.caption(f"{p['name']} — {p['nationality']} | {p['position']}")
    if p.get("description"):
        st.markdown(f"_{p['description']}_")


def show_comparison(player_a: str, player_b: str):
    pa = get_player(player_a)
    pb = get_player(player_b)
    if not pa or not pb:
        st.caption("No se encontraron ambos jugadores")
        return

    cols = st.columns(2)
    for i, (p, name) in enumerate([(pa, player_a), (pb, player_b)]):
        with cols[i]:
            st.markdown(f"**{p.get('name', name)}**")
            st.metric("Goles", p.get("career_goals") or 0)
            st.metric("Asistencias", p.get("career_assists") or 0)
            st.metric("BdO", p.get("ballon_dors") or 0)
            st.metric("Mundiales", p.get("world_cups") or 0)
            st.metric("Champions", p.get("champions_league") or 0)
