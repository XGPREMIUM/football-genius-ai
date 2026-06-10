CUSTOM_CSS = """
<style>
    /* Main background */
    .stApp {
        background: linear-gradient(135deg, #0a1628 0%, #1a2a3a 100%);
    }

    /* Chat messages */
    .stChatMessage {
        border-radius: 12px;
        margin: 8px 0;
    }

    [data-testid="stChatMessage"] {
        border-radius: 12px;
        padding: 12px 16px;
        animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
    }

    /* User message */
    [data-testid="stChatMessage"]:has([data-testid="chatAvatarIcon-user"]) {
        background: linear-gradient(135deg, #1a3a2a, #0d2818);
        border: 1px solid #2d5a3d;
    }

    /* Assistant message */
    [data-testid="stChatMessage"]:has([data-testid="chatAvatarIcon-assistant"]) {
        background: linear-gradient(135deg, #1a2a3a, #0d1a28);
        border: 1px solid #2d4a6a;
    }

    /* Sidebar */
    [data-testid="stSidebar"] {
        background: linear-gradient(180deg, #0a1628 0%, #0f1f2f 100%);
        border-right: 1px solid #1a3a5a;
    }

    [data-testid="stSidebar"] [data-testid="stMarkdown"] {
        color: #e0e8f0;
    }

    /* Sidebar button styling */
    [data-testid="stSidebar"] .stButton button {
        font-size: 0.8rem;
        padding: 4px 8px;
        min-height: 30px;
    }

    /* Headers */
    h1, h2, h3 {
        color: #ffd700 !important;
        font-weight: 700 !important;
    }

    .stApp h1 {
        font-size: clamp(1.2rem, 4vw, 2rem) !important;
    }

    /* Buttons */
    .stButton button {
        background: linear-gradient(135deg, #ffd700, #ffaa00) !important;
        color: #0a1628 !important;
        font-weight: 700 !important;
        border: none !important;
        border-radius: 8px !important;
        transition: all 0.3s ease;
        font-size: 0.85rem;
    }

    .stButton button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
    }

    .stButton button:active {
        transform: translateY(0);
    }

    /* Secondary buttons */
    .stButton button[kind="secondary"] {
        background: transparent !important;
        color: #ffd700 !important;
        border: 1px solid #ffd700 !important;
    }

    .stButton button[kind="secondary"]:hover {
        background: rgba(255, 215, 0, 0.1) !important;
    }

    /* Select box */
    [data-testid="stSelectbox"] label {
        color: #ffd700 !important;
    }

    [data-testid="stSelectbox"] div[data-baseweb="select"] {
        background: #1a2a3a;
        border: 1px solid #2d4a6a;
        border-radius: 8px;
    }

    /* Dividers */
    hr {
        border-color: #1a3a5a !important;
        margin: 12px 0 !important;
    }

    /* Chat input */
    [data-testid="stChatInput"] {
        border: 1px solid #2d4a6a !important;
        border-radius: 12px !important;
        background: #1a2a3a !important;
        transition: border-color 0.3s ease;
    }

    [data-testid="stChatInput"]:focus {
        border-color: #ffd700 !important;
        box-shadow: 0 0 10px rgba(255, 215, 0, 0.15);
    }

    /* Captions */
    .stCaption {
        color: #8a9aa8 !important;
    }

    /* Expander */
    [data-testid="stExpander"] {
        background: #1a2a3a;
        border: 1px solid #2d4a6a;
        border-radius: 8px;
        margin: 8px 0;
    }

    [data-testid="stExpander"] details summary {
        font-size: 0.85rem;
        font-weight: 600;
    }

    /* Status */
    .stSpinner {
        color: #ffd700 !important;
    }

    /* Success/Info boxes */
    .stAlert {
        background: #1a2a3a !important;
        border: 1px solid #2d4a6a !important;
        color: #e0e8f0 !important;
        border-radius: 8px !important;
    }

    /* Scrollbar */
    ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
    }

    ::-webkit-scrollbar-track {
        background: #0a1628;
    }

    ::-webkit-scrollbar-thumb {
        background: #2d4a6a;
        border-radius: 3px;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: #3a5a7a;
    }

    /* Metric cards */
    [data-testid="stMetric"] {
        background: #1a2a3a;
        border: 1px solid #2d4a6a;
        border-radius: 8px;
        padding: 12px;
    }

    [data-testid="stMetric"] label {
        color: #8a9aa8 !important;
    }

    [data-testid="stMetric"] [data-testid="stMetricValue"] {
        color: #ffd700 !important;
    }

    /* Footer */
    .footer {
        text-align: center;
        color: #4a5a6a;
        font-size: 0.7rem;
        padding: 16px 0 8px 0;
        border-top: 1px solid #1a3a5a;
        margin-top: 24px;
    }

    /* Badge */
    .badge {
        display: inline-block;
        background: linear-gradient(135deg, #ffd700, #ffaa00);
        color: #0a1628;
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
        background: #1a2a3a;
        border: 1px solid #2d4a6a;
        border-radius: 20px;
        padding: 4px 12px;
        font-size: 0.75rem;
        color: #e0e8f0;
    }

    /* Download button */
    .stDownloadButton button {
        background: linear-gradient(135deg, #2d4a6a, #1a3a5a) !important;
        color: #e0e8f0 !important;
        border: 1px solid #3a5a7a !important;
        font-size: 0.8rem !important;
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
        .stApp h1 {
            font-size: 1.1rem !important;
        }
        [data-testid="stSidebar"] {
            min-width: 200px !important;
            max-width: 280px !important;
        }
        [data-testid="stChatMessage"] {
            padding: 8px 12px !important;
        }
        .mode-indicator {
            font-size: 0.65rem !important;
            padding: 2px 8px !important;
        }
    }

    /* Image avatars in chat */
    [data-testid="chatAvatarIcon-user"] {
        background: linear-gradient(135deg, #2d5a3d, #1a3a2a) !important;
    }

    [data-testid="chatAvatarIcon-assistant"] {
        background: linear-gradient(135deg, #ffd700, #ffaa00) !important;
        color: #0a1628 !important;
    }

    /* Radio buttons */
    [data-testid="stRadio"] label {
        color: #e0e8f0 !important;
    }

    /* Text input for search */
    [data-testid="stTextInput"] input {
        background: #1a2a3a !important;
        border: 1px solid #2d4a6a !important;
        border-radius: 8px !important;
        color: #e0e8f0 !important;
    }

    [data-testid="stTextInput"] input:focus {
        border-color: #ffd700 !important;
    }

    /* Columns in sidebar for conv buttons */
    [data-testid="stSidebar"] [data-testid="column"] {
        padding: 0 2px !important;
    }
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
