import { loadMapData } from './data-loader';
import { createColorScale, NO_DATA_COLOR, HDI_BIN_DEFINITIONS, type Bin } from './color-scale';
import { createMapRenderer, type MapRenderer } from './map-renderer';
import { formatTooltipContent } from './tooltip';
import { searchRegions, buildSearchIndex, type SearchIndex } from './region-search';
import { PALETTES, DEFAULT_PALETTE_ID, getPaletteById, type PaletteId } from './palette-registry';
import { getRegionSource } from './region-supplements';
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
  legendTitle: string,
  bins: readonly Bin[],
  onBinHover: (filter: { min: number; max: number } | null) => void
): HTMLElement => {
  const legend = document.createElement('div');
  legend.className = 'legend';
  legend.style.cssText =
    'position:absolute;bottom:24px;left:24px;background:rgba(10,10,46,0.85);' +
    'padding:12px 16px;border-radius:8px;font-size:12px;color:#ccc;' +
    'border:1px solid rgba(255,255,255,0.1);z-index:50';

  const title = document.createElement('div');
  title.textContent = legendTitle;
  title.style.cssText = 'font-weight:600;margin-bottom:8px;color:#e0e0e0;font-size:13px';
  legend.appendChild(title);

  bins.forEach((bin) => {
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
  return legend;
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

const createPalettePicker = (
  container: HTMLElement,
  onChange: (paletteId: PaletteId) => void
): void => {
  const wrapper = document.createElement('div');
  wrapper.style.cssText =
    'position:absolute;top:16px;left:16px;z-index:50';

  const select = document.createElement('select');
  select.style.cssText =
    'padding:6px 10px;background:rgba(10,10,46,0.9);color:#e0e0e0;' +
    'border:1px solid rgba(255,255,255,0.15);border-radius:6px;font-size:13px;' +
    'cursor:pointer;outline:none';

  PALETTES.forEach((p) => {
    const option = document.createElement('option');
    option.value = p.id;
    option.textContent = p.label;
    option.selected = p.id === DEFAULT_PALETTE_ID;
    select.appendChild(option);
  });

  select.addEventListener('change', () => {
    onChange(select.value as PaletteId);
  });

  wrapper.appendChild(select);
  container.appendChild(wrapper);
};

const createInfoPanel = (container: HTMLElement): void => {
  const overlay = document.createElement('div');
  overlay.className = 'info-overlay';
  overlay.style.cssText =
    'display:none;position:absolute;inset:0;background:rgba(0,0,0,0.5);z-index:200;' +
    'align-items:center;justify-content:center';

  const panel = document.createElement('div');
  panel.className = 'info-panel';
  panel.style.cssText =
    'background:rgba(10,10,46,0.95);color:#e0e0e0;padding:24px 28px;border-radius:10px;' +
    'max-width:420px;width:90%;border:1px solid rgba(255,255,255,0.15);' +
    'box-shadow:0 8px 32px rgba(0,0,0,0.6);font-size:13px;line-height:1.6';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '\u00d7';
  closeBtn.style.cssText =
    'float:right;background:none;border:none;color:#888;font-size:22px;cursor:pointer;' +
    'padding:0 0 0 12px;line-height:1';

  const title = document.createElement('h3');
  title.textContent = 'Data Sources';
  title.style.cssText = 'margin:0 0 14px;font-size:15px;color:#fff';

  const content = document.createElement('div');
  content.innerHTML = [
    '<div style="margin-bottom:10px"><strong>HDI Data</strong><br>Global Data Lab, Subnational HDI v8.3<br>' +
      '<span style="color:#888">Zenodo DOI: 10.5281/zenodo.17467221</span></div>',
    '<div style="margin-bottom:10px"><strong>Boundaries</strong><br>GDL Shapefiles V6.5</div>',
    '<div style="margin-bottom:10px"><strong>Supplemental HDI</strong><br>' +
      'Taiwan: DGBAS (Statistics Bureau)<br>' +
      'Hong Kong, San Marino: UNDP HDR<br>' +
      '<span style="color:#888">HDI calculated per UNDP methodology</span></div>',
    '<div style="margin-bottom:10px"><strong>Projection</strong><br>Robinson (via d3-geo-projection)</div>',
    '<div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:10px;margin-top:10px;color:#888;font-size:12px">' +
      'Data provided for non-commercial use.<br>Attribution: Global Data Lab.</div>',
  ].join('');

  panel.appendChild(closeBtn);
  panel.appendChild(title);
  panel.appendChild(content);
  overlay.appendChild(panel);
  container.appendChild(overlay);

  const button = document.createElement('button');
  button.className = 'info-button';
  button.textContent = 'i';
  button.style.cssText =
    'position:absolute;bottom:24px;right:24px;z-index:50;width:32px;height:32px;' +
    'border-radius:50%;background:rgba(10,10,46,0.85);color:#e0e0e0;border:1px solid rgba(255,255,255,0.15);' +
    'font-size:16px;font-style:italic;font-family:Georgia,serif;cursor:pointer;' +
    'display:flex;align-items:center;justify-content:center';
  container.appendChild(button);

  const toggleOverlay = (show: boolean): void => {
    overlay.style.display = show ? 'flex' : 'none';
  };

  button.addEventListener('click', () => toggleOverlay(true));
  closeBtn.addEventListener('click', () => toggleOverlay(false));
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) toggleOverlay(false);
  });
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

    let currentScale = createColorScale({
      interpolator: getPaletteById(DEFAULT_PALETTE_ID).interpolator,
      binDefinitions: HDI_BIN_DEFINITIONS,
    });

    const tooltipController = createTooltipController(mapContainer);

    const regionMap = new Map(regions.map((r) => [r.properties.gdlCode, r.properties]));
    const hdiGetValue = (_gdlCode: string, _countryIso: string): number | null =>
      regionMap.get(_gdlCode)?.hdi ?? null;

    const renderer: MapRenderer = createMapRenderer({
      container: mapContainer,
      regions,
      getColor: currentScale.getColor,
      getValue: hdiGetValue,
      onRegionHover: (feature, event) => {
        if (feature) {
          const rect = mapContainer.getBoundingClientRect();
          tooltipController.show(
            formatTooltipContent(feature.properties, getRegionSource(feature.properties.gdlCode)),
            event.clientX - rect.left,
            event.clientY - rect.top
          );
        } else {
          tooltipController.hide();
        }
      },
    });

    renderer.render();

    const onBinHover = (filter: { min: number; max: number } | null): void => {
      renderer.highlightRegions(filter);
    };

    let legendElement = createLegend(mapContainer, 'Human Development Index', currentScale.bins, onBinHover);

    createPalettePicker(mapContainer, (paletteId) => {
      const palette = getPaletteById(paletteId);
      currentScale = createColorScale({ interpolator: palette.interpolator, binDefinitions: HDI_BIN_DEFINITIONS });
      renderer.updateColors(currentScale.getColor);
      legendElement.remove();
      legendElement = createLegend(mapContainer, 'Human Development Index', currentScale.bins, onBinHover);
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

    createInfoPanel(mapContainer);

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
