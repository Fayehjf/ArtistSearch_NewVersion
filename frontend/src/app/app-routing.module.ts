import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchComponent } from './search/search.component';
import { ArtistComponent } from './artist/artist.component';
import { FavoriteComponent } from './favorite/favorite.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
// import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
    { 
        path: '', 
        redirectTo: '/search', 
        pathMatch: 'full' 
    },
    { 
        path: 'search', 
        component: SearchComponent 
    },
    { 
        path: 'artist/:id', 
        component: ArtistComponent 
    },
    { 
        path: 'favorites', 
        component: FavoriteComponent,
        // canActivate: [AuthGuard] 
    },
    { 
        path: 'login', 
        component: LoginComponent 
    },
    { 
        path: 'register', 
        component: RegisterComponent 
    },
    { 
        path: '**', 
        redirectTo: '/search' 
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}