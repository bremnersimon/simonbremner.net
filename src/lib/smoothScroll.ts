export function setupSmoothScroll() {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');

    if (anchor && anchor.getAttribute('href')?.startsWith('#')) {
      e.preventDefault();
      const targetId = anchor.getAttribute('href')?.substring(1);

      if (targetId) {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth'
          });

          // Optionally update URL without causing a page jump
          history.pushState(null, '', anchor.getAttribute('href'));
        }
      }
    }
  });
}