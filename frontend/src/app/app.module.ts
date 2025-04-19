import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { NavbarComponent } from './navbar/navbar.component';
import { SearchComponent } from './search/search.component';
import { ArtistComponent } from './artist/artist.component';
import { FavoriteComponent } from './favorite/favorite.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { NotificationComponent } from './notification/notification.component';

import { AuthService } from './services/auth.service';
import { ArtistService } from './services/artist.service';
// import { AuthGuard } from './services/auth.guard';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap'; 

@NgModule({
    declarations: [
        AppComponent,
        NavbarComponent,
        SearchComponent,
        ArtistComponent,
        FavoriteComponent,
        LoginComponent,
        RegisterComponent,
        NotificationComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutingModule,
        NgbModule 
    ],
    providers: [
        AuthService,
        ArtistService,
        // AuthGuard
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}