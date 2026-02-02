import api from './axios';
export { api };

// --- Types ---
export interface Customer {
    id: string;
    phone: string;
    name: string;
    relationship?: string;
    bankAccount?: string;
    gameRank?: string;
    status: 'ACTIVE' | 'INACTIVE';
    note?: string;
    createdAt: string;
    transactions?: Transaction[];
    totalPoints: number;
    tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND';
}

export interface Transaction {
    id: string;
    customerId: string;
    customer?: { name: string; phone: string };
    amountGross: number;
    amountNet: number;
    ticketCount?: number;
    purchaseDate: string;
    productType: 'TICKET' | 'COMBO';
    channel?: 'APP' | 'WEB' | 'OFFLINE';
    movieName: string;
    cinemaName?: string;
    discountPercent?: number;
    voucherCode?: string;
    proofImageUrl?: string;
    status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
    createdAt: string;
    createdBy?: { email: string };
}

export interface PointRule {
    id: string;
    conversionUnit: number;
    ticketMultiplier: number;
    comboMultiplier: number;
    appWebBonus: number;
    pointsExpiryMonths: number;
}

export interface PointLedger {
    id: string;
    points: number;
    type: 'EARN' | 'REDEEM' | 'EXPIRE';
    createdAt: string;
    transactionId?: string;
}

// --- Customer API ---
export const getCustomers = async (search?: string) => {
    const res = await api.get<Customer[]>('/customers', { params: { search } });
    return res.data;
};

export const getCustomer = async (id: string) => {
    const res = await api.get<Customer>(`/customers/${id}`);
    return res.data;
};

export const createCustomer = async (data: Partial<Customer>) => {
    const res = await api.post<Customer>('/customers', data);
    return res.data;
};

export const updateCustomerStatus = async (id: string, status: string) => {
    const res = await api.patch<Customer>(`/customers/${id}/status`, { status });
    return res.data;
}


// --- Transaction API ---
export const getTransactions = async (params?: { status?: string, customerId?: string }) => {
    const res = await api.get<Transaction[]>('/transactions', { params });
    return res.data;
};

export const createTransaction = async (data: Partial<Transaction>) => {
    const res = await api.post<Transaction>('/transactions', data);
    return res.data;
};

export const confirmTransaction = async (id: string) => {
    const res = await api.patch<Transaction>(`/transactions/${id}/confirm`);
    return res.data;
};

export const rejectTransaction = async (id: string) => {
    const res = await api.patch<Transaction>(`/transactions/${id}/reject`);
    return res.data;
};

// --- Loyalty API ---
export const getLoyaltyRules = async () => {
    const res = await api.get<PointRule>('/loyalty/rules');
    return res.data;
};

export const updateLoyaltyRules = async (data: Partial<PointRule>) => {
    const res = await api.put<PointRule>('/loyalty/rules', data);
    return res.data;
};

export const getPointLedger = async (customerId: string) => {
    const res = await api.get<PointLedger[]>(`/loyalty/ledger/${customerId}`);
    return res.data;
};

export const redeemPoints = async (data: { customerId: string, points: number, note?: string }) => {
    const res = await api.post('/loyalty/redeem', data);
    return res.data;
};

// --- Voucher API ---
export interface Voucher {
    id: string;
    code: string;
    discountType: 'PERCENT' | 'AMOUNT' | 'OTHER';
    discountValue: number;
    platform: string;
    expiryDate: string | null;
    status: 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'EXHAUSTED' | 'INVALID' | 'PENDING_VALIDATION';
    note?: string;
    validated?: boolean;
    rawText?: string;
    sourceId?: string;
}

export const getVouchers = async (search?: string, status?: string) => {
    const res = await api.get<Voucher[]>('/vouchers', { params: { search, status } });
    return res.data;
};

export const createVoucher = async (data: Partial<Voucher>) => {
    const res = await api.post<Voucher>('/vouchers', data);
    return res.data;
};

export const updateVoucher = async (id: string, data: Partial<Voucher>) => {
    const res = await api.put<Voucher>(`/vouchers/${id}`, data);
    return res.data;
};

export const deleteVoucher = async (id: string) => {
    const res = await api.delete(`/vouchers/${id}`);
    return res.data;
};

// --- Dashboard API ---
export const getDashboardSummary = async (from?: string, to?: string) => {
    const res = await api.get('/dashboard/summary', { params: { from, to } });
    return res.data;
};

export const getRevenueSeries = async (from?: string, to?: string) => {
    const res = await api.get('/dashboard/revenue-series', { params: { from, to } });
    return res.data;
};

export const getDashboardOps = async () => {
    const res = await api.get('/dashboard/ops');
    return res.data;
};

// --- Sprint 6: New Loyalty APIs ---
export interface TopCustomer {
    id: string;
    name: string;
    phone: string;
    tier: string;
    pointsAvailable: number;
    netSpend: number;
    transactionsCount: number;
    tickets: number;
}

export interface RewardVoucher {
    id: string;
    code: string;
    discountPercent: number;
    pointsCost: number;
    status: 'ISSUED' | 'USED' | 'EXPIRED';
    expiresAt: string;
}

export const getTopCustomers = async (limit: number = 10): Promise<TopCustomer[]> => {
    const response = await api.get(`/loyalty/top-customers?limit=${limit}`);
    return response.data;
};

export const redeemVoucher = async (customerId: string, rewardId: string): Promise<{ voucher: RewardVoucher, pointsRemaining: number }> => {
    const response = await api.post('/loyalty/redeem-voucher', { customerId, rewardId });
    return response.data;
};

export const getRewardVouchers = async (customerId: string): Promise<RewardVoucher[]> => {
    const response = await api.get(`/loyalty/reward-vouchers?customerId=${customerId}`);
    return response.data;
};
