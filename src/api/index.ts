import axios from 'axios';

const DEFAULT_STAGING_API_URL = 'https://backend-worker-staging.aris-22002-priyanto.workers.dev/api';
const API_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_STAGING_API_URL).replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_URL,
});

type ApiRow = Record<string, unknown>;

interface DataSnapshot {
  activities: ApiRow[];
  organizations: ApiRow[];
  products: ApiRow[];
  posts: ApiRow[];
  agendas: ApiRow[];
  kegiatan: ApiRow[];
  komunitas: ApiRow[];
  houses: ApiRow[];
  residents: ApiRow[];
  payments: ApiRow[];
}

interface DashboardStats {
  totalHouses: number;
  occupiedHouses: number;
  totalResidents: number;
  monthlyRevenue: number;
  totalUsers: number;
  totalActivities: number;
  totalPosts: number;
  upcomingAgendas: number;
  totalCommunities: number;
  totalOrganizations: number;
  totalEvents: number;
  totalProducts: number;
  recentUpdates: string[];
}

interface ResumeSummary {
  totalPosts: number;
  totalUsers: number;
  totalActivities: number;
  upcomingAgendas: number;
  totalCommunities: number;
  totalOrganizations: number;
  totalEvents: number;
  totalProducts: number;
  recentPosts: Array<{ title: string; excerpt: string; date: string }>;
  upcomingEvents: Array<{ name: string; date: string; location: string }>;
}

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) return Number(value);
  return fallback;
};

const toString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

const toRows = (value: unknown): ApiRow[] =>
  Array.isArray(value) ? value.filter((item): item is ApiRow => !!item && typeof item === 'object') : [];

const getDataSnapshot = async (): Promise<DataSnapshot> => {
  const data = await api.get('/data').then((res) => res.data as Record<string, unknown>);
  return {
    activities: toRows(data.activities),
    organizations: toRows(data.organizations),
    products: toRows(data.products),
    posts: toRows(data.posts),
    agendas: toRows(data.agendas),
    kegiatan: toRows(data.kegiatan),
    komunitas: toRows(data.komunitas),
    houses: toRows(data.houses),
    residents: toRows(data.residents),
    payments: toRows(data.payments),
  };
};

const buildStats = (snapshot: DataSnapshot): DashboardStats => {
  const now = new Date();
  const thisMonth = now.getMonth() + 1;
  const thisYear = now.getFullYear();

  const occupiedHouses = snapshot.houses.filter((house) => {
    const status = toString(house.status).toLowerCase();
    return status !== '' && status !== 'vacant' && status !== 'kosong';
  }).length;

  const monthlyRevenue = snapshot.payments
    .filter((payment) => {
      const status = toString(payment.status).toLowerCase();
      const isPaid = status === 'paid' || status === 'lunas' || status === 'terbayar';
      return isPaid && toNumber(payment.month) === thisMonth && toNumber(payment.year) === thisYear;
    })
    .reduce((sum, payment) => sum + toNumber(payment.amount), 0);

  const recentUpdates = snapshot.activities
    .slice(0, 5)
    .map((activity) => {
      const title = toString(activity.title);
      const description = toString(activity.description);
      if (title && description) return `${title} - ${description}`;
      return title || description;
    })
    .filter((item): item is string => item.length > 0);

  return {
    totalHouses: snapshot.houses.length,
    occupiedHouses,
    totalResidents: snapshot.residents.length,
    monthlyRevenue,
    totalUsers: snapshot.residents.length,
    totalActivities: snapshot.activities.length,
    totalPosts: snapshot.posts.length,
    upcomingAgendas: snapshot.agendas.length,
    totalCommunities: snapshot.komunitas.length,
    totalOrganizations: snapshot.organizations.length,
    totalEvents: snapshot.kegiatan.length,
    totalProducts: snapshot.products.length,
    recentUpdates,
  };
};

