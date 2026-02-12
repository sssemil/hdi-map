import { loadMapData } from './data-loader';
import { getColor, HDI_BINS, NO_DATA_COLOR } from './color-scale';
import { createMapRenderer, type MapRenderer } from './map-renderer';
import { formatTooltipContent } from './tooltip';
import { searchRegions, buildSearchIndex, type SearchIndex } from './region-search';
const DATA_URL = `${import.meta.env.BASE_URL}data/regions.topo.json`;

const createTooltipController = (container: HTMLElement) => {
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  tooltip.style.cssText =
    'position:absolute;pointer-events:none;opacity:0;transition:opacity 0.15s;' +
    'background:rgba(10,10,46,0.92);color:#e0e0e0;padding:10px 14px;border-radius:6px;' +
    'font-size:13px;line-height:1.5;max-width:280px;z-index:100;border:1px solid rgba(255,255,255,0.1);' +
    'box-shadow:0 4px 12px rgba(0,0,0,0.4)';
  container.appendChild(tooltip);

  return {
    show: (html: string, x: number, y: number): void => {
      tooltip.innerHTML = html;
      tooltip.style.opacity = '1';

      const containerRect = container.getBoundingClientRect();
      const tooltipWidth = tooltip.offsetWidth;
      const tooltipHeight = tooltip.offsetHeight;

      const left = x + 15 + tooltipWidth > containerRect.width
        ? x - tooltipWidth - 10
        : x + 15;
      const top = y + 15 + tooltipHeight > containerRect.height
        ? y - tooltipHeight - 10
        : y + 15;

      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
    },
    hide: (): void => {
      tooltip.style.opacity = '0';
    },
  };
};

const createLegend = (
  container: HTMLElement,
  onBinHover: (filter: { min: number; max: number } | null) => void
): void => {
  const legend = document.createElement('div');
  legend.className = 'legend';
  legend.style.cssText =
    'position:absolute;bottom:24px;left:24px;background:rgba(10,10,46,0.85);' +
    'padding:12px 16px;border-radius:8px;font-size:12px;color:#ccc;' +
    'border:1px solid rgba(255,255,255,0.1);z-index:50';

  const title = document.createElement('div');
  title.textContent = 'Human Development Index';
  title.style.cssText = 'font-weight:600;margin-bottom:8px;color:#e0e0e0;font-size:13px';
  legend.appendChild(title);

  HDI_BINS.forEach((bin) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:3px 0;cursor:pointer;border-radius:3px';

    const swatch = document.createElement('div');
    swatch.style.cssText = `width:16px;height:12px;background:${bin.color};border-radius:2px;flex-shrink:0`;

    const label = document.createElement('span');
    label.textContent = bin.label;

    row.appendChild(swatch);
    row.appendChild(label);

    row.addEventListener('mouseenter', () => {
      onBinHover({ min: bin.min, max: bin.max });
      row.style.background = 'rgba(255,255,255,0.08)';
    });
    row.addEventListener('mouseleave', () => {
      onBinHover(null);
      row.style.background = '';
    });

    legend.appendChild(row);
  });

  const noDataRow = document.createElement('div');
  noDataRow.style.cssText = 'display:flex;align-items:center;gap:8px;padding:3px 0;margin-top:4px;border-top:1px solid rgba(255,255,255,0.1);padding-top:6px';
  const noDataSwatch = document.createElement('div');
  noDataSwatch.style.cssText = `width:16px;height:12px;background:${NO_DATA_COLOR};border-radius:2px;flex-shrink:0`;
  const noDataLabel = document.createElement('span');
  noDataLabel.textContent = 'No data';
  noDataRow.appendChild(noDataSwatch);
  noDataRow.appendChild(noDataLabel);
  legend.appendChild(noDataRow);

  container.appendChild(legend);
};

