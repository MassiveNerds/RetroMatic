import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { GlobalErrorHandlerModalComponent } from './components/global-error-handler-modal/global-error-handler-modal.component';
import { UIErrorHandler } from './components/global-error-handler-modal/ui-error-handler';
import { AppComponent } from './app.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { environment } from '../environments/environment';
import { RetroBoardComponent } from './components/retroboard/retroboard.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { AuthGuard } from './guards/auth.guard';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TheHeaderComponent } from './components/the-header/the-header.component';
import { CreateUpdateRetroModalComponent } from './components/create-update-retro-modal/create-update-retro-modal.component';

import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';

import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { TransitionGroupItemDirective } from './directives/transition-group-item.directive';
import { TransitionGroupComponent } from './components/transition-group/transition-group.component';
import { AppShellComponent } from './components/app-shell/app-shell.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ExportDialogComponent } from './components/export-dialog/export-dialog.component';

const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'resetpassword', component: ResetPasswordComponent },
  {
    path: 'app',
    component: AppShellComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'retro/:id', component: RetroBoardComponent },
      { path: '', component: WelcomeComponent },
    ],
  },
  // Legacy redirects
  { path: 'home', redirectTo: '/app', pathMatch: 'full' },
  // Note: Angular redirectTo does not forward route params — :id is lost on redirect.
  // Legacy /retroboard/:id links will land on /app/retro/:id without the id.
  { path: 'retroboard/:id', redirectTo: '/app/retro/:id', pathMatch: 'full' },
  { path: '', redirectTo: '/app', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    RetroBoardComponent,
    LoginComponent,
    RegisterComponent,
    ResetPasswordComponent,
    PageNotFoundComponent,
    WelcomeComponent,
    GlobalErrorHandlerModalComponent,
    TheHeaderComponent,
    CreateUpdateRetroModalComponent,
    TransitionGroupItemDirective,
    TransitionGroupComponent,
    AppShellComponent,
    SidebarComponent,
    ExportDialogComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false } // <-- debugging purposes only
    ),
    MatToolbarModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatDialogModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatMenuModule,
    MatExpansionModule,
    MatBadgeModule,
    MatGridListModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatSelectModule,
    MatDividerModule,
  ],
  providers: [
    AuthGuard,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideDatabase(() => getDatabase()),
    provideAuth(() => getAuth()),
    {
      provide: ErrorHandler,
      useClass: UIErrorHandler,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
