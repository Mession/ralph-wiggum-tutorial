"""Gomoku (Five in a Row) views (routes).

Serves the Gomoku game page. All game logic lives in the React island —
no database or API calls needed.
"""
from flask import Blueprint, render_template

gomoku_bp = Blueprint('gomoku', __name__)


@gomoku_bp.route('/gomoku')
def index():  # type: ignore[no-untyped-def]
    """Render the Gomoku page with React island mount point."""
    return render_template('gomoku/index.html')
