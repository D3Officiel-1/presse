'use server'

import { firestore } from '@/firebase/config';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { URLSearchParams } from 'url';

let accessToken: string | null = null;
let tokenExpiresAt: number = 0;

const CACHE_DURATION_HOURS = 24; // Cache results for 24 hours

const getAccessToken = async (): Promise<string> => {
    if (accessToken && Date.now() < tokenExpiresAt) {
        return accessToken;
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error('Spotify client ID or secret not configured in .env');
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
        },
        body: new URLSearchParams({
            grant_type: 'client_credentials'
        })
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to get Spotify access token: ${response.statusText} - ${errorBody}`);
    }

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000; 

    return accessToken!;
};

// --- Server Action for Searching Spotify with Caching ---
export async function searchSpotify(query: string) {
    const cacheId = `search_${query.toLowerCase().replace(/\s+/g, '_')}`;
    const cacheRef = doc(firestore, 'spotifyCache', cacheId);

    try {
        const docSnap = await getDoc(cacheRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const cacheAgeHours = (Timestamp.now().seconds - data.timestamp.seconds) / 3600;
            if (cacheAgeHours < CACHE_DURATION_HOURS) {
                console.log(`[Cache HIT] Returning cached results for query: ${query}`);
                return data.result;
            }
        }
    } catch (e) {
        console.error("Error reading from Firestore cache", e);
    }
    
    console.log(`[Cache MISS] Fetching from Spotify for query: ${query}`);
    const token = await getAccessToken();
    const params = new URLSearchParams({
        q: query,
        type: 'track,artist',
        market: 'CI',
        limit: '20'
    });

    const response = await fetch(`https://api.spotify.com/v1/search?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
        throw new Error('Failed to search Spotify');
    }

    const result = await response.json();

    try {
        await setDoc(cacheRef, {
            result,
            timestamp: Timestamp.now()
        });
    } catch (e) {
        console.error("Error writing to Firestore cache", e);
    }

    return result;
}


// --- Server Action for Artist Top Tracks with Caching ---
export async function getArtistTopTracksFromSpotify(artistId: string) {
    const cacheId = `artist-top-tracks_${artistId}`;
    const cacheRef = doc(firestore, 'spotifyCache', cacheId);

    try {
        const docSnap = await getDoc(cacheRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const cacheAgeHours = (Timestamp.now().seconds - data.timestamp.seconds) / 3600;
            if (cacheAgeHours < CACHE_DURATION_HOURS) {
                console.log(`[Cache HIT] Returning cached top tracks for artist: ${artistId}`);
                return data.result;
            }
        }
    } catch (e) {
        console.error("Error reading from Firestore cache", e);
    }

    console.log(`[Cache MISS] Fetching from Spotify for artist top tracks: ${artistId}`);
    const token = await getAccessToken();

    const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=CI`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
        throw new Error('Failed to get artist top tracks from Spotify');
    }

    const result = await response.json();

    try {
        await setDoc(cacheRef, {
            result,
            timestamp: Timestamp.now()
        });
    } catch (e) {
        console.error("Error writing to Firestore cache", e);
    }

    return result;
}

export async function getArtistDetailsFromSpotify(artistId: string) {
    const cacheId = `artist-details_${artistId}`;
    const cacheRef = doc(firestore, 'spotifyCache', cacheId);

    try {
        const docSnap = await getDoc(cacheRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const cacheAgeHours = (Timestamp.now().seconds - data.timestamp.seconds) / 3600;
            if (cacheAgeHours < CACHE_DURATION_HOURS) {
                console.log(`[Cache HIT] Returning cached details for artist: ${artistId}`);
                return data.result;
            }
        }
    } catch (e) {
        console.error("Error reading from Firestore cache", e);
    }
    
    console.log(`[Cache MISS] Fetching from Spotify for artist details: ${artistId}`);
    const token = await getAccessToken();

    const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
        throw new Error('Failed to get artist details from Spotify');
    }

    const result = await response.json();

     try {
        await setDoc(cacheRef, {
            result,
            timestamp: Timestamp.now()
        });
    } catch (e) {
        console.error("Error writing to Firestore cache", e);
    }

    return result;
}


export async function getArtistAlbumsFromSpotify(artistId: string) {
    const cacheId = `artist-albums_${artistId}`;
    const cacheRef = doc(firestore, 'spotifyCache', cacheId);

    try {
        const docSnap = await getDoc(cacheRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const cacheAgeHours = (Timestamp.now().seconds - data.timestamp.seconds) / 3600;
            if (cacheAgeHours < CACHE_DURATION_HOURS) {
                console.log(`[Cache HIT] Returning cached albums for artist: ${artistId}`);
                return data.result;
            }
        }
    } catch (e) {
        console.error("Error reading from Firestore cache", e);
    }
    
    console.log(`[Cache MISS] Fetching from Spotify for artist albums: ${artistId}`);
    const token = await getAccessToken();

    const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&market=CI&limit=50`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
        throw new Error('Failed to get artist albums from Spotify');
    }

    const result = await response.json();

     try {
        await setDoc(cacheRef, {
            result,
            timestamp: Timestamp.now()
        });
    } catch (e) {
        console.error("Error writing to Firestore cache", e);
    }

    return result;
}

export async function getAlbumTracksFromSpotify(albumId: string) {
    const cacheId = `album-tracks_${albumId}`;
    const cacheRef = doc(firestore, 'spotifyCache', cacheId);

    try {
        const docSnap = await getDoc(cacheRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const cacheAgeHours = (Timestamp.now().seconds - data.timestamp.seconds) / 3600;
            if (cacheAgeHours < CACHE_DURATION_HOURS) {
                console.log(`[Cache HIT] Returning cached tracks for album: ${albumId}`);
                return data.result;
            }
        }
    } catch (e) {
        console.error("Error reading from Firestore cache", e);
    }
    
    console.log(`[Cache MISS] Fetching from Spotify for album tracks: ${albumId}`);
    const token = await getAccessToken();
    
    const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}/tracks?market=CI&limit=50`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
        throw new Error('Failed to get album tracks from Spotify');
    }

    const result = await response.json();

    try {
        await setDoc(cacheRef, {
            result,
            timestamp: Timestamp.now()
        });
    } catch (e) {
        console.error("Error writing to Firestore cache", e);
    }

    return result;
}