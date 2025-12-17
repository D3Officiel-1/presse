'use server'

import { searchSpotify, getArtistTopTracksFromSpotify, getArtistDetailsFromSpotify as getArtistDetailsAction, getArtistAlbumsFromSpotify } from './spotify-action';

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

export const getArtistDetails = async (artistId: string) => {
    if(!artistId) {
        throw new Error('Artist ID is required');
    }
    const result = await getArtistDetailsAction(artistId);
    return result;
}

export const getArtistAlbums = async (artistId: string) => {
    if (!artistId) {
        return { items: [] };
    }
    const results = await getArtistAlbumsFromSpotify(artistId);
    return results;
}
