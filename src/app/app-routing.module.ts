import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AngularFireAuthGuard } from '@angular/fire/auth-guard';

import { LandingPageComponent } from '@components/landing-page/landing-page.component';
import { ProfileComponent } from '@components/profile/profile.component';
import { HomeComponent } from '@components/home/home.component';
import { SavedPostsComponent } from '@components/saved-posts/saved-posts.component';
import { ViewProfileComponent } from '@components/view-profile/view-profile.component';
import { NotificationsComponent } from '@components/notifications/notifications.component';

const routes: Routes = [
    {path: '', redirectTo: '/landing-page', pathMatch: 'full'},
    {path: 'landing-page', component: LandingPageComponent},
    {path: 'profile', component: ProfileComponent, canActivate: [AngularFireAuthGuard]},
    {path: 'home', component: HomeComponent, canActivate: [AngularFireAuthGuard]},
    {path: 'saved', component: SavedPostsComponent, canActivate: [AngularFireAuthGuard]},
    {path: 'view-profile/:id', component: ViewProfileComponent, canActivate: [AngularFireAuthGuard]},
    {path: 'notifications', component: NotificationsComponent, canActivate: [AngularFireAuthGuard]},
];
// VIEW POST 2 IULIE

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
