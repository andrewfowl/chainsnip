"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { rateLimitAuthRequest } from "@/lib/rate-limit"

/**
 * Initiate password reset process
 */
export async function requestPasswordReset(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Rate limit by email
    const rateLimitResult = await rateLimitAuthRequest(`reset:${email}`)
    if (!rateLimitResult.success) {
      return {
        success: false,
        error: "Too many password reset requests. Please try again later.",
      }
    }

    const headersList = await headers()

    // Better Auth's built-in forgetPassword endpoint
    const result = await auth.api.forgetPassword({
      body: { email },
      headers: headersList,
    })

    // Return success regardless to prevent email enumeration
    return { success: true }
  } catch (error) {
    console.error("Password reset request error:", error)
    // Still return success to prevent email enumeration attacks
    return { success: true }
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate password
    if (newPassword.length < 8 || newPassword.length > 128) {
      return {
        success: false,
        error: "Password must be between 8 and 128 characters",
      }
    }

    const headersList = await headers()

    // Better Auth's built-in resetPassword endpoint
    const result = await auth.api.resetPassword({
      body: { token, newPassword },
      headers: headersList,
    })

    return { success: !!result, error: result ? undefined : "Invalid or expired reset token" }
  } catch (error) {
    console.error("Password reset error:", error)
    return { success: false, error: "Failed to reset password" }
  }
}

/**
 * Change password for authenticated user
 */
export async function changePassword(
  oldPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate new password
    if (newPassword.length < 8 || newPassword.length > 128) {
      return {
        success: false,
        error: "Password must be between 8 and 128 characters",
      }
    }

    // Validate passwords are different
    if (oldPassword === newPassword) {
      return {
        success: false,
        error: "New password must be different from current password",
      }
    }

    const headersList = await headers()

    // Better Auth's change password endpoint
    const result = await auth.api.changePassword({
      body: { oldPassword, newPassword },
      headers: headersList,
    })

    return { success: !!result, error: result ? undefined : "Failed to change password" }
  } catch (error) {
    console.error("Change password error:", error)
    return { success: false, error: "Failed to change password" }
  }
}
