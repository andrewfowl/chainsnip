// Simple auth utilities using localStorage for demo
export interface User {
  id: string
  email: string
  name: string
  plan: "free" | "pro" | "enterprise" | "lifetime"
  createdAt: string
}

const USERS_KEY = "chainsnip_users"
const SESSION_KEY = "chainsnip_session"

export function getUsers(): User[] {
  if (typeof window === "undefined") return []
  const users = localStorage.getItem(USERS_KEY)
  return users ? JSON.parse(users) : []
}

export function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null
  const session = localStorage.getItem(SESSION_KEY)
  if (!session) return null
  const users = getUsers()
  return users.find((u) => u.id === session) || null
}

export function signUp(email: string, password: string, name: string): { success: boolean; error?: string } {
  const users = getUsers()
  if (users.find((u) => u.email === email)) {
    return { success: false, error: "Email already registered" }
  }

  const newUser: User = {
    id: crypto.randomUUID(),
    email,
    name,
    plan: "free",
    createdAt: new Date().toISOString(),
  }

  // Store password hash (in real app, use proper hashing)
  const credentials = JSON.parse(localStorage.getItem("chainsnip_credentials") || "{}")
  credentials[email] = password
  localStorage.setItem("chainsnip_credentials", JSON.stringify(credentials))

  saveUsers([...users, newUser])
  localStorage.setItem(SESSION_KEY, newUser.id)

  return { success: true }
}

export function signIn(email: string, password: string): { success: boolean; error?: string } {
  const users = getUsers()
  const user = users.find((u) => u.email === email)

  if (!user) {
    return { success: false, error: "Invalid email or password" }
  }

  const credentials = JSON.parse(localStorage.getItem("chainsnip_credentials") || "{}")
  if (credentials[email] !== password) {
    return { success: false, error: "Invalid email or password" }
  }

  localStorage.setItem(SESSION_KEY, user.id)
  return { success: true }
}

export function signOut() {
  localStorage.removeItem(SESSION_KEY)
}

export function updateUserPlan(plan: "free" | "pro" | "enterprise" | "lifetime") {
  const user = getCurrentUser()
  if (!user) return

  const users = getUsers()
  const index = users.findIndex((u) => u.id === user.id)
  if (index !== -1) {
    users[index].plan = plan
    saveUsers(users)
  }
}
