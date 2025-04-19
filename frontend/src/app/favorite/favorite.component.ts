import { Component, OnDestroy, OnInit } from '@angular/core';
import { ArtistService } from '../services/artist.service';
import { Subject, interval, takeUntil } from 'rxjs';

interface CollectionItem {
    identifier: string;
    displayName: string;
    timestamp: number;
    thumbnailUrl?: string;
    birthday?: string;
  deathday?: string;
  nationality?: string;
}

@Component({
    selector: 'app-favorite',
    templateUrl: './favorite.component.html',
    styleUrls: ['./favorite.component.scss']
})
export class FavoriteComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    state = {
        isLoading: true,
        collectionItems: [] as CollectionItem[],
        errorMessage: '',
        hasItems: false
    };

    constructor(private artistService: ArtistService) {}

    ngOnInit(): void {
        this.initializeCollection();
        this.setupTimeUpdates();
    }

    private initializeCollection(): void {
        this.artistService.getFavorites().subscribe({
            next: items => this.handleCollectionResponse(items),
            error: err => this.handleCollectionError(err)
        });
    }

    private handleCollectionResponse(items: any[]): void {
        this.state = {
            ...this.state,
            isLoading: false,
            collectionItems: this.processCollectionItems(items),
            hasItems: items.length > 0
        };
    }

    private processCollectionItems(items: any[]): CollectionItem[] {
        return items
            .map(item => ({
                identifier: item.artistId,
        displayName: item.name,
        birthday: item.birthday,
        deathday: item.deathday,
        nationality: item.nationality,
        timestamp: new Date(item.addedAt).getTime(),
        thumbnailUrl: item.thumbnail ? item.thumbnail : 'assets/artsy_logo.svg'
    }))
            .sort((a, b) => b.timestamp - a.timestamp);
    }

    private handleCollectionError(error: any): void {
        this.state = {
            ...this.state,
            isLoading: false,
            errorMessage: 'Failed to load collection',
            hasItems: false
        };
        console.error('Collection error:', error);
    }

    removeFromCollection(itemId: string): void {
        this.artistService.removeFavorite(itemId).subscribe({
            next: () => this.updateLocalCollection(itemId),
            error: err => this.state.errorMessage = 'Removal failed'
        });
    }

    private updateLocalCollection(itemId: string): void {
        this.state.collectionItems = this.state.collectionItems
            .filter(item => item.identifier !== itemId);
        this.state.hasItems = this.state.collectionItems.length > 0;
    }

    calculateTimeDifference(timestamp: number): string {
        const currentTime = Date.now();
        const diffSeconds = Math.floor((currentTime - timestamp) / 1000);
        
        const timeUnits = [
            { unit: 'year', seconds: 31536000 },
            { unit: 'month', seconds: 2592000 },
            { unit: 'day', seconds: 86400 },
            { unit: 'hour', seconds: 3600 },
            { unit: 'minute', seconds: 60 }
        ];

        for (const { unit, seconds } of timeUnits) {
            const count = Math.floor(diffSeconds / seconds);
            if (count >= 1) {
                return `${count} ${unit}${count > 1 ? 's' : ''} ago`;
            }
        }
        return `${diffSeconds} second${diffSeconds !== 1 ? 's' : ''} ago`;
    }

    private setupTimeUpdates(): void {
        interval(1000)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.state.collectionItems = [...this.state.collectionItems];
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}