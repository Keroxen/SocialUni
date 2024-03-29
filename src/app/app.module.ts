import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireModule } from '@angular/fire';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxPaginationModule } from 'ngx-pagination';
import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { ToastrModule, ToastContainerModule } from 'ngx-toastr';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';


import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainNavComponent } from '@components/main-nav/main-nav.component';
import { LandingPageComponent } from '@components/landing-page/landing-page.component';
import { ProfileComponent } from '@components/profile/profile.component';
import { AuthDialogComponent } from '@components/auth-dialog/auth-dialog.component';
import { HomeComponent } from '@components/home/home.component';
import { MatNativeDateModule } from '@angular/material/core';
import { AuthService } from '@services/auth.service';
import { DataService } from '@services/data.service';
import { NewPostComponent } from '@components/new-post/new-post.component';
import { SnackbarComponent } from '@shared/components/snackbar/snackbar.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SavedPostsComponent } from '@components/saved-posts/saved-posts.component';
import { ReactionsListComponent } from '@shared/components/reactions-list/reactions-list.component';
import { ViewProfileComponent } from '@components/view-profile/view-profile.component';
import { SearchComponent } from '@components/search/search.component';
import { MessagingService } from '@services/messaging.service';
import { NotificationsComponent } from '@components/notifications/notifications.component';
import { ViewPostComponent } from '@components/view-post/view-post.component';

export function HttpLoaderFactory(httpClient: HttpClient): TranslateHttpLoader {
    return new TranslateHttpLoader(httpClient);
}

@NgModule({
    declarations: [
        AppComponent,
        MainNavComponent,
        LandingPageComponent,
        ProfileComponent,
        AuthDialogComponent,
        HomeComponent,
        NewPostComponent,
        SnackbarComponent,
        SavedPostsComponent,
        ReactionsListComponent,
        ViewProfileComponent,
        SearchComponent,
        NotificationsComponent,
        ViewPostComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        LayoutModule,
        MatToolbarModule,
        MatButtonModule,
        MatSidenavModule,
        MatIconModule,
        MatListModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        HttpClientModule,
        MatDialogModule,
        MatAutocompleteModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFirestoreModule,
        AngularFireMessagingModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatMenuModule,
        MatCheckboxModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        NgxPaginationModule,
        FormsModule,
        ToastrModule.forRoot({
            positionClass: 'inline',
        }),
        ToastContainerModule,
        TranslateModule.forRoot({
            defaultLanguage: 'en',
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient],
            },
        })
    ],
    providers: [AuthService, DataService, MessagingService],
    bootstrap: [AppComponent],
})
export class AppModule {
}
