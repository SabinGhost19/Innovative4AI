/**
 * Authentication Service
 * Handles user registration, login, and session management
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface User {
  user_id: string;
  username: string;
}

export interface Session {
  session_id: string;
  business_name: string;
  business_type: string;
  industry: string;
  location: {
    address: string;
    neighborhood: string;
    county?: string;
    lat: number;
    lng: number;
  };
  initial_budget: number;
  current_month: number;
  current_year: number;
  latest_state?: {
    month: number;
    year: number;
    revenue: number;
    profit: number;
    customers: number;
    cash_balance: number;
  };
}

export interface AuthState {
  user: User | null;
  session: Session | null;
}

// LocalStorage keys
const USER_KEY = "nyc_sim_user";
const SESSION_KEY = "nyc_sim_session";

/**
 * Register new user
 */
export async function register(username: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    const data = await response.json();

    if (data.success) {
      const user: User = {
        user_id: data.user_id,
        username: data.username,
      };
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return { success: true, user };
    } else {
      return { success: false, error: data.error || "Registration failed" };
    }
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "Network error" };
  }
}

/**
 * Login existing user
 */
export async function login(username: string): Promise<{ success: boolean; user?: User; session?: Session | null; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    const data = await response.json();

    if (data.success) {
      const user: User = {
        user_id: data.user_id,
        username: data.username,
      };
      
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      if (data.session) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(data.session));
        return { success: true, user, session: data.session };
      }
      
      return { success: true, user, session: null };
    } else {
      return { success: false, error: data.error || "Login failed" };
    }
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Network error" };
  }
}

/**
 * Create new simulation session
 */
export async function createSession(
  userId: string,
  businessName: string,
  businessType: string,
  industry: string,
  location: {
    address: string;
    neighborhood: string;
    county?: string;
    lat: number;
    lng: number;
  },
  initialBudget: number
): Promise<{ success: boolean; session?: Session; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/api/simulation/create-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        business_name: businessName,
        business_type: businessType,
        industry: industry,
        location: location,
        initial_budget: initialBudget,
      }),
    });

    const data = await response.json();

    if (data.success) {
      const session: Session = {
        session_id: data.session.session_id,
        business_name: businessName,
        business_type: businessType,
        industry: industry,
        location: location,
        initial_budget: initialBudget,
        current_month: data.session.current_month,
        current_year: data.session.current_year,
      };
      
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return { success: true, session };
    } else {
      return { success: false, error: "Failed to create session" };
    }
  } catch (error) {
    console.error("Create session error:", error);
    return { success: false, error: "Network error" };
  }
}

/**
 * Save monthly state
 */
export async function saveMonthlyState(
  sessionId: string,
  month: number,
  year: number,
  revenue: number,
  profit: number,
  customers: number,
  cashBalance: number,
  agentOutputs: any,
  playerDecisions: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/api/simulation/save-state`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        month,
        year,
        revenue,
        profit,
        customers,
        cash_balance: cashBalance,
        agent_outputs: agentOutputs,
        player_decisions: playerDecisions,
      }),
    });

    const data = await response.json();
    return { success: data.success, error: data.error };
  } catch (error) {
    console.error("Save state error:", error);
    return { success: false, error: "Network error" };
  }
}

/**
 * Get current auth state
 */
export function getAuthState(): AuthState {
  const userStr = localStorage.getItem(USER_KEY);
  const sessionStr = localStorage.getItem(SESSION_KEY);

  return {
    user: userStr ? JSON.parse(userStr) : null,
    session: sessionStr ? JSON.parse(sessionStr) : null,
  };
}

/**
 * Logout user
 */
export function logout(): void {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem("businessData"); // Clean old format
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem(USER_KEY);
}

/**
 * Update session in localStorage
 */
export function updateSession(session: Partial<Session>): void {
  const currentSession = getAuthState().session;
  if (currentSession) {
    const updatedSession = { ...currentSession, ...session };
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
  }
}
