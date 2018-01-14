import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { UIErrorHandler, ModalContentComponent } from './error-handler';
import { AppComponent } from './app.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { environment } from '../environments/environment';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { RetroBoardComponent } from './retro-board/retro-board.component';
import { LoginComponent } from './login/login.component';
import { AlertModule } from 'ngx-bootstrap/alert';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { AuthGuard } from './auth.guard';
import { ModalModule } from 'ngx-bootstrap/modal';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { CountdownTimerComponent } from './countdown-timer/countdown-timer.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ExportingComponent } from './exporting/exporting.component';

const appRoutes: Routes = [
  {
    path: 'retroboard/:id',
    canActivate: [AuthGuard],
    component: RetroBoardComponent
  },
  {
    path: 'home',
    canActivate: [AuthGuard],
    component: UserDetailComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    redirectTo: '/home',
    canActivate: [AuthGuard],
    pathMatch: 'full'
  },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    RetroBoardComponent,
    LoginComponent,
    PageNotFoundComponent,
    UserDetailComponent,
    CountdownTimerComponent,
    ExportingComponent,
    ModalContentComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    FormsModule,
    ButtonsModule.forRoot(),
    AlertModule.forRoot(),
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false } // <-- debugging purposes only
    ),
    ModalModule.forRoot()
  ],
  entryComponents: [
    ModalContentComponent
  ],
  providers: [
    AuthGuard,
    {
      provide: ErrorHandler,
      useClass: UIErrorHandler
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
