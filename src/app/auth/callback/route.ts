import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');

    // Read login type from cookie (set by signInWithGoogle before redirect)
    const loginType = request.cookies.get('oauth_login_type')?.value || 'user';

    if (!code) {
        return NextResponse.redirect(`${origin}/login?error=no_code`);
    }

    const response = NextResponse.redirect(`${origin}/`);

    // Clear the login type cookie
    response.cookies.set('oauth_login_type', '', { path: '/', maxAge: 0 });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    // Exchange code for session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
        console.error('OAuth exchange error:', exchangeError.message);
        return NextResponse.redirect(`${origin}/login?error=exchange_failed`);
    }

    // If admin login, verify role
    if (loginType === 'admin') {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.redirect(`${origin}/login?error=no_user`);
        }

        // Wait a moment for the trigger to create the profile
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || profile.role !== 'admin') {
            // Sign out the user since they don't have admin access
            await supabase.auth.signOut();

            return NextResponse.redirect(
                `${origin}/login?error=not_admin`
            );
        }
    }

    return response;
}