const createSearchUI = (
  container: HTMLElement,
  index: SearchIndex,
  onSelect: (gdlCode: string) => void
): void => {
  const wrapper = document.createElement('div');
  wrapper.style.cssText =
    'position:absolute;top:16px;right:16px;z-index:50;width:260px';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Search regions...';
  input.style.cssText =
    'width:100%;padding:8px 12px;background:rgba(10,10,46,0.9);color:#e0e0e0;' +
    'border:1px solid rgba(255,255,255,0.15);border-radius:6px;font-size:14px;' +
    'outline:none;box-sizing:border-box';

  const dropdown = document.createElement('ul');
  dropdown.style.cssText =
    'list-style:none;margin:4px 0 0;padding:0;background:rgba(10,10,46,0.95);' +
    'border:1px solid rgba(255,255,255,0.15);border-radius:6px;max-height:300px;' +
    'overflow-y:auto;display:none';

  let debounceTimer: ReturnType<typeof setTimeout>;

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const query = input.value;
      const results = searchRegions({ query, index });

      dropdown.innerHTML = '';

      if (query.trim() === '') {
        dropdown.style.display = 'none';
        return;
      }

      if (results.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No regions found';
        li.style.cssText = 'padding:8px 12px;color:#888;font-style:italic;font-size:13px';
        dropdown.appendChild(li);
      } else {
        results.forEach((r) => {
          const li = document.createElement('li');
          li.textContent = r.label;
          li.style.cssText =
            'padding:8px 12px;cursor:pointer;font-size:13px;color:#ccc;border-bottom:1px solid rgba(255,255,255,0.05)';
          li.addEventListener('mouseenter', () => {
            li.style.background = 'rgba(255,255,255,0.08)';
          });
          li.addEventListener('mouseleave', () => {
            li.style.background = '';
          });
          li.addEventListener('click', () => {
            onSelect(r.gdlCode);
            input.value = r.label;
            dropdown.style.display = 'none';
          });
          dropdown.appendChild(li);
        });
      }

      dropdown.style.display = 'block';
    }, 50);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dropdown.style.display = 'none';
      input.blur();
    }
  });

  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target as Node)) {
      dropdown.style.display = 'none';
    }
  });

  document.addEventListener('keydown', (e) => {
    if ((e.key === '/' || (e.ctrlKey && e.key === 'k')) && document.activeElement !== input) {
      e.preventDefault();
      input.focus();
    }
  });

  wrapper.appendChild(input);
  wrapper.appendChild(dropdown);
  container.appendChild(wrapper);
};

const showLoadingState = (container: HTMLElement): HTMLElement => {
  const loading = document.createElement('div');
  loading.className = 'loading-state';
  loading.style.cssText =
    'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
    'height:100%;color:#888;font-size:16px;gap:12px';
  loading.innerHTML = `
    <div style="width:40px;height:40px;border:3px solid rgba(255,255,255,0.1);
      border-top-color:#cc4778;border-radius:50%;animation:spin 0.8s linear infinite"></div>
    <span>Loading map data...</span>
  `;

  const style = document.createElement('style');
  style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(style);

  container.appendChild(loading);
  return loading;
};

const showErrorState = (container: HTMLElement, message: string): void => {
  const error = document.createElement('div');
  error.className = 'error-state';
  error.style.cssText =
    'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
    'height:100%;color:#e0e0e0;font-size:16px;gap:12px;text-align:center;padding:2rem';
  error.innerHTML = `
    <div style="font-size:2rem">!</div>
    <h2 style="margin:0;font-size:1.2rem">Failed to load map</h2>
    <p style="color:#888;max-width:400px">${message}</p>
    <button onclick="location.reload()" style="padding:8px 20px;background:#cc4778;color:#fff;
      border:none;border-radius:6px;cursor:pointer;font-size:14px">Retry</button>
  `;
  container.appendChild(error);
};

export const initApp = async (container: HTMLElement): Promise<void> => {
  const mapContainer = container.querySelector<HTMLElement>('#map-container');
  if (!mapContainer) return;

  mapContainer.style.cssText = 'position:relative;width:100%;height:100%';

  const loading = showLoadingState(mapContainer);

  try {
    const { regions } = await loadMapData(DATA_URL);

    loading.remove();

    const tooltipController = createTooltipController(mapContainer);

    const renderer: MapRenderer = createMapRenderer({
      container: mapContainer,
      regions,
      getColor,
      onRegionHover: (feature, event) => {
        if (feature) {
          const rect = mapContainer.getBoundingClientRect();
          tooltipController.show(
            formatTooltipContent(feature.properties),
            event.clientX - rect.left,
            event.clientY - rect.top
          );
        } else {
          tooltipController.hide();
        }
      },
    });

    renderer.render();

    createLegend(mapContainer, (filter) => {
      renderer.highlightRegions(filter);
    });

    const searchableRegions = regions.map((f) => ({
      gdlCode: f.properties.gdlCode,
      name: f.properties.name,
      country: f.properties.country,
    }));
    const searchIndex = buildSearchIndex(searchableRegions);

    createSearchUI(mapContainer, searchIndex, (gdlCode) => {
      renderer.zoomToRegion(gdlCode);
      renderer.highlightSingle(gdlCode);
      setTimeout(() => renderer.highlightSingle(null), 3000);
    });

    window.addEventListener('resize', () => {
      renderer.resize();
    });
  } catch (error) {
    loading.remove();
    showErrorState(
      mapContainer,
      error instanceof Error ? error.message : 'An unexpected error occurred'
    );
  }
};
