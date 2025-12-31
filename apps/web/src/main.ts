import { bootstrapApplication } from '@angular/platform-browser';
import { routes } from './app/app.routes';
import { App } from './app/app';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

bootstrapApplication(App, {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
  ]
})
  .catch((err) => console.error(err));
