"""Tic-Tac-Toe views (routes).

Serves the Tic-Tac-Toe game page. All game logic lives in the React island —
no database or API calls needed.
"""
from flask import Blueprint, render_template

tictactoe_bp = Blueprint('tictactoe', __name__)


@tictactoe_bp.route('/tictactoe')
def index():  # type: ignore[no-untyped-def]
    """Render the Tic-Tac-Toe page with React island mount point."""
    return render_template('tictactoe/index.html')
