import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LandingPageComponent} from './components/landing-page/landing-page.component';
import {ProfileComponent} from './components/profile/profile.component';

const routes: Routes = [
    {path: '', redirectTo: '/landing-page', pathMatch: 'full'},
    {path: 'landing-page', component: LandingPageComponent},
    {path: 'profile', component: ProfileComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
