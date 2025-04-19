import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Artist, Artwork, ArtCategory, ArtistService } from '../services/artist.service';
import { AuthService } from '../services/auth.service';
import { Observable,Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';


interface SearchArtist {
  id: string;
  name: string;
  image?: string;
}

interface DetailedArtist extends Artist {
  biography?: string;
  similarArtists?: { id: string; name: string; thumbnail?: string }[];
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  searchQuery = '';
  searchResults: SearchArtist[] = [];
  isLoading = false;
  showNoResults = false;

  isBioLoading = false;
  isArtworksLoading = false;
  isCategoriesLoading = false;

  // For inline artist detail view:
  selectedArtistId: string | null = null;
  selectedArtist?: DetailedArtist;
  artworks: Artwork[] = [];

  // UI state for tabs in the artist detail view:
  uiState = {
    activeTab: 'bio', // either 'bio' or 'works'
  };

  isInputFocused = false;
  isAuthenticated$: Observable<boolean>;
  // Private set to track favorites (by artist id)
  private favoriteArtistIds: Set<string> = new Set<string>();

  // === Modal for Artwork Categories ===
  isCategoryModalOpen = false;
  selectedArtwork: Artwork | null = null;
  artworkCategories: ArtCategory[] = [];

  // For unsubscribing observables
  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private artistService: ArtistService,
    private router: Router,  // not used for navigation now
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;

  }
 

  // === Search functionality ===
  onInputFocus() {
    this.isInputFocused = true;
  }

  onInputBlur() {
    this.isInputFocused = false;
  }

  ngOnInit(): void {
    // Subscribe to authentication status. When authenticated, load the current favorites.
    this.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuth => {
        if (isAuth) {
          this.artistService.getFavorites().subscribe({
            next: (favorites) => {
              // Assuming each favorite object contains an 'id'
              favorites.forEach(fav => {
                this.favoriteArtistIds.add(fav.id);
              });
            },
            error: (err) => {
              console.error('Error loading favorites:', err);
            }
          });
        } else {
          // Clear favorites if user is not logged in
          this.favoriteArtistIds.clear();
        }
      });
    const storedArtist = localStorage.getItem('selectedArtist');
  if (storedArtist) {
    this.selectedArtist = JSON.parse(storedArtist);
    this.selectedArtistId = this.selectedArtist?.id ?? null;  }

  // Restore UI state (like active tab) from localStorage.
  const storedUIState = localStorage.getItem('uiState');
  if (storedUIState) {
    this.uiState = JSON.parse(storedUIState);
  } else {
    // Otherwise, set default UI state.
    this.uiState = { activeTab: 'bio' };
  }

  // Clear the search input and results on page reload.
  this.searchQuery = '';
  this.searchResults = [];
  if (this.uiState.activeTab === 'works' && this.selectedArtistId) {
    this.loadArtworks();
  }
  }
  onTabChange(newTab: string): void {
    // Update UI state and persist it
    this.uiState.activeTab = newTab;
    localStorage.setItem('uiState', JSON.stringify(this.uiState));

    // If the works tab is selected, load artworks
    if (newTab === 'works' && this.selectedArtistId) {
      this.loadArtworks();
    }
  }
  private loadArtworks(): void {
    this.isArtworksLoading = true;
    this.artistService.getArtistArtworks(this.selectedArtistId!).subscribe({
      next: (works) => {
        this.artworks = works;
        this.isArtworksLoading = false;
      },
      error: (err) => {
        console.error('Error loading artworks:', err);
        this.isArtworksLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  onSearch(): void {
    if (!this.searchQuery.trim()) return;

    this.isLoading = true;
    this.showNoResults = false;
    this.selectedArtistId = null; // clear any previously selected artist
    this.selectedArtist = undefined;
    this.artworks = [];

    // Call your search endpoint
    this.http.get<{ artists: any[] }>(`${environment.backendUrl}/api/artsy/search?q=${encodeURIComponent(this.searchQuery)}`, {
      withCredentials: true
    }).subscribe({
      next: (response) => {
        // Map the results
        this.searchResults = response.artists.map(a => ({
          id: a.id,
          name: a.title,
          image: this.getValidImageUrl(a._links?.thumbnail?.href)
        }));
        this.showNoResults = this.searchResults.length === 0;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showNoResults = true;
      }
    });
  }

  onClear(): void {
    this.searchQuery = '';
    this.searchResults = [];
    this.selectedArtistId = null;
    this.selectedArtist = undefined;
    this.showNoResults = false;
  }

  // === Artist detail loading (inline) ===

  onArtistSelect(artistId: string): void {
    this.selectedArtistId = artistId;
    this.uiState.activeTab = 'bio';
    this.isBioLoading = true;
    // Get artist details (which will include similar artists if logged in)
    this.artistService.getArtistDetails(artistId).subscribe({
      next: (data) => {
        this.selectedArtist = data;
        localStorage.setItem('selectedArtist', JSON.stringify(data));
        this.isBioLoading = false;
      },
      error: (err) => {
        console.error('Artist detail error:', err);
        this.isBioLoading = false;
      }
    });
    this.isArtworksLoading = true;
    // Get artist artworks as before
    this.artistService.getArtistArtworks(artistId).subscribe({
      next: (works) => {
        this.artworks = works;
        this.isArtworksLoading = false;
      },
      error: (err) => {
        console.error('Artworks error:', err);
        this.isArtworksLoading = false;
      }
    });
  }

  private getValidImageUrl(url?: string): string | undefined {
    const missingImagePath = '/assets/shared/missing_image.png';
    return url?.includes(missingImagePath) ? 'assets/artsy_logo.svg' : url || 'assets/artsy_logo.svg'; // Default to artsy logo
  }
  // === Categories Modal Logic ===
  viewCategories(work: Artwork): void {
    // 1) Set the selected artwork
    this.selectedArtwork = work;
    this.artworkCategories = [];
    this.isCategoriesLoading = true;
    // 2) Open the modal
    this.isCategoryModalOpen = true;
    // 3) Fetch categories from backend
    this.artistService.getArtworkCategories(work.id).subscribe({
      next: (cats) => {
        this.artworkCategories = cats;
        this.isCategoriesLoading = false;
      },
      error: (err) => {
        console.error('Failed to fetch categories', err);
        this.isCategoriesLoading = false;
        // Optionally handle error
      }
    });
  }
  closeCategoryModal(): void {
    this.isCategoryModalOpen = false;
    this.selectedArtwork = null;
    this.artworkCategories = [];
  }
  // Check if the artist id is in the favorites set
  isFavorite(artistId: string): boolean {
    return this.favoriteArtistIds.has(artistId);
  }

  // Toggle favorite status for a given artist.
  // The event parameter is stopped from propagating so that the card click does not trigger artist selection.
  toggleFavorite(artist: any, event: Event): void {
    event.stopPropagation(); // Prevent card click from triggering onArtistSelect
    const artistId = artist.id;
    if (this.isFavorite(artistId)) {
      // Artist is already a favorite: remove it
      this.artistService.removeFavorite(artistId).subscribe({
        next: () => {
          this.favoriteArtistIds.delete(artistId);
          this.notificationService.showNotification('danger', 'Artist removed from favorites.');
          // Optional: show a "Removed from favorites" notification
        },
        error: (err) => {
          console.error('Error removing favorite:', err);
        }
      });
    } else {
      // Artist is not a favorite: add it
      this.artistService.addFavorite(artistId).subscribe({
        next: () => {
          this.favoriteArtistIds.add(artistId);
          this.notificationService.showNotification('success', 'Artist added to favorites.');

          // Optional: show an "Added to favorites" notification
        },
        error: (err) => {
          console.error('Error adding favorite:', err);
        }
      });
    }
  }
}

