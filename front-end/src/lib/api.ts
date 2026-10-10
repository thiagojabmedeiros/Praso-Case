import {
  Establishment,
  Visit,
  Purchase,
  FollowUp,
  Seller,
  EstablishmentStatus,
  VisitResult,
  Recomendacao,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  // A API responde sem corpo quando não há resultado (ex.: follow-up inexistente).
  // Nesse caso devolvemos null em vez de falhar o parse do JSON.
  const texto = await response.text();
  return (texto ? JSON.parse(texto) : null) as T;
}

// Establishments
export const establishmentsAPI = {
  getAll: (filters?: { status?: EstablishmentStatus; bairro?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.bairro) params.append('bairro', filters.bairro);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiCall<Establishment[]>(`/establishments${query}`);
  },

  getById: (id: string) => apiCall<Establishment>(`/establishments/${id}`),

  create: (data: Omit<Establishment, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiCall<Establishment>('/establishments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, status: EstablishmentStatus) =>
    apiCall<Establishment>(`/establishments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// Visits
export const visitsAPI = {
  getAll: () => apiCall<Visit[]>('/visits'),

  getByEstablishment: (establishmentId: string) =>
    apiCall<Visit[]>(`/visits/establishment/${establishmentId}`),

  create: (data: Omit<Visit, 'id' | 'createdAt'>) =>
    apiCall<Visit>('/visits', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  anular: (id: string, motivo: string) =>
    apiCall<Visit>(`/visits/${id}/anular`, {
      method: 'PATCH',
      body: JSON.stringify({ motivo }),
    }),
};

// Purchases
export const purchasesAPI = {
  getByEstablishment: (establishmentId: string) =>
    apiCall<Purchase[]>(`/purchases/establishment/${establishmentId}`),

  getAutonomous: (establishmentId: string) =>
    apiCall<Purchase[]>(`/purchases/establishment/${establishmentId}/autonomous`),

  create: (data: Omit<Purchase, 'id' | 'createdAt'>) =>
    apiCall<Purchase>('/purchases', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// FollowUps
export const followupsAPI = {
  getByVendedor: (vendedorId: string) =>
    apiCall<FollowUp[]>(`/followups/vendor/${vendedorId}`),

  getByEstablishment: (establishmentId: string) =>
    apiCall<FollowUp | undefined>(`/followups/establishment/${establishmentId}`),
};

// Sellers
export const sellersAPI = {
  getAll: () => apiCall<Seller[]>('/sellers'),

  getById: (id: string) => apiCall<Seller>(`/sellers/${id}`),

  updateScore: (id: string, pontos: number) =>
    apiCall<Seller>(`/sellers/${id}/score`, {
      method: 'PATCH',
      body: JSON.stringify({ pontos }),
    }),
};

// Recomendações
export const recommendationsAPI = {
  getByVendedor: (vendedorId: string, origem?: { lat: number; lng: number }) => {
    const params = origem ? `?lat=${origem.lat}&lng=${origem.lng}` : "";
    return apiCall<Recomendacao[]>(`/recommendations/vendor/${vendedorId}${params}`);
  },
};
