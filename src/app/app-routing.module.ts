import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AngularFireAuthGuard } from '@angular/fire/auth-guard';

import { LandingPageComponent } from '@components/landing-page/landing-page.component';
import { ProfileComponent } from '@components/profile/profile.component';
import { HomeComponent } from '@components/home/home.component';

const routes: Routes = [
    {path: '', redirectTo: '/landing-page', pathMatch: 'full'},
    {path: 'landing-page', component: LandingPageComponent},
    {path: 'profile', component: ProfileComponent, canActivate: [AngularFireAuthGuard]},
    {path: 'home', component: HomeComponent, canActivate: [AngularFireAuthGuard]},
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
