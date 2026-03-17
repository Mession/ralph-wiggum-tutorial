import { createRoot } from 'react-dom/client';
import GomokuIsland from './GomokuIsland';

export function mount(element: HTMLElement, _props: unknown): void {
  element.innerHTML = '';
  createRoot(element).render(<GomokuIsland />);
}
