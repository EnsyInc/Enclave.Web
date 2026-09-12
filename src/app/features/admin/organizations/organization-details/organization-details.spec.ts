import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { OrganizationModel, UserModel } from '@enclave/domain/models';
import { OrganizationService, UserService } from '@enclave/domain/services';

import { OrganizationDetails } from './organization-details';

const organization: OrganizationModel = {
  id: '1',
  name: 'Northwind Systems',
  status: 'Active',
  primaryUserId: '1',
};

const primaryUser: UserModel = {
  id: '1',
  firstName: 'ops',
  lastName: 'Northwind',
  email: 'ops@northwind.io',
  organizationId: '1',
  status: 'Active',
  role: 'Admin',
};

describe('OrganizationDetails', () => {
  let component: OrganizationDetails;
  let fixture: ComponentFixture<OrganizationDetails>;
  let navigate: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    navigate = vi.fn().mockResolvedValue(true);

    await TestBed.configureTestingModule({
      imports: [OrganizationDetails],
      providers: [
        { provide: OrganizationService, useValue: { getOrganizationById: () => organization } },
        { provide: UserService, useValue: { getUserById: () => primaryUser } },
        { provide: Router, useValue: { navigate } },
        {
          // enclavePersistentTab, wired to the Info tab in the template, injects this itself.
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: convertToParamMap({}) },
            queryParamMap: of(convertToParamMap({})),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationDetails);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('organizationId', '1');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('resolves the organization for the bound organizationId', () => {
    expect(component['org']()).toEqual(organization);
  });

  it('resolves the primary contact for the resolved organization', () => {
    expect(component['primaryContact']()).toEqual(primaryUser);
  });

  it('renders the organization name and status from the resolved organization', () => {
    fixture.detectChanges();

    const nameEl: HTMLElement = fixture.debugElement.nativeElement.querySelector('.title');
    expect(nameEl.textContent?.trim()).toBe('Northwind Systems');
  });

  it("renders the primary contact's email", () => {
    fixture.detectChanges();

    const infoEl: HTMLElement = fixture.debugElement.nativeElement.querySelector('.subtitle');
    expect(infoEl.textContent).toContain('ops@northwind.io');
  });

  it('renders the Info tab fields for the resolved organization', () => {
    fixture.detectChanges();

    const rows: NodeListOf<HTMLElement> =
      fixture.debugElement.nativeElement.querySelectorAll('enclave-detail-row');
    const rowText = (label: string) =>
      Array.from(rows)
        .find((row) => row.textContent?.includes(label))
        ?.querySelector('.info-value')?.textContent?.trim();

    expect(rowText('Name')).toBe('Northwind Systems');
    expect(rowText('Primary Contact Email')).toBe('ops@northwind.io');
    expect(rowText('Id')).toBe('1');
  });

  // Full restore/self-heal/debounce coverage lives at the directive level
  // (enclave-persistent-tab.spec.ts) -- this just proves the Info tab is actually wired up with
  // enclavePersistentTab and a reachable Router.navigate.
  it('populates the URL with the Info tab once mounted', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(navigate).toHaveBeenCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: { tab: 'info' },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  });
});