const buildResume = (snapshot: DataSnapshot): ResumeSummary => {
  const recentPosts = snapshot.posts.slice(0, 3).map((post) => ({
    title: toString(post.title, 'Tanpa judul'),
    excerpt: toString(post.content || post.excerpt).slice(0, 120),
    date: toString(post.date, '-'),
  }));

  const upcomingEvents = [...snapshot.agendas, ...snapshot.kegiatan]
    .slice(0, 5)
    .map((event) => ({
      name: toString(event.title, 'Kegiatan'),
      date: toString(event.event_date || event.date, '-'),
      location: toString(event.location, '-'),
    }));

  return {
    totalPosts: snapshot.posts.length,
    totalUsers: snapshot.residents.length,
    totalActivities: snapshot.activities.length,
    upcomingAgendas: snapshot.agendas.length,
    totalCommunities: snapshot.komunitas.length,
    totalOrganizations: snapshot.organizations.length,
    totalEvents: snapshot.kegiatan.length,
    totalProducts: snapshot.products.length,
    recentPosts,
    upcomingEvents,
  };
};

export const getActivities = () => api.get('/activities').then(res => res.data);
export const getOrganizations = () => api.get('/organizations').then(res => res.data);
export const getProducts = () => api.get('/products').then(res => res.data);
export const getPosts = () => api.get('/posts').then(res => res.data);
export const getResume = () => getDataSnapshot().then(buildResume);
export const getStats = () => getDataSnapshot().then(buildStats);

export const housesApi = {
  getAll: () => api.get('/houses').then(res => res.data),
  create: (data: any) => api.post('/houses', data).then(res => res.data),
  update: (id: number, data: any) => api.put(`/houses/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/houses/${id}`).then(res => res.data),
};

export const residentsApi = {
  getAll: async (): Promise<any[]> => {
    const [residents, houses] = await Promise.all([
      api.get('/residents').then((res) => toRows(res.data)),
      api.get('/houses').then((res) => toRows(res.data)),
    ]);
    const houseMap = new Map<number, ApiRow>(houses.map((house) => [toNumber(house.id), house]));
    return residents.map((resident, index) => {
      const houseId = toNumber(resident.house_id);
      const house = houseMap.get(houseId);
      return {
        ...resident,
        id: toNumber(resident.id, index + 1),
        house_id: houseId,
        block: toString(house?.block),
        number: toString(house?.number),
      };
    });
  },
  create: (data: any) => api.post('/residents', data).then(res => res.data),
  update: (id: number, data: any) => api.put(`/residents/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/residents/${id}`).then(res => res.data),
};

export const paymentsApi = {
  getAll: async (month: number, year: number): Promise<any[]> => {
    const [payments, houses] = await Promise.all([
      api.get('/payments', { params: { month, year } }).then((res) => toRows(res.data)),
      api.get('/houses').then((res) => toRows(res.data)),
    ]);
    const houseMap = new Map<number, ApiRow>(houses.map((house) => [toNumber(house.id), house]));
    return payments
      .filter((payment) => toNumber(payment.month) === month && toNumber(payment.year) === year)
      .map((payment) => {
        const house = houseMap.get(toNumber(payment.house_id));
        return {
          ...payment,
          block: toString(house?.block, '-'),
          number: toString(house?.number, '-'),
        };
      });
  },
  generate: (month: number, year: number) => api.post('/payments/generate', { month, year }).then(res => res.data),
  pay: (id: number, data: any) => api.put(`/payments/${id}/pay`, data).then(res => res.data),
};

export const getEvents = () => api.get('/kegiatan').then(res => res.data);
export const kegiatanApi = {
  getAll: () => api.get('/kegiatan').then(res => res.data),
  create: (data: any) => api.post('/kegiatan', data).then(res => res.data),
  delete: (id: number) => api.delete(`/kegiatan/${id}`).then(res => res.data),
};

export const getCommunities = () => api.get('/komunitas').then(res => res.data);
export const komunitasApi = {
  getAll: () => api.get('/komunitas').then(res => res.data),
  create: (data: any) => api.post('/komunitas', data).then(res => res.data),
  delete: (id: number) => api.delete(`/komunitas/${id}`).then(res => res.data),
};

export const getAgendas = (params: { month: number; year: number }) =>
  api.get('/agendas', { params }).then((res) =>
    toRows(res.data).filter((agenda) => {
      const eventDate = toString(agenda.event_date);
      if (!eventDate) return true;
      const date = new Date(eventDate);
      if (Number.isNaN(date.getTime())) return true;
      return date.getMonth() + 1 === params.month && date.getFullYear() === params.year;
    }),
  );

export default api;
