---
applyTo: "frontend/**"
---

# Frontend Guidelines

## Angular Application Structure

### Folder Organization

```
src/
├── app/
│   ├── components/
│   │   ├── user/
│   │   └── product/
│   ├── services/
│   │   ├── user.service.ts
│   │   └── product.service.ts
│   ├── models/
│   │   ├── user.model.ts
│   │   └── product.model.ts
│   └── pages/
│       ├── home/
│       └── dashboard/
├── assets/
└── environments/
```

### Component Structure

#### 1. Components
- Keep components small and focused
- Use OnPush change detection when possible
- Handle UI logic only, delegate business logic to services

#### 2. Services
- Handle API calls and business logic
- Use dependency injection
- Return Observables for async operations

#### 3. Models
- Define TypeScript interfaces for data structures
- Use for type safety and IntelliSense

### Angular Patterns

#### Component Example
```typescript
@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserComponent {
  constructor(private userService: UserService) {}
}
```

#### Service Example
```typescript
@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}
  
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
  }
}
```

### Naming Conventions

- Components: `user.component.ts`
- Services: `user.service.ts`
- Models: `user.model.ts`
- Modules: `user.module.ts`

### Simple Workflow

1. **Create Model** → Define data structure
2. **Create Service** → Handle API calls
3. **Create Component** → Handle UI and user interactions
4. **Update Module** → Register components and services
