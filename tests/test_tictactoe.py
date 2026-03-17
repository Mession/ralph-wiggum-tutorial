"""Tests for the Tic-Tac-Toe route.

Verifies the page loads, contains the expected title,
and includes the React island mount point for hydration.
"""
from typing import Any


class TestTicTacToePage:
    def test_index_returns_200(self, client: Any) -> None:
        response = client.get('/tictactoe')
        assert response.status_code == 200

    def test_index_returns_html(self, client: Any) -> None:
        response = client.get('/tictactoe')
        assert b'Tic-Tac-Toe' in response.data

    def test_index_has_island_mount_point(self, client: Any) -> None:
        response = client.get('/tictactoe')
        assert b'data-island="tictactoe"' in response.data
