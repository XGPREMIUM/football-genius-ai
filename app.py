import os, sys

app_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "football_ai")
sys.path.insert(0, app_dir)
os.chdir(app_dir)

from streamlit_app import *
