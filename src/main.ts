import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from '@enclave/app.config';
import { App } from '@enclave/app';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
