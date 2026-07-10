console.log('BPMN Viewer initialization script loading');

// Initialize a single .bpmn-diagram element (idempotent)
async function initBpmnElement(el) {
  if (!el || el.dataset.bpmnInitialized === 'true') return;

  const diagramPath = el.getAttribute('data-diagram-path');
  console.log('Loading BPMN diagram from path:', diagramPath, 'for element', el);

  if (!diagramPath) {
    console.warn('No data-diagram-path attribute found on element', el);
    el.dataset.bpmnInitialized = 'error';
    return;
  }

  try {
    const res = await fetch(diagramPath);
    if (!res.ok) throw new Error(`Failed to fetch BPMN XML (status ${res.status})`);
    const xml = await res.text();
    console.log('Fetched BPMN XML for', diagramPath);

    // Remove zoomScroll and moveCanvas modules to disable drag/zoom
    const viewer = new BpmnJS({
      container: el,
      keyboard: false,
      additionalModules: [
        {
          zoomScroll: ['value', null],
          moveCanvas: ['value', null]
        }
      ]
    });

    await viewer.importXML(xml);
    // Lock zoom to fit viewport
    const canvas = viewer.get('canvas');
    canvas.zoom('fit-viewport');
    // Hide the BPMN JS breadcrumbs (process id bullet)
    const breadcrumbs = el.querySelector('ul.bjs-breadcrumbs');
    if (breadcrumbs) breadcrumbs.style.display = 'none';

    el.dataset.bpmnInitialized = 'true';
    // Optionally store viewer reference for debugging
    el.__bpmnViewer = viewer;
    console.log('BPMN diagram initialized for', diagramPath);
  } catch (err) {
    console.error('Error initializing BPMN diagram for', diagramPath, err);
    // mark as error to avoid busy retry loops; change to allow retries if desired
    el.dataset.bpmnInitialized = 'error';
  }
}

// Scan the document for any .bpmn-diagram elements and initialize them (idempotent)
function scanAndInit() {
  console.log("Scanning for BPMN diagram elements");
  document.querySelectorAll('.bpmn-diagram').forEach(el => {
    // Kick off initialization but do not await all to avoid blocking
    console.log("Scanning BPMN diagram element:", el);
    initBpmnElement(el);
  });
}

// Debounce helper to avoid scanning too frequently during rapid DOM updates
function debounce(fn, wait = 100) {
  let t;
  return function(...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

const debouncedScanAndInit = debounce(scanAndInit, 100);

// Start on initial DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');
  scanAndInit();

  // Watch for dynamic page updates (e.g., SPA navigations, content replaced)
  const observer = new MutationObserver((mutations) => {
    // Only trigger scan when nodes are added or attributes changed
    const relevant = mutations.some(m => m.addedNodes.length > 0 || m.type === 'attributes');
    if (relevant) debouncedScanAndInit();
  });

  observer.observe(document.body, { childList: true, subtree: true, attributes: false });

  // Optionally expose a method to manually trigger a scan
  window.__triggerBpmnScan = scanAndInit;
});

console.log('BPMN Viewer initialization script loaded');
