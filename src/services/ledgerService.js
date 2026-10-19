// Sales Archive & Inventory Ledger Service
// Stores saved listings locally with CSV export and economic reporting

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
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load archive items:', e);
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
    return newItem;
  } catch (e) {
    console.error('Failed to save to archive:', e);
    return null;
  }
}

export function removeArchiveItem(id) {
  try {
    const current = getArchiveItems();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to delete item from archive:', e);
    return [];
  }
}

export function clearArchive() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  } catch (e) {
    return [];
  }
}

export function exportArchiveToCSV() {
  const items = getArchiveItems();
  const headers = ['Specimen ID', 'Working Title', 'Niche Category', 'Condition', 'COGS ($)', 'Target Price ($)', 'Est. Net Profit ($)', 'Est. ROI (%)', 'Saved Date', 'Status', 'eBay Title', 'Poshmark Title', 'Mercari Title'];
  
  const rows = items.map(item => [
    `"${item.specimen}"`,
    `"${(item.title || '').replace(/"/g, '""')}"`,
    `"${(item.niche || '').replace(/"/g, '""')}"`,
    `"${(item.condition || '').replace(/"/g, '""')}"`,
    item.cogs.toFixed(2),
    item.price.toFixed(2),
    item.profit.toFixed(2),
    item.roi.toFixed(1),
    `"${new Date(item.savedAt).toLocaleDateString()}"`,
    `"${item.status}"`,
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

/**
 * Merge cloud archive items into local ledger without duplicates
 */
export function importArchiveItemsFromCloud(cloudItems) {
  try {
    if (!Array.isArray(cloudItems) || cloudItems.length === 0) return getArchiveItems();
    const current = getArchiveItems();
    const existingKeys = new Set(current.map(i => `${i.specimen}-${i.title}`));
    const merged = [...current];

    for (const item of cloudItems) {
      const key = `${item.specimen}-${item.title}`;
      if (!existingKeys.has(key)) {
        merged.push(item);
        existingKeys.add(key);
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch (e) {
    console.error('Failed to merge cloud archive items:', e);
    return getArchiveItems();
  }
}
