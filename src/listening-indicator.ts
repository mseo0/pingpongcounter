/**
 * Updates the listening indicator element's visual state.
 * @param element - The HTMLElement representing the listening indicator
 * @param listening - Whether the app is currently listening
 */
export function updateListeningIndicator(element: HTMLElement, listening: boolean): void {
  if (listening) {
    element.classList.add('listening-active');
    element.classList.remove('listening-inactive');
    element.setAttribute('aria-label', 'Listening');
  } else {
    element.classList.add('listening-inactive');
    element.classList.remove('listening-active');
    element.setAttribute('aria-label', 'Not listening');
  }
}
