
'use server'

import { searchSpotify, getArtistTopTracksFromSpotify } from './spotify-action';

export const searchTracks = async (query: string) => {
    if (!query) {
        return { tracks: { items: [] }, artists: { items: [] } };
    }
    const results = await searchSpotify(query);
    return results;
};


export const getArtistTopTracks = async (artistId: string) => {
    if (!artistId) {
        return { tracks: [] };
    }
    const results = await getArtistTopTracksFromSpotify(artistId);
    return results;
}
