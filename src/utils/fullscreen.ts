export const toggleFullscreen = (element: HTMLElement) => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      element.requestFullscreen()
    }
  }