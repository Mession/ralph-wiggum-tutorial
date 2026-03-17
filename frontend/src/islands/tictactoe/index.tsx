import { createRoot } from 'react-dom/client';
import TicTacToeIsland from './TicTacToeIsland';

export function mount(element: HTMLElement, _props: unknown): void {
  element.innerHTML = '';
  createRoot(element).render(<TicTacToeIsland />);
}
