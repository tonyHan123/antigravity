import { createServerClient } from '@/lib/supabase';
import { randomUUID } from 'crypto';

/**
 * Helper: Get or create user profile
 * Used across multiple API routes to ensure profile exists before operations
 */
export async function getOrCreateProfile(
    supabase: ReturnType<typeof createServerClient>,
    email: string,
    name?: string
) {
    // Try to get existing profile
    const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

    if (profile) {
        return profile;
    }

    // If not found, create new profile
    if (fetchError && fetchError.code === 'PGRST116') {
        let newId = randomUUID();
        let role = 'user';

        if (email === 'owner@shop1.com') {
            newId = '22222222-2222-2222-2222-222222222222';
            role = 'owner';

            // Check if this fixed ID already exists (with a different email)
            const { data: existingOwner, error: ownerCheckError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', newId)
                .single();

            if (existingOwner) {
                console.log('Found existing demo owner profile with different email. Updating to:', email);
                // Self-heal: Update the existing profile to match the current email
                const { data: updatedProfile, error: updateError } = await supabase
                    .from('profiles')
                    .update({ email, name: name || 'Jenny House Premium Owner', role: 'owner' })
                    .eq('id', newId)
                    .select()
                    .single();

                if (updateError) throw new Error(`Failed to heal demo owner profile: ${updateError.message}`);
                return updatedProfile;
            }
        }

        console.log('Creating new profile with ID:', newId, 'for email:', email);

        const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
                id: newId,
                email,
                name: name || email.split('@')[0],
                role: role,
                image_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            })
            .select()
            .single();

        if (insertError) {
            console.error('Error creating profile:', insertError);
            throw new Error(`Failed to create user profile: ${insertError.message}`);
        }

        console.log('Profile created successfully:', newProfile);
        return newProfile;
    }

    if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        throw new Error(`Failed to fetch profile: ${fetchError.message}`);
    }

    return null;
}
