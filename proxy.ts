import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/teacher(.*)'])
const isAuthRoute = createRouteMatcher(['/teacher/login', '/teacher/register'])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()

  // Already logged in → skip login/register and go straight to dashboard
  if (isAuthRoute(req) && userId) {
    return NextResponse.redirect(new URL('/teacher/dashboard', req.url))
  }

  // Not logged in → protect all other teacher routes
  if (isProtectedRoute(req)) await auth.protect()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}