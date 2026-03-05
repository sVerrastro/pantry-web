import api from './api';

export const pantryService = {
  async getItems(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v !== undefined && v !== '') params.append(k, v); });
    const res = await api.get(`/pantry?${params}`);
    return res.data;
  },
  async getItem(id) { const res = await api.get(`/pantry/${id}`); return res.data.item; },
  async createItem(data) { const res = await api.post('/pantry', data); return res.data.item; },
  async updateItem(id, data) { const res = await api.patch(`/pantry/${id}`, data); return res.data.item; },
  async deleteItem(id, action = 'discarded') { await api.delete(`/pantry/${id}`, { data: { action } }); },
  async consumeItem(id, quantity_consumed) { await api.post(`/pantry/${id}/consume`, { quantity_consumed, action: 'consumed' }); },
  async openItem(id, opened_expiry_days) { const res = await api.post(`/pantry/${id}/open`, { opened_expiry_days }); return res.data.item; },
  async getAlerts() { const res = await api.get('/pantry/alerts'); return res.data; },
  async getSummary() { const res = await api.get('/pantry/summary'); return res.data.summary; },
  async getCategories() { const res = await api.get('/categories'); return res.data.categories; },
  async getLocations() { const res = await api.get('/locations'); return res.data.locations; },
  async getShoppingList() { const res = await api.get('/shopping'); return res.data.items; },
  async addToShoppingList(data) { const res = await api.post('/shopping', data); return res.data.item; },
  async updateShoppingItem(id, data) { const res = await api.patch(`/shopping/${id}`, data); return res.data.item; },
  async deleteShoppingItem(id) { await api.delete(`/shopping/${id}`); },
  async clearPurchased() { await api.delete('/shopping/clear-purchased'); },
};

export function getExpiryColor(days) {
  if (days === null || days === undefined) return 'expiry-muted';
  if (days <= 2) return 'expiry-red';
  if (days <= 7) return 'expiry-orange';
  if (days <= 14) return 'expiry-yellow';
  return 'expiry-green';
}

export function getExpiryLabel(days, effectiveDate) {
  if (days === null || days === undefined) {
    if (effectiveDate) return 'Scade ' + new Date(effectiveDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
    return 'Nessuna scadenza';
  }
  if (days < 0) return `Scaduto ${Math.abs(days)}g fa`;
  if (days === 0) return 'Scade oggi';
  if (days === 1) return 'Scade domani';
  if (days <= 7) return `Scade in ${days}g`;
  return 'Scade ' + new Date(effectiveDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
}
