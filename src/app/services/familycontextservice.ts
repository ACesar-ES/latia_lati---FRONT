import { afterNextRender, computed, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  catchError,
  forkJoin,
  from,
  map,
  mergeMap,
  of,
  Subscription,
  switchMap,
  throwError,
  toArray,
} from 'rxjs';
import { UsersService } from './usuarioservice';
import { Loginservice } from './loginservice';
import { Healthprofileservice } from './healthprofileservice';
import { FamilyRelationshipService } from './familyrelationshipservice';
import { HealthprofileDTO } from '../model/HealthprofileDTO';
import { UsersResponseDTO } from '../model/UsersResponseDTO';
import { FamilyrelationshipDTO } from '../model/FamilyrelationshipDTO';
import { relationshipTo } from '../utils/family-tree';

interface TabPreferences {
  active?: number;
  aliases?: Record<number, string>;
}
@Injectable({ providedIn: 'root' })
export class FamilyContextService {
  readonly phase = signal<'idle' | 'loading' | 'ready' | 'error' | 'signedOut'>('idle');
  readonly account = signal<UsersResponseDTO | null>(null);
  readonly profiles = signal<HealthprofileDTO[]>([]);
  readonly links = signal<FamilyrelationshipDTO[]>([]);
  private readonly names = signal<Record<number, string>>({});
  private readonly aliases = signal<Record<number, string>>({});
  private readonly selected = signal<number | null>(null);
  readonly root = computed(
    () => this.profiles().find((p) => p.idHolderUser === this.account()?.idUser) ?? null,
  );
  readonly active = computed(
    () => this.profiles().find((p) => p.idHealthProfile === this.selected()) ?? null,
  );
  readonly activeId = computed(() =>
    this.phase() === 'ready' ? (this.active()?.idHealthProfile ?? null) : null,
  );
  readonly sorted = computed(() => {
    const root = this.root()?.idHealthProfile;
    return [...this.profiles()].sort(
      (a, b) =>
        Number(b.idHealthProfile === root) - Number(a.idHealthProfile === root) ||
        this.label(a.idHealthProfile).localeCompare(this.label(b.idHealthProfile), 'es'),
    );
  });
  private browserReady = false;
  private requested = false;
  private session = '';
  private request?: Subscription;
  constructor(
    private users: UsersService,
    private auth: Loginservice,
    private health: Healthprofileservice,
    private family: FamilyRelationshipService,
  ) {
    // Keep the initial server and client view identical until browser storage is available.
    afterNextRender(() => {
      this.browserReady = true;
      if (this.requested) this.load();
    });
    this.auth.sessionChanged$.pipe(takeUntilDestroyed()).subscribe(() => {
      this.clear(true);
      this.users.limpiar();
      this.load();
    });
  }
  private key(owner: number): string {
    return 'latia.family.tab.' + owner;
  }
  private saved(owner: number): TabPreferences {
    try {
      return JSON.parse(sessionStorage.getItem(this.key(owner)) || '{}') || {};
    } catch {
      return {};
    }
  }
  private remember(): void {
    const id = this.account()?.idUser;
    try {
      if (id)
        sessionStorage.setItem(
          this.key(id),
          JSON.stringify({ active: this.selected(), aliases: this.aliases() }),
        );
    } catch {}
  }
  private clear(forget: boolean): void {
    this.request?.unsubscribe();
    const id = this.account()?.idUser;
    try {
      if (forget && id) sessionStorage.removeItem(this.key(id));
    } catch {}
    this.session = '';
    this.account.set(null);
    this.profiles.set([]);
    this.links.set([]);
    this.names.set({});
    this.aliases.set({});
    this.selected.set(null);
    this.phase.set('idle');
  }
  load(force = false): void {
    if (!this.browserReady) {
      this.requested = true;
      return;
    }
    const token = this.auth.getToken() ?? '';
    if (!token) {
      this.clear(true);
      this.phase.set('signedOut');
      return;
    }
    if (token !== this.session) {
      this.clear(!!this.session);
      this.session = token;
    } else if (!force && this.phase() !== 'idle') return;
    this.request?.unsubscribe();
    this.phase.set('loading');
    this.request = this.users
      .cargarUsuarioActual()
      .pipe(
        switchMap((account) =>
          this.health.listOwned().pipe(
            catchError((e) =>
              e.status === 404 ? of([] as HealthprofileDTO[]) : throwError(() => e),
            ),
            switchMap((all) => {
              const profiles = all.filter((p) => p.active && p.idOwnerUser === account.idUser);
              const ids = new Set(profiles.map((p) => p.idHealthProfile));
              const holders = [
                ...new Set(
                  profiles
                    .map((p) => p.idHolderUser)
                    .filter((i): i is number => !!i && i !== account.idUser),
                ),
              ];
              return forkJoin({
                edges: from(profiles).pipe(
                  mergeMap((p) => this.family.byProfile(p.idHealthProfile), 4),
                  toArray(),
                ),
                names: from(holders).pipe(
                  mergeMap(
                    (id) =>
                      this.users.listId(id).pipe(
                        map((u) => [id, (u.firstName + ' ' + u.lastName).trim()] as const),
                        catchError(() => of([id, ''] as const)),
                      ),
                    4,
                  ),
                  toArray(),
                ),
              }).pipe(
                map(({ edges, names }) => ({
                  account,
                  profiles,
                  names: Object.fromEntries(names),
                  links: [
                    ...new Map(
                      edges
                        .flat()
                        .filter((e) => ids.has(e.idOriginProfile) && ids.has(e.idRelativeProfile))
                        .map((e) => [e.idFamilyRelationship, e] as const),
                    ).values(),
                  ],
                })),
              );
            }),
          ),
        ),
      )
      .subscribe({
        next: (s) => {
          if (this.auth.getToken() !== token) return;
          this.account.set(s.account);
          this.profiles.set(s.profiles);
          this.links.set(s.links);
          this.names.set(s.names);
          const pref = this.saved(s.account.idUser),
            aliases = { ...pref.aliases, ...this.aliases() };
          this.aliases.set(
            Object.fromEntries(
              s.profiles
                .map((p) => [p.idHealthProfile, aliases[p.idHealthProfile]])
                .filter(([, v]) => typeof v === 'string'),
            ),
          );
          const target = this.selected() ?? pref.active;
          this.selected.set(
            s.profiles.some((p) => p.idHealthProfile === target)
              ? target!
              : (this.root()?.idHealthProfile ?? null),
          );
          this.phase.set('ready');
          this.remember();
        },
        error: () => {
          if (this.auth.getToken() === token) {
            this.profiles.set([]);
            this.links.set([]);
            this.selected.set(null);
            this.phase.set('error');
          }
        },
      });
  }
  owns(id: number | null): boolean {
    return this.profiles().some((p) => p.idHealthProfile === id);
  }
  select(id: number): boolean {
    if (this.phase() !== 'ready' || this.auth.getToken() !== this.session || !this.owns(id))
      return false;
    this.selected.set(id);
    this.remember();
    return true;
  }
  acceptCreated(p: HealthprofileDTO, owner: number, alias: string): boolean {
    if (
      !Number.isInteger(p.idHealthProfile) ||
      p.idHealthProfile <= 0 ||
      this.auth.getToken() !== this.session ||
      this.account()?.idUser !== owner
    )
      return false;
    if (!this.owns(p.idHealthProfile))
      this.profiles.update((rows) => [
        ...rows,
        { ...p, idOwnerUser: owner, idHolderUser: null, active: true },
      ]);
    if (alias.trim())
      this.aliases.update((values) => ({
        ...values,
        [p.idHealthProfile]: alias.trim().slice(0, 80),
      }));
    this.remember();
    return true;
  }
  acceptLink(link: FamilyrelationshipDTO): void {
    if (
      this.auth.getToken() === this.session &&
      this.owns(link.idOriginProfile) &&
      this.owns(link.idRelativeProfile)
    )
      this.links.update((rows) => [
        ...rows.filter((e) => e.idFamilyRelationship !== link.idFamilyRelationship),
        link,
      ]);
  }
  role(id: number): string {
    const root = this.root();
    return root ? relationshipTo(this.links(), root.idHealthProfile, id) : 'Perfil administrado';
  }
  label(id: number): string {
    const p = this.profiles().find((row) => row.idHealthProfile === id),
      u = this.account();
    if (!p) return 'Perfil no disponible';
    if (u && p.idHolderUser === u.idUser)
      return (u.firstName + ' ' + u.lastName).trim() || 'Mi perfil';
    return (
      (p.idHolderUser && this.names()[p.idHolderUser]) ||
      this.aliases()[id] ||
      this.role(id) + ' · perfil ' + id
    );
  }
  initials(id: number): string {
    const w = this.label(id).split(' · ')[0].trim().split(/\s+/);
    return ((w[0]?.[0] || 'P') + (w.length > 1 ? w[w.length - 1][0] : '')).toUpperCase();
  }
}
