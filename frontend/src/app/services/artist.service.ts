import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment'; 

export interface Artist {
    id: string;
    name: string;
    thumbnail?: string;
    nationality?: string;
    birthday?: string;
    deathday?: string; // added deathday
    biography?: string; // optional biography field if needed
    similarArtists?: { id: string; name: string; thumbnail?: string }[];
}

export interface Artwork {
    id: string;
    title: string;
    date: string;
    image?: string;
}

export interface ArtCategory {
    name: string;
    thumbnail?: string;
}

@Injectable({ providedIn: 'root' })
export class ArtistService {
    private readonly apiPath = `${environment.backendUrl}/api/artsy`;
    private readonly apiPathforfav = `${environment.backendUrl}/api/auth`;
    private readonly apiPathforgenes = `${environment.backendUrl}/api`;
    constructor(private http: HttpClient) {}

    searchArtists(query: string): Observable<Artist[]> {
        return this.http.get<{ artists: Artist[] }>(`${this.apiPath}/search`, {
            params: { q: query },
            withCredentials: true
        }).pipe(
            map(res => res.artists)
        );
    }

    getArtistDetails(id: string): Observable<Artist> {
        return this.http.get<{ data: Artist }>(`${this.apiPath}/artists/${id}`, {
            withCredentials: true
        }).pipe(
            map(response => response.data)
        );
    }

    getArtistArtworks(artistId: string): Observable<Artwork[]> {
        return this.http.get<{ _embedded: { artworks: any[] } }>(
          `${this.apiPath}/artworks`, 
          {
            params: { artist_id: artistId },
            withCredentials: true
          }
        ).pipe(
          map(res => {
            return res._embedded.artworks.map(aw => ({
              id: aw.id,
              title: aw.title,
              date: aw.date,
              // Flatten the nested _links.thumbnail.href into a top-level "image"
              image: aw._links?.thumbnail?.href || ''
            })) as Artwork[];
          })
        );
      }

      getArtworkCategories(artworkId: string): Observable<ArtCategory[]> {
        return this.http.get<{ data: { categories: any[] } }>(
          `${this.apiPathforgenes}/genes`,
          {
            params: { artwork_id: artworkId },
            withCredentials: true
          }
        ).pipe(
          map(res => res.data.categories.map(cat => ({
            name: cat.name,
            thumbnail: cat.thumbnail
          })))
        );
      }
      

    getSimilarArtists(artistId: string): Observable<Artist[]> {
        return this.http.get<{ artists: Artist[] }>(`${this.apiPath}/artists`, {
            params: { similar_to_artist_id: artistId },
            withCredentials: true
        }).pipe(
            map(resp => resp.artists)
        );
    }

    getFavorites(): Observable<Artist[]> {
        return this.http.get<{ success: boolean;
            data: {
              data: any[];       // The actual array
              total: number;
              page: number;
              totalPages: number;
            };
            message: string;
            timestamp: string;}>(`${this.apiPathforfav}/favorites`, {
            withCredentials: true
        }).pipe(
            map(res => {
                if(!res.data || !Array.isArray(res.data.data)) {
                    return [];
                }
                return res.data.data;
            })
        );
    }
    

    addFavorite(artistId: string): Observable<void> {
        return this.http.post<void>(
            `${this.apiPathforfav}/favorites/add`, 
            { artistId },
            { withCredentials: true }
        );
    }

    removeFavorite(artistId: string): Observable<void> {
        return this.http.post<void>(
          `${this.apiPathforfav}/favorites/remove`,
          { artistId },
          { withCredentials: true }
        );
      
    }
}
