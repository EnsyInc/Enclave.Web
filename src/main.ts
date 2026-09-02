import { bootstrapApplication } from '@angular/platform-browser';

import { App } from '@enclave/app';
import { appConfig } from '@enclave/app.config';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
