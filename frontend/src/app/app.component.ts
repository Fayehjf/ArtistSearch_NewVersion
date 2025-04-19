import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    ngOnInit() {
        console.log('AppComponent initialized'); 
    }
    isLoading = false;
}