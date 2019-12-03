import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { UIErrorHandler, ModalContentComponent } from './error-handler';
import { AppComponent } from './app.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from '../environments/environment';
import { RetroBoardComponent } from './components/retro-board/retro-board.component';
import { LoginComponent } from './components/login/login.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { AuthGuard } from './guards/auth.guard';
import { MyDashboardComponent } from './components/my-dashboard/my-dashboard.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TheHeaderComponent } from './components/the-header/the-header.component';
import { RetroboardDetailsModalComponent } from './components/retro-board-details-modal/retro-board-details-modal.component';

import { MatInputModule } from '@angular/material';
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
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatPaginatorModule} from '@angular/material/paginator';

import { ThemePickerComponent } from './components/theme-picker/theme-picker.component';
import { ThemeStorage } from './components/theme-picker/theme-storage/theme-storage';
import { StyleManager } from './components/style-manager';

const appRoutes: Routes = [
  {
    path: 'retroboard/:id',
    canActivate: [AuthGuard],
    component: RetroBoardComponent
  },
  {
    path: 'home',
    canActivate: [AuthGuard],
    component: MyDashboardComponent
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
    MyDashboardComponent,
    ModalContentComponent,
    TheHeaderComponent,
    ThemePickerComponent,
    RetroboardDetailsModalComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    FormsModule,
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
    MatPaginatorModule
  ],
  entryComponents: [ModalContentComponent, RetroboardDetailsModalComponent],
  providers: [
    AuthGuard,
    StyleManager,
    ThemeStorage,
    {
      provide: ErrorHandler,
      useClass: UIErrorHandler
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
