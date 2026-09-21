export interface AdminSession {
  username: string;
  token: string;
  loginTime: number;
  expiresAt: number;
}

const SESSION_STORAGE_KEY = 'vv_admin_token_v2';
const USERNAME_KEY = 'vv_admin_user_v2';

export const authService = {
  async login(username: string, pass: string): Promise<{ success: boolean; message: string; session?: AdminSession }> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: pass.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          message: data.error || 'Invalid administrator credentials.',
        };
      }

      const now = Date.now();
      const session: AdminSession = {
        username: data.user?.username || username,
        token: data.token,
        loginTime: now,
        expiresAt: now + 24 * 60 * 60 * 1000,
      };

      localStorage.setItem(SESSION_STORAGE_KEY, data.token);
      localStorage.setItem(USERNAME_KEY, session.username);

      return {
        success: true,
        message: 'Administrative session authorized.',
        session,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Network error or server unavailable. Please try again.',
      };
    }
  },

  async logout(): Promise<void> {
    const token = this.getToken();
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.warn('Logout network call warning:', err);
      }
    }
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(USERNAME_KEY);
  },

  getToken(): string | null {
    return localStorage.getItem(SESSION_STORAGE_KEY);
  },

  getUsername(): string {
    return localStorage.getItem(USERNAME_KEY) || 'admin';
  },

  isAuthenticated(): boolean {
    const token = this.getToken();
    return Boolean(token);
  },

  async verifySession(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    try {
      const res = await fetch('/api/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        return Boolean(data.valid);
      }
      this.logout();
      return false;
    } catch {
      return false;
    }
  },

  async changePassword(newPassword: string): Promise<{ success: boolean; message: string }> {
    const token = this.getToken();
    if (!token) {
      return { success: false, message: 'Administrative authentication required.' };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters long.' };
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.error || 'Failed to update password.' };
      }

      return { success: true, message: 'Administrator password updated securely on server.' };
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Server communication error.' };
    }
  },
};
