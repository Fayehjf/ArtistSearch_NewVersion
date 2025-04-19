import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ArtistService } from '../services/artist.service';

interface ArtistProfile {
    id: string;
    name: string;
    birthYear?: string;
    deathYear?: string;
    nationality?: string;
    biography?: string;
    thumbnail?: string;
}

interface Artwork {
    id: string;
    title: string;
    date?: string;
    image?: string;
}

interface ArtCategory {
    id?: string;
    name: string;
    image?: string;
}

@Component({
    selector: 'app-artist-profile',
    templateUrl: './artist.component.html',
    styleUrls: ['./artist.component.scss']
})
export class ArtistComponent implements OnInit, OnDestroy {
    private routeSub?: Subscription;
    artistId: string = '';
    currentArtist?: ArtistProfile;
    artworks: Artwork[] = [];
    similarArtists: ArtistProfile[] = [];
    currentCategories: ArtCategory[] = [];
    
    loadingStates: { [key: string]: boolean } = {
        artist: false,
        artworks: false,
        categories: false
    };

    uiState = {
        activeTab: 'bio',
        showCategoryModal: false,
        modalTitle: ''
    };

    collectionState = {
        isFavorite: false,
        error: ''
    };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        private artistService: ArtistService,
    ) {}

    ngOnInit(): void {
        this.routeSub = this.route.params.subscribe(params => {
        this.artistId = params['id'];
        this.loadArtistData();
        });
    }

    ngOnDestroy(): void {
        this.routeSub?.unsubscribe();
    }

    private loadArtistData(): void {
        this.loadArtistProfile();
        this.loadArtistWorks();
    }

    private loadArtistProfile(): void {
        this.loadingStates.artist = true;
        this.artistService.getArtistDetails(this.artistId).subscribe({
            next: (data) => {
                this.currentArtist = data;
                this.checkFavoriteState();
                this.loadSimilarArtists();
                this.loadingStates.artist = false;
            },
            error: (err) => this.handleError(err, 'artist')
        });
    }

    private loadArtistWorks(): void {
        if (!this.artworks.length) { // only fetch if not already loaded
            this.loadingStates.artworks = true;
            this.artistService.getArtistArtworks(this.artistId).subscribe({
              next: (works) => {
                this.artworks = works;
                this.loadingStates.artworks = false;
              },
              error: (err) => {
                this.loadingStates.artworks = false;
                this.collectionState.error = 'Failed to load artworks data';
              }
            });
          }
    }

    private loadSimilarArtists(): void {
        if (this.authService.isLoggedIn) {
            this.artistService.getSimilarArtists(this.artistId).subscribe({
                next: (artists) => this.similarArtists = artists,
                error: (err) => console.error('Similar artists error:', err)
            });
        }
    }

    private checkFavoriteState(): void {
        if (this.authService.isLoggedIn && this.currentArtist) {
            this.artistService.getFavorites().subscribe(favs => {
                this.collectionState.isFavorite = favs.some(a => a.id === this.currentArtist?.id);
            });
        }
    }

    toggleFavorite(): void {
        if (!this.currentArtist) return;
        
        if (this.collectionState.isFavorite) {
            this.artistService.removeFavorite(this.currentArtist.id);
        } else {
            this.artistService.addFavorite(this.currentArtist.id).subscribe(() => {
                this.collectionState.isFavorite = true;
            });
        }
        this.collectionState.isFavorite = !this.collectionState.isFavorite;
    }

    viewCategories(artwork: Artwork): void {
        this.uiState.modalTitle = artwork.title;
        this.uiState.showCategoryModal = true;
        this.loadingStates.categories = true;

        this.artistService.getArtworkCategories(artwork.id).subscribe({
            next: (categories) => {
                this.currentCategories = categories;
                this.loadingStates.categories = false;
            },
            error: (err) => this.handleError(err, 'categories')
        });
    }

    private handleError(error: any, context: string): void {
        console.error(`${context} load error:`, error);
        this.loadingStates[context] = false;
        this.collectionState.error = `Failed to load ${context} data`;
    }
}