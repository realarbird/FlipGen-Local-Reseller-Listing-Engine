const STORAGE_KEY = 'flipgen_sales_archive';

const DEFAULT_ARCHIVE = [
  {
    id: 'specimen-98-w42',
    specimen: '#98-W42',
    title: 'Vintage 1998 Sony Walkman WM-FX195 Radio Cassette Player',
    condition: 'Good / Gently Used',
    niche: 'Consumer Electronics',
    cogs: 6.00,
    price: 48.00,
    profit: 36.80,
    roi: 87.5,
    savedAt: '2026-10-18T22:15:00.000Z',
    status: 'Ready to List',
    ebayTitle: 'Vintage 1998 Sony Walkman WM-FX195 Cassette Player AM FM Radio Tested OEM Clip',
    poshTitle: 'Sony 1998 Vintage Walkman Tape Player • Retro 90s Aesthetic',
    mercariTitle: 'Sony Walkman WM-FX195 Cassette Player (Fully Tested + Clip)'
  }
];

export function getArchiveItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ARCHIVE));
      return DEFAULT_ARCHIVE;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_ARCHIVE;
  } catch (e) {
    return DEFAULT_ARCHIVE;
  }
}

export function saveItemToArchive(item) {
  try {
    const current = getArchiveItems();
    const newItem = {
      id: `specimen-${Date.now()}`,
      specimen: item.specimen || `#${Math.floor(10 + Math.random() * 89)}-${(item.niche || 'SPEC').slice(0, 3).toUpperCase()}`,
      title: item.title || item.name || 'Untitled Specimen',
      condition: item.condition || 'Pre-owned',
      niche: item.niche || 'General Merchandise',
      cogs: parseFloat(item.cogs || item.cost || 0),
      price: parseFloat(item.price || 0),
      profit: parseFloat(item.profit || 0),
      roi: parseFloat(item.roi || 0),
      savedAt: new Date().toISOString(),
      status: 'Archived / Listed',
      ebayTitle: item.ebayTitle || '',
      poshTitle: item.poshTitle || '',
      mercariTitle: item.mercariTitle || ''
    };

    const updated = [newItem, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('flipgen_ledger_updated', { detail: updated }));
    }
    return newItem;
  } catch (e) {
    return null;
  }
}

export function removeArchiveItem(id) {
  try {
    const current = getArchiveItems();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('flipgen_ledger_updated', { detail: updated }));
    }
    return updated;
  } catch (e) {
    return [];
  }
}

export function clearArchive() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('flipgen_ledger_updated', { detail: [] }));
    }
    return [];
  } catch (e) {
    return [];
  }
}

export function exportArchiveToCSV() {
  const items = getArchiveItems();
  const headers = ['Specimen ID', 'Working Title', 'Niche Category', 'Condition', 'COGS ($)', 'Target Price ($)', 'Est. Net Profit ($)', 'Est. ROI (%)', 'Saved Date', 'Status', 'eBay Title', 'Poshmark Title', 'Mercari Title'];
  
  const rows = items.map(item => [
    `"${item.specimen || ''}"`,
    `"${(item.title || '').replace(/"/g, '""')}"`,
    `"${(item.niche || '').replace(/"/g, '""')}"`,
    `"${(item.condition || '').replace(/"/g, '""')}"`,
    (parseFloat(item.cogs) || 0).toFixed(2),
    (parseFloat(item.price) || 0).toFixed(2),
    (parseFloat(item.profit) || 0).toFixed(2),
    (parseFloat(item.roi) || 0).toFixed(1),
    `"${item.savedAt ? new Date(item.savedAt).toLocaleDateString() : ''}"`,
    `"${item.status || ''}"`,
    `"${(item.ebayTitle || '').replace(/"/g, '""')}"`,
    `"${(item.poshTitle || '').replace(/"/g, '""')}"`,
    `"${(item.mercariTitle || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `FlipGen_Ledger_Export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function syncLocalWithCloudArchive(cloudItems) {
  try {
    if (!Array.isArray(cloudItems)) return getArchiveItems();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudItems));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('flipgen_ledger_updated', { detail: cloudItems }));
    }
    return cloudItems;
  } catch (e) {
    return getArchiveItems();
  }
}

export function importArchiveItemsFromCloud(cloudItems) {
  try {
    if (!Array.isArray(cloudItems)) return getArchiveItems();
    const current = getArchiveItems();

    if (current.length === 1 && current[0].id === 'specimen-98-w42' && cloudItems.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudItems));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('flipgen_ledger_updated', { detail: cloudItems }));
      }
      return cloudItems;
    }

    const itemMap = new Map();
    for (const item of cloudItems) {
      if (item) {
        const key = item.id || `${item.specimen}-${item.title}`;
        itemMap.set(key, item);
      }
    }

    for (const item of current) {
      if (item) {
        const key = item.id || `${item.specimen}-${item.title}`;
        if (!itemMap.has(key)) {
          itemMap.set(key, item);
        }
      }
    }

    const merged = Array.from(itemMap.values());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('flipgen_ledger_updated', { detail: merged }));
    }
    return merged;
  } catch (e) {
    return getArchiveItems();
  }
}

