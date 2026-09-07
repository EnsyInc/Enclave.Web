import { ComponentFixture, TestBed } from '@angular/core/testing';

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationDetails],
      providers: [
        { provide: OrganizationService, useValue: { getOrganizationById: () => organization } },
        { provide: UserService, useValue: { getUserById: () => primaryUser } },
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

    const nameEl: HTMLElement = fixture.debugElement.nativeElement.querySelector('.org-name');
    expect(nameEl.textContent?.trim()).toBe('Northwind Systems');
  });

  it("renders the primary contact's email", () => {
    fixture.detectChanges();

    const infoEl: HTMLElement = fixture.debugElement.nativeElement.querySelector('.org-info');
    expect(infoEl.textContent).toContain('ops@northwind.io');
  });
});
