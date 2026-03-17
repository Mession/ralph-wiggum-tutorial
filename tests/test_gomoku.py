"""Tests for the Gomoku route.

Verifies the page loads, contains the expected title,
and includes the React island mount point for hydration.
"""
from typing import Any


class TestGomokuPage:
    def test_gomoku_returns_200(self, client: Any) -> None:
        response = client.get('/gomoku')
        assert response.status_code == 200

    def test_gomoku_contains_title(self, client: Any) -> None:
        response = client.get('/gomoku')
        assert b'Gomoku' in response.data

    def test_gomoku_has_island_mount_point(self, client: Any) -> None:
        response = client.get('/gomoku')
        assert b'data-island="gomoku"' in response.data
