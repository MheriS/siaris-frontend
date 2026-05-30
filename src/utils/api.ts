/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Member, Period, Winner } from '../types';

const API_BASE =
    import.meta.env.VITE_API_URL ||
    'http://127.0.0.1:8000/api';

// ─── Helper ────────────────────────────────────────────────────────────────────
async function request<T>(
    path: string,
    options: RequestInit = {}
): Promise<{ success: boolean; message: string; data?: T;[key: string]: any }> {
    const token = localStorage.getItem('siaris_token');
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers as Record<string, string> || {}),
    };

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
    });

    const json = await res.json();

    if (!res.ok && !json.success) {
        throw new Error(json.message || `Request failed (${res.status})`);
    }

    return json;
}

// ─── AUTH ───────────────────────────────────────────────────────────────────────
export async function apiLogin(email: string, password: string) {
    const res = await request<{ user: any; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    if (res.data?.token) {
        localStorage.setItem('siaris_token', res.data.token);
    }
    return res;
}

export async function apiRegister(name: string, email: string, password: string, password_confirmation: string) {
    const res = await request<{ user: any; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, password_confirmation }),
    });
    if (res.data?.token) {
        localStorage.setItem('siaris_token', res.data.token);
    }
    return res;
}

export async function apiForgotPassword(email: string) {
    return request<any>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });
}

export async function apiResetPassword(email: string, reset_code: string, password: string, password_confirmation: string) {
    return request<any>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, reset_code, password, password_confirmation }),
    });
}

// ─── MEMBERS ────────────────────────────────────────────────────────────────────
export async function fetchMembers(): Promise<Member[]> {
    const res = await request<Member[]>('/members');
    return res.data || [];
}

export async function createMember(member: Omit<Member, 'id'>): Promise<Member> {
    const res = await request<Member>('/members', {
        method: 'POST',
        body: JSON.stringify(member),
    });
    return res.data!;
}

export async function updateMember(member: Member): Promise<Member> {
    const res = await request<Member>(`/members/${member.id}`, {
        method: 'PUT',
        body: JSON.stringify(member),
    });
    return res.data!;
}

export async function deleteMember(id: string): Promise<void> {
    await request(`/members/${id}`, { method: 'DELETE' });
}

export async function bulkImportMembers(members: Omit<Member, 'id'>[]): Promise<Member[]> {
    const res = await request<Member[]>('/members/bulk', {
        method: 'POST',
        body: JSON.stringify({ members }),
    });
    return res.data || [];
}

// ─── PERIODS ────────────────────────────────────────────────────────────────────
export async function fetchPeriods(): Promise<Period[]> {
    const res = await request<Period[]>('/periods');
    return res.data || [];
}

export async function createPeriod(period: Omit<Period, 'id'>): Promise<Period> {
    const res = await request<Period>('/periods', {
        method: 'POST',
        body: JSON.stringify(period),
    });
    return res.data!;
}

export async function setPeriodActive(id: string): Promise<void> {
    await request(`/periods/${id}/active`, { method: 'PATCH' });
}

export async function setPeriodCompleted(id: string): Promise<void> {
    await request(`/periods/${id}/completed`, { method: 'PATCH' });
}

// ─── WINNERS ────────────────────────────────────────────────────────────────────
export async function fetchWinners(): Promise<Winner[]> {
    const res = await request<Winner[]>('/winners');
    return res.data || [];
}

export async function createWinner(winner: Omit<Winner, 'id'>): Promise<Winner> {
    const res = await request<Winner>('/winners', {
        method: 'POST',
        body: JSON.stringify(winner),
    });
    return res.data!;
}

export async function deleteWinner(id: string): Promise<void> {
    await request(`/winners/${id}`, { method: 'DELETE' });
}

// ─── LOTTERY ────────────────────────────────────────────────────────────────────
export async function drawLottery(periodId: string): Promise<{ winner: Winner; candidates: number }> {
    const res = await request<Winner>('/lottery/draw', {
        method: 'POST',
        body: JSON.stringify({ periodId }),
    });
    return { winner: res.data!, candidates: res.candidates || 0 };
}
