CUSTOM_CSS = """
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');

    * { font-family: 'Inter', -apple-system, sans-serif; }

    /* Main background */
    .stApp {
        background: #0d1117;
    }

    /* Chat messages */
    .stChatMessage {
        border-radius: 12px;
        margin: 8px 0;
    }

    [data-testid="stChatMessage"] {
        border-radius: 12px;
        padding: 16px 20px;
        animation: fadeIn 0.3s ease;
    }

    [data-testid="stChatMessage"] p {
        color: #e6edf3 !important;
        font-size: 15px;
        line-height: 1.6;
    }

    [data-testid="stChatMessage"] strong {
        color: #ffd700 !important;
    }

    [data-testid="stChatMessage"] code {
        background: #161b22;
        color: #ffa657;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 13px;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
    }

    /* User message */
    [data-testid="stChatMessage"]:has([data-testid="chatAvatarIcon-user"]) {
        background: #1a2e1a;
        border: 1px solid #2d5a3d;
    }

    /* Assistant message */
    [data-testid="stChatMessage"]:has([data-testid="chatAvatarIcon-assistant"]) {
        background: #161b22;
        border: 1px solid #30363d;
    }

    /* Sidebar */
    [data-testid="stSidebar"] {
        background: #0d1117;
        border-right: 1px solid #21262d;
    }

    [data-testid="stSidebar"] [data-testid="stMarkdown"] {
        color: #c9d1d9;
    }

    [data-testid="stSidebar"] .stButton button {
        font-size: 0.8rem;
        padding: 4px 8px;
        min-height: 30px;
    }

    [data-testid="stSidebar"] .sidebar-header {
        text-align: center;
        padding: 12px 0;
    }

    /* Headers */
    h1, h2, h3 {
        color: #ffd700 !important;
        font-weight: 700 !important;
        letter-spacing: -0.5px;
    }

    .stApp h1 {
        font-size: clamp(1.2rem, 4vw, 1.8rem) !important;
    }

    /* All text */
    .stMarkdown, p, li, span, div:not([data-testid]) {
        color: #e6edf3;
    }

    /* Buttons */
    .stButton button {
        background: linear-gradient(135deg, #ffd700, #daa520) !important;
        color: #0d1117 !important;
        font-weight: 600 !important;
        border: none !important;
        border-radius: 8px !important;
        transition: all 0.2s ease;
        font-size: 0.85rem;
    }

    .stButton button:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(255, 215, 0, 0.2);
    }

    .stButton button:active {
        transform: translateY(0);
    }

    .stButton button[kind="secondary"] {
        background: transparent !important;
        color: #ffd700 !important;
        border: 1px solid #30363d !important;
    }

    .stButton button[kind="secondary"]:hover {
        background: #161b22 !important;
        border-color: #ffd700 !important;
    }

    /* Select box */
    [data-testid="stSelectbox"] label {
        color: #ffd700 !important;
        font-weight: 600;
    }

    [data-testid="stSelectbox"] div[data-baseweb="select"] {
        background: #161b22;
        border: 1px solid #30363d;
        border-radius: 8px;
        color: #e6edf3;
    }

    /* Dividers */
    hr {
        border-color: #21262d !important;
        margin: 12px 0 !important;
    }

    /* Chat input */
    [data-testid="stChatInput"] {
        border: 1px solid #30363d !important;
        border-radius: 12px !important;
        background: #161b22 !important;
        color: #e6edf3 !important;
        transition: border-color 0.2s ease;
    }

    [data-testid="stChatInput"]:focus {
        border-color: #ffd700 !important;
        box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.1);
    }

    [data-testid="stChatInput"] textarea::placeholder {
        color: #8b949e !important;
    }

    /* Captions */
    .stCaption {
        color: #8b949e !important;
    }

    /* Expander */
    [data-testid="stExpander"] {
        background: #161b22;
        border: 1px solid #21262d;
        border-radius: 8px;
        margin: 8px 0;
    }

    [data-testid="stExpander"] details summary {
        font-size: 0.85rem;
        font-weight: 600;
        color: #c9d1d9;
    }

    [data-testid="stExpander"] details {
        color: #c9d1d9;
    }

    /* Status/Spinner */
    .stSpinner {
        color: #ffd700 !important;
    }

    /* Alert boxes */
    .stAlert {
        background: #161b22 !important;
        border: 1px solid #30363d !important;
        color: #e6edf3 !important;
        border-radius: 8px !important;
    }

    .stAlert p { color: #e6edf3 !important; }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #0d1117; }
    ::-webkit-scrollbar-thumb { background: #30363d; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #484f58; }

    /* Metric cards */
    [data-testid="stMetric"] {
        background: #161b22;
        border: 1px solid #21262d;
        border-radius: 8px;
        padding: 12px;
    }

    [data-testid="stMetric"] label { color: #8b949e !important; font-weight: 500; }
    [data-testid="stMetric"] [data-testid="stMetricValue"] { color: #ffd700 !important; font-weight: 700; }

    /* Footer */
    .footer {
        text-align: center;
        color: #484f58;
        font-size: 0.7rem;
        padding: 16px 0 8px 0;
        border-top: 1px solid #21262d;
        margin-top: 24px;
    }

    /* Badge */
    .badge {
        display: inline-block;
        background: linear-gradient(135deg, #ffd700, #daa520);
        color: #0d1117;
        font-size: 0.7rem;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 4px;
        margin-left: 6px;
    }

    /* Mode indicator */
    .mode-indicator {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #161b22;
        border: 1px solid #30363d;
        border-radius: 20px;
        padding: 4px 14px;
        font-size: 0.78rem;
        color: #c9d1d9;
    }

    /* Download button */
    .stDownloadButton button {
        background: #21262d !important;
        color: #c9d1d9 !important;
        border: 1px solid #30363d !important;
        font-size: 0.8rem !important;
    }

    .stDownloadButton button:hover {
        background: #30363d !important;
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
        .stApp h1 { font-size: 1.1rem !important; }
        [data-testid="stSidebar"] { min-width: 220px !important; max-width: 280px !important; }
        [data-testid="stChatMessage"] { padding: 12px 14px !important; }
        [data-testid="stChatMessage"] p { font-size: 14px !important; }
        .mode-indicator { font-size: 0.68rem !important; padding: 2px 10px !important; }
    }

    /* Avatars */
    [data-testid="chatAvatarIcon-user"] {
        background: #2d5a3d !important;
        color: #e6edf3 !important;
        font-weight: 700;
    }

    [data-testid="chatAvatarIcon-assistant"] {
        background: linear-gradient(135deg, #ffd700, #daa520) !important;
        color: #0d1117 !important;
        font-weight: 700;
    }

    /* Radio buttons */
    [data-testid="stRadio"] label { color: #c9d1d9 !important; }

    /* Text input */
    [data-testid="stTextInput"] input {
        background: #161b22 !important;
        border: 1px solid #30363d !important;
        border-radius: 8px !important;
        color: #e6edf3 !important;
    }

    [data-testid="stTextInput"] input:focus {
        border-color: #ffd700 !important;
    }

    [data-testid="stTextInput"] label { color: #8b949e !important; }

    /* Column padding */
    [data-testid="stSidebar"] [data-testid="column"] { padding: 0 2px !important; }

    /* Links */
    a { color: #58a6ff !important; }
    a:hover { color: #79c0ff !important; }

    /* Chat container */
    .stChatFloatingInputContainer {
        background: #0d1117 !important;
        border-top: 1px solid #21262d !important;
        padding: 12px 0 !important;
    }

    /* Markdown tables in chat */
    [data-testid="stChatMessage"] table {
        border-collapse: collapse;
        margin: 8px 0;
        width: 100%;
    }

    [data-testid="stChatMessage"] th, [data-testid="stChatMessage"] td {
        border: 1px solid #30363d;
        padding: 8px 12px;
        text-align: left;
    }

    [data-testid="stChatMessage"] th {
        background: #161b22;
        color: #ffd700;
        font-weight: 600;
    }

    [data-testid="stChatMessage"] td {
        color: #e6edf3;
    }

    /* Lists in chat */
    [data-testid="stChatMessage"] ul, [data-testid="stChatMessage"] ol {
        padding-left: 20px;
    }

    [data-testid="stChatMessage"] li {
        color: #e6edf3;
        margin: 4px 0;
    }

    /* Typing indicator */
    .typing-indicator {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 12px 0;
    }
    .typing-indicator::before {
        content: "🧠 Analizando";
        color: #8b949e;
        font-size: 13px;
        font-style: italic;
        margin-right: 8px;
    }
    .typing-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #ffd700;
        animation: typingBounce 1.4s infinite;
        opacity: 0.3;
    }
    .typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .typing-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes typingBounce {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
        30% { transform: translateY(-4px); opacity: 1; }
    }

    /* Toast for keyboard shortcuts */
    .toast {
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: #161b22;
        border: 1px solid #30363d;
        border-radius: 8px;
        padding: 10px 18px;
        color: #c9d1d9;
        font-size: 13px;
        z-index: 9999;
        animation: toastIn 0.3s ease, toastOut 0.3s 2s ease forwards;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    }
    @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
    @keyframes toastOut { from { opacity: 1; } to { opacity: 0; transform: translateX(-50%) translateY(-10px); } }

    /* Landing page */
    .landing { max-width: 800px; margin: 20px auto 0; padding: 0 16px; }
    .landing-hero { text-align: center; padding: 20px 0 0; }
    .landing-badge {
        display: inline-block;
        background: linear-gradient(135deg,#ffd700,#daa520);
        color: #0d1117;
        font-size: 11px;
        font-weight: 700;
        padding: 4px 14px;
        border-radius: 20px;
        letter-spacing: 0.5px;
        margin-bottom: 12px;
    }
    .landing-title {
        font-size: clamp(1.8rem,5vw,2.6rem) !important;
        font-weight: 800 !important;
        margin: 8px 0 !important;
        line-height: 1.2;
    }
    .landing-subtitle {
        font-size: clamp(1rem,2.5vw,1.3rem);
        color: #8b949e;
        margin: 4px 0;
    }
    .landing-desc {
        font-size: 14px;
        color: #8b949e;
        max-width: 500px;
        margin: 10px auto 0;
        line-height: 1.5;
    }
    .landing-stats {
        display: flex;
        justify-content: center;
        gap: 24px;
        margin: 24px 0;
        flex-wrap: wrap;
    }
    .landing-stat {
        background: #161b22;
        border: 1px solid #21262d;
        border-radius: 12px;
        padding: 14px 22px;
        text-align: center;
        min-width: 80px;
    }
    .landing-stat-val { display: block; font-size: 1.4rem; font-weight: 700; color: #ffd700; }
    .landing-stat-lbl { display: block; font-size: 11px; color: #8b949e; margin-top: 2px; }
    .landing-features {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 12px;
        margin: 24px 0;
    }
    .landing-card {
        background: #161b22;
        border: 1px solid #21262d;
        border-radius: 12px;
        padding: 16px 14px;
        text-align: center;
        transition: all 0.2s;
    }
    .landing-card:hover { border-color: #ffd700; transform: translateY(-2px); }
    .landing-card-icon { font-size: 1.5rem; display: block; margin-bottom: 6px; }
    .landing-card h3 { font-size: 13px !important; margin: 0 0 4px !important; color: #e6edf3 !important; }
    .landing-card p { font-size: 11px; color: #8b949e; margin: 0; }
    .landing-cta { text-align: center; margin: 16px 0 32px; }
    .landing-cta p { font-size: 14px; color: #c9d1d9; margin-bottom: 10px; }
    .landing-start-btn {
        background: linear-gradient(135deg,#ffd700,#daa520);
        color: #0d1117;
        border: none;
        border-radius: 12px;
        padding: 12px 28px;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 4px 20px rgba(255,215,0,0.2);
    }
    .landing-start-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 30px rgba(255,215,0,0.4); }
    .landing-chips {
        display: flex;
        justify-content: center;
        gap: 8px;
        flex-wrap: wrap;
    }
    .landing-chip {
        background: #21262d;
        border: 1px solid #30363d;
        border-radius: 20px;
        padding: 6px 14px;
        font-size: 12px;
        color: #c9d1d9;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
    }
    .landing-chip:hover { border-color: #ffd700; color: #ffd700; background: #161b22; }

    /* Floating agent icon */
    .agent-float {
        position: fixed;
        bottom: 80px;
        right: 20px;
        z-index: 9999;
        cursor: pointer;
    }
    .agent-float-btn {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: linear-gradient(135deg, #ffd700, #daa520);
        border: none;
        font-size: 24px;
        box-shadow: 0 4px 20px rgba(255,215,0,0.3);
        cursor: pointer;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: floatPulse 2s infinite;
    }
    .agent-float-btn:hover { transform: scale(1.1); box-shadow: 0 6px 30px rgba(255,215,0,0.5); }
    @keyframes floatPulse {
        0%, 100% { box-shadow: 0 4px 20px rgba(255,215,0,0.3); }
        50% { box-shadow: 0 4px 30px rgba(255,215,0,0.6); }
    }
    .agent-float-tooltip {
        position: absolute;
        bottom: 60px;
        right: 4px;
        background: #161b22;
        border: 1px solid #30363d;
        border-radius: 10px;
        padding: 8px 12px;
        font-size: 11px;
        color: #c9d1d9;
        white-space: nowrap;
        animation: tooltipIn 0.3s ease;
        display: none;
    }
    .agent-float:hover .agent-float-tooltip { display: block; }
    @keyframes tooltipIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

    /* Hide empty toggle columns on landing */
    .landing + div [data-testid="column"]:has(.stButton) { display: none; }

    /* Hide activate_chat button (JS trigger only) */
    button[kind="secondary"]:has(~ div .landing) { display: none; }
</style>
"""

LIGHT_CSS = """
<style>
    .stApp {
        background: linear-gradient(135deg, #f0f4f8 0%, #ffffff 100%);
    }
    [data-testid="stSidebar"] {
        background: linear-gradient(180deg, #ffffff 0%, #f0f4f8 100%);
        border-right: 1px solid #d0d8e0;
    }
    [data-testid="stChatMessage"]:has([data-testid="chatAvatarIcon-user"]) {
        background: linear-gradient(135deg, #e8f4e8, #d0e8d0);
        border: 1px solid #a0c0a0;
    }
    [data-testid="stChatMessage"]:has([data-testid="chatAvatarIcon-assistant"]) {
        background: linear-gradient(135deg, #e8eef4, #d0dce8);
        border: 1px solid #a0b8d0;
    }
</style>
"""
