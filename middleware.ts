
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const { nextUrl } = req;
    const userRole = req.auth?.user?.role;

    // Protected Routes
    const isAdminRoute = nextUrl.pathname.startsWith('/admin');
    const isPartnerRoute = nextUrl.pathname.startsWith('/partner');
    const isMyPageRoute = nextUrl.pathname.startsWith('/my-page');
    const isAuthRoute = nextUrl.pathname.startsWith('/login');

    if (isAuthRoute) {
        if (isLoggedIn) {
            // Redirect logged-in users away from login page
            return NextResponse.redirect(new URL('/', nextUrl));
        }
        return NextResponse.next();
    }

    if (!isLoggedIn && (isAdminRoute || isPartnerRoute || isMyPageRoute)) {
        return NextResponse.redirect(new URL('/login', nextUrl));
    }

    if (isAdminRoute && userRole !== 'admin') {
        // Redirect non-admins to home
        return NextResponse.redirect(new URL('/', nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
